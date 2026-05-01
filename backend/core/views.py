from decimal import Decimal
import math
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db.models import Q, Sum, Count
from django.utils import timezone

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.filters import OrderingFilter

from rest_framework_simplejwt.views import (
    TokenObtainPairView as SimpleJWTTokenObtainPairView, 
    TokenRefreshView as SimpleJWTTokenRefreshView
)
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import Order, TripMetrics, LocationLog
from core.serializers import (
    UserSerializer, OrderSerializer, LocationLogSerializer,
    DemandCenterSerializer, UserRegisterSerializer, LoginSerializer
)

User = get_user_model()

# --- PERMISSIONS ---

class IsRiderPermission(permissions.BasePermission):
    """Custom permission to only allow users with user_type RIDER."""
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.user_type == User.UserType.RIDER
        )

# --- AUTHENTICATION VIEWS ---

class UserRegisterView(generics.CreateAPIView):
    """Handles Rider registration and returns immediate JWT credentials."""
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UserSerializer(user, context={"request": request}).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }, status=status.HTTP_201_CREATED)

class UserLoginView(generics.GenericAPIView):
    """Phone-based login handler returning user data and tokens."""
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UserSerializer(user, context={"request": request}).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        })

class TokenRefreshView(SimpleJWTTokenRefreshView):
    pass

class TokenObtainPairView(SimpleJWTTokenObtainPairView):
    pass

# --- RIDER PROFILE & ANALYTICS ---

class RiderProfileView(generics.RetrieveUpdateAPIView):
    """View or update the authenticated rider's profile."""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsRiderPermission]

    def get_object(self):
        return self.request.user

class RiderAnalyticsView(APIView):
    """Provides earnings and performance metrics for the rider dashboard."""
    permission_classes = [IsAuthenticated, IsRiderPermission]

    def get(self, request):
        today = timezone.now().date()
        seven_days_ago = today - timedelta(days=7)

        delivered_orders = Order.objects.filter(rider=request.user, status=Order.Status.DELIVERED)
        
        stats = delivered_orders.aggregate(
            all_time_balance=Sum('trip_metrics__total_fare'),
            today_total=Sum('trip_metrics__total_fare', filter=Q(updated_at__date=today)),
            week_total=Sum('trip_metrics__total_fare', filter=Q(updated_at__date__gte=seven_days_ago)),
            today_count=Count('id', filter=Q(updated_at__date=today))
        )

        return Response({
            "daily_total": stats['today_total'] or Decimal('0.00'),
            "completed_trips": stats['today_count'] or 0,
            "balance": stats['all_time_balance'] or Decimal('0.00'),
            "this_week": stats['week_total'] or Decimal('0.00'),
            "radar_data": [
                {"subject": "Punctuality", "value": 4.5},
                {"subject": "Safety", "value": 4.8},
                {"subject": "Efficiency", "value": 4.0},
            ]
        })

# --- ORDER MANAGEMENT ---

class NearbyOrdersView(generics.ListAPIView):
    """Lists PENDING orders sorted by proximity using the Haversine formula."""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsRiderPermission]

    def get_queryset(self):
        return Order.objects.filter(
            status=Order.Status.PENDING, 
            rider__isnull=True
        ).select_related('customer').prefetch_related('trip_metrics')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')

        if lat and lng:
            try:
                r_lat, r_lng = Decimal(lat), Decimal(lng)
                orders_data = []
                for order in queryset:
                    dist = self._haversine(r_lat, r_lng, order.pickup_latitude, order.pickup_longitude)
                    data = OrderSerializer(order, context={'request': request}).data
                    data['distance_from_rider'] = round(dist, 2)
                    orders_data.append(data)
                
                orders_data.sort(key=lambda x: x.get('distance_from_rider', 0))
                return Response(orders_data)
            except (ValueError, TypeError):
                return Response({"detail": "Invalid coordinates"}, status=400)

        return super().list(request, *args, **kwargs)

    def _haversine(self, lat1, lon1, lat2, lon2):
        R = 6371  # Earth radius in km
        dLat = math.radians(float(lat2 - lat1))
        dLon = math.radians(float(lon2 - lon1))
        a = math.sin(dLat/2)**2 + math.cos(math.radians(float(lat1))) * \
            math.cos(math.radians(float(lat2))) * math.sin(dLon/2)**2
        return R * (2 * math.atan2(math.sqrt(a), math.sqrt(1-a)))

class OrderAcceptView(APIView):
    """Atomic assignment of a pending order to the authenticated rider."""
    permission_classes = [IsAuthenticated, IsRiderPermission]

    def post(self, request, pk):
        order = get_object_or_404(Order, pk=pk, status=Order.Status.PENDING, rider__isnull=True)
        
        order.rider = request.user
        order.status = Order.Status.PICKED_UP
        order.save()

        # Initialize fare tracking
        TripMetrics.objects.get_or_create(
            order=order,
            defaults={'base_fare': Decimal('10.00'), 'total_fare': Decimal('10.00')}
        )

        return Response(OrderSerializer(order, context={"request": request}).data)

class OrderCompleteView(APIView):
    """Rider marks an active order as DELIVERED."""
    permission_classes = [IsAuthenticated, IsRiderPermission]

    def post(self, request, pk):
        order = get_object_or_404(Order, pk=pk, rider=request.user)
        order.status = Order.Status.DELIVERED
        order.save()
        return Response({"status": "delivered"})

class OrderStartPickupView(APIView):
    """
    Rider signals they are starting the journey to the pickup location.
    Updates status to IN_TRANSIT (or your preferred intermediate status).
    """
    permission_classes = [IsAuthenticated, IsRiderPermission]

    def post(self, request, pk):
        # Ensure the order belongs to this rider and is in the correct state
        order = get_object_or_404(Order, pk=pk, rider=request.user, status=Order.Status.PICKED_UP)
        
        # Update to IN_TRANSIT to signal the rider is moving
        order.status = Order.Status.IN_TRANSIT
        order.save()

        return Response(OrderSerializer(order, context={"request": request}).data)
class RiderActiveOrderView(APIView):
    """Returns the current order in progress for the rider."""
    permission_classes = [IsAuthenticated, IsRiderPermission]

    def get(self, request):
        active_order = Order.objects.filter(
            rider=request.user,
            status__in=[Order.Status.PICKED_UP, Order.Status.IN_TRANSIT]
        ).first()

        if not active_order:
            return Response(None, status=status.HTTP_200_OK)

        return Response(OrderSerializer(active_order, context={"request": request}).data)

# --- TRACKING & LOGISTICS ---

class LocationUpdateView(APIView):
    """Endpoint for the mobile app to sync GPS logs for active tracking."""
    permission_classes = [IsAuthenticated, IsRiderPermission]

    def post(self, request):
        serializer = LocationLogSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(rider=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class HeatmapDemandView(APIView):
    """Returns high-volume demand areas for map visualization."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Mocked data for high-demand clusters in Accra
        data = [
            {"area": "East Legon", "latitude": 5.63, "longitude": -0.16, "order_count": 12},
            {"area": "Osu", "latitude": 5.55, "longitude": -0.18, "order_count": 8},
        ]
        serializer = DemandCenterSerializer(data, many=True)
        return Response(serializer.data)