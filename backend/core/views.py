from rest_framework import viewsets, status, generics, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db.models import Q, Sum, Count, F, Prefetch
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter

from core.models import Order, TripMetrics, Vehicle, Review, LocationLog
from core.serializers import (
    UserSerializer, OrderSerializer, TripMetricsSerializer,
    VehicleSerializer, ReviewSerializer, LocationLogSerializer,
    EarningsSummarySerializer, DemandCenterSerializer,
    UserRegisterSerializer, LoginSerializer
)
from decimal import Decimal
import math
from datetime import datetime, timedelta

User = get_user_model()


class IsRiderPermission(permissions.BasePermission):
    """Custom permission to only allow riders to access."""

    def has_permission(self, request, view):
        return request.user and request.user.user_type == User.UserType.RIDER

    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'rider'):
            return obj.rider == request.user
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        return request.user.user_type == User.UserType.RIDER


class RiderProfileView(generics.RetrieveAPIView):
    """GET /api/riders/me/ - Current rider profile."""

    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsRiderPermission]

    def get_object(self):
        return self.request.user


class RiderAnalyticsView(APIView):
    """GET /api/riders/earnings/ - Earnings summary for the current rider."""

    permission_classes = [permissions.IsAuthenticated, IsRiderPermission]

    def get(self, request):
        today = timezone.now().date()
        seven_days_ago = today - timedelta(days=7)

        # Today's earnings
        today_orders = Order.objects.filter(
            rider=request.user,
            status=Order.Status.DELIVERED,
            updated_at__date=today
        ).select_related('trip_metrics')

        daily_total = Decimal('0.00')
        wait_fees_earned = Decimal('0.00')
        completed_trips = today_orders.count()

        for order in today_orders:
            if hasattr(order, 'trip_metrics'):
                daily_total += order.trip_metrics.total_fare
                wait_fees_earned += order.trip_metrics.wait_time_minutes * Decimal('0.50')

        # This week's earnings
        week_orders = Order.objects.filter(
            rider=request.user,
            status=Order.Status.DELIVERED,
            updated_at__date__gte=seven_days_ago
        ).aggregate(total=Sum('trip_metrics__total_fare'))['total'] or Decimal('0.00')

        # Total balance (all time)
        balance = Order.objects.filter(
            rider=request.user,
            status=Order.Status.DELIVERED
        ).aggregate(total=Sum('trip_metrics__total_fare'))['total'] or Decimal('0.00')

        # Radar data (mock for now, can be calculated from real data)
        radar_data = [
            {"subject": "Punctuality", "value": 4.2},
            {"subject": "Food Integrity", "value": 4.8},
            {"subject": "Volume", "value": 4.5},
            {"subject": "Efficiency", "value": 3.9},
            {"subject": "Wait-Fee Success", "value": 4.1},
        ]

        # Heatmap data (simplified)
        heatmap_data = [
            {"day": "Mon", "hour": 11, "earnings": 15},
            {"day": "Mon", "hour": 12, "earnings": 20},
            # Add more
        ]

        # Trip history (recent 5)
        recent_orders = Order.objects.filter(
            rider=request.user,
            status=Order.Status.DELIVERED
        ).select_related('trip_metrics').order_by('-updated_at')[:5]

        trip_history = []
        for order in recent_orders:
            description = f"{order.distance_km}km {order.category} Delivery"
            total = order.trip_metrics.total_fare if order.trip_metrics else Decimal('0.00')
            trip_history.append({
                "id": order.id,
                "description": description,
                "total": total,
                "includes": "",
                "status": "Paid"
            })

        return Response({
            "date": today,
            "daily_total": daily_total,
            "completed_trips": completed_trips,
            "wait_fees_earned": wait_fees_earned,
            "balance": balance,
            "today": daily_total,
            "this_week": week_orders,
            "radar_data": radar_data,
            "heatmap_data": heatmap_data,
            "trip_history": trip_history
        })


class RiderActiveOrderView(APIView):
    """GET /api/riders/active-order/ - Current active order with TripMetrics.

    Returns the active order serialized data, or null if the rider has no
    order in PICKED_UP or IN_TRANSIT status.
    """

    permission_classes = [permissions.IsAuthenticated, IsRiderPermission]

    def get(self, request, *args, **kwargs):
        active_order = Order.objects.filter(
            rider=request.user,
            status__in=[Order.Status.PICKED_UP, Order.Status.IN_TRANSIT]
        ).select_related('customer', 'rider').prefetch_related('trip_metrics').first()

        if not active_order:
            return Response(None, status=status.HTTP_200_OK)

        serializer = OrderSerializer(active_order, context={"request": request})
        return Response(serializer.data)


class NearbyOrdersView(generics.ListAPIView):
    """GET /api/riders/nearby-orders/ - List of pending orders sorted by distance."""

    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsRiderPermission]
    filter_backends = [OrderingFilter]
    ordering_fields = ['priority_weight', 'created_at']
    ordering = ['-priority_weight', 'created_at']

    def get_queryset(self):
        return Order.objects.filter(
            status=Order.Status.PENDING,
            rider__isnull=True
        ).select_related('customer').prefetch_related('trip_metrics')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')

        if lat and lng:
            try:
                rider_lat = float(lat)
                rider_lng = float(lng)

                orders_with_distance = []
                for order in queryset:
                    distance = self._calculate_distance(
                        rider_lat, rider_lng,
                        float(order.pickup_latitude), float(order.pickup_longitude)
                    )
                    orders_with_distance.append((order, distance))

                orders_with_distance.sort(key=lambda x: x[1])

                serializer = self.get_serializer(
                    [item[0] for item in orders_with_distance],
                    many=True,
                    context={"request": request}
                )
                data = serializer.data
                for i, item in enumerate(data):
                    item['distance_from_rider'] = orders_with_distance[i][1]

                return Response(data)
            except (ValueError, TypeError):
                pass

        serializer = self.get_serializer(queryset, many=True, context={"request": request})
        return Response(serializer.data)

    def _calculate_distance(self, lat1, lng1, lat2, lng2):
        R = 6371000
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lng2 - lng1)

        a = math.sin(delta_phi / 2) ** 2 + \
            math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c


class OrderAcceptView(APIView):
    """POST /api/orders/{id}/accept/ - Rider accepts an order."""

    permission_classes = [permissions.IsAuthenticated, IsRiderPermission]

    def post(self, request, pk):
        order = get_object_or_404(
            Order.objects.filter(status=Order.Status.PENDING, rider__isnull=True),
            pk=pk
        )
        order.rider = request.user
        order.status = Order.Status.PICKED_UP
        order.save()

        TripMetrics.objects.create(
            order=order,
            distance_km=Decimal('0.00'),
            expected_duration=0,
            base_fare=Decimal('0.00'),
            distance_fare=Decimal('0.00'),
            total_fare=Decimal('0.00')
        )

        serializer = OrderSerializer(order, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class OrderStartPickupView(APIView):
    """POST /api/orders/{id}/start-pickup/ - Start geofence timer (rider within 50m)."""

    permission_classes = [permissions.IsAuthenticated, IsRiderPermission]

    def post(self, request, pk):
        order = get_object_or_404(
            Order.objects.filter(rider=request.user, status=Order.Status.PICKED_UP),
            pk=pk
        )

        rider_lat = request.data.get('latitude')
        rider_lng = request.data.get('longitude')

        if not rider_lat or not rider_lng:
            return Response(
                {"detail": "Latitude and longitude are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        distance = self._calculate_distance(
            float(rider_lat), float(rider_lng),
            float(order.pickup_latitude), float(order.pickup_longitude)
        )

        if distance > 50:
            return Response(
                {"detail": f"Rider must be within 50m of pickup location. Current distance: {distance:.2f}m"},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = Order.Status.IN_TRANSIT
        order.save()

        if hasattr(order, 'trip_metrics'):
            order.trip_metrics.wait_time_minutes = Decimal('0.00')
            order.trip_metrics.save()

        return Response(
            {"detail": "Pickup started. Geofence timer activated.", "distance": distance},
            status=status.HTTP_200_OK
        )

    def _calculate_distance(self, lat1, lng1, lat2, lng2):
        R = 6371000
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lng2 - lng1)

        a = math.sin(delta_phi / 2) ** 2 + \
            math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c


class OrderCompleteView(APIView):
    """POST /api/orders/{id}/complete/ - Mark order delivered."""

    permission_classes = [permissions.IsAuthenticated, IsRiderPermission]

    def post(self, request, pk):
        order = get_object_or_404(
            Order.objects.filter(rider=request.user, status=Order.Status.IN_TRANSIT),
            pk=pk
        )

        if not hasattr(order, 'trip_metrics') or not order.trip_metrics.actual_duration:
            return Response(
                {"detail": "Trip metrics not fully recorded. Cannot complete order."},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = Order.Status.DELIVERED
        order.save()

        return Response(
            {"detail": "Order marked as delivered.", "order_id": order.id},
            status=status.HTTP_200_OK
        )


class LocationUpdateView(APIView):
    """POST /api/location/update/ - Log rider location."""

    permission_classes = [permissions.IsAuthenticated, IsRiderPermission]

    def post(self, request):
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')

        if not latitude or not longitude:
            return Response(
                {"detail": "Latitude and longitude are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            latitude = Decimal(str(latitude))
            longitude = Decimal(str(longitude))
        except Exception:
            return Response(
                {"detail": "Invalid latitude or longitude format."},
                status=status.HTTP_400_BAD_REQUEST
            )

        location_log = LocationLog.objects.create(
            rider=request.user,
            latitude=latitude,
            longitude=longitude
        )

        serializer = LocationLogSerializer(location_log)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class HeatmapDemandView(APIView):
    """GET /api/heatmap/demand-centers/ - Get demand data for specific areas."""

    permission_classes = [permissions.IsAuthenticated, IsRiderPermission]

    DEMAND_CENTERS = [
        {"area": "Circle", "latitude": 5.5698, "longitude": -0.2010},
        {"area": "Kaneshie", "latitude": 5.5748, "longitude": -0.2250},
        {"area": "Accra Central", "latitude": 5.5593, "longitude": -0.2058},
    ]

    def get(self, request):
        today = timezone.now().date()
        fifteen_minutes_ago = timezone.now() - timedelta(minutes=15)

        demand_data = []
        for center in self.DEMAND_CENTERS:
            order_count = Order.objects.filter(
                status=Order.Status.PENDING,
                pickup_latitude__isnull=False,
                pickup_longitude__isnull=False,
                created_at__gte=fifteen_minutes_ago
            ).filter(
                Q(pickup_latitude__range=(center["latitude"] - 0.01, center["latitude"] + 0.01)) &
                Q(pickup_longitude__range=(center["longitude"] - 0.01, center["longitude"] + 0.01))
            ).count()

            demand_data.append({
                "area": center["area"],
                "latitude": center["latitude"],
                "longitude": center["longitude"],
                "order_count": order_count
            })

        serializer = DemandCenterSerializer(demand_data, many=True)
        return Response(serializer.data)


class UserRegisterView(generics.CreateAPIView):
    """POST /auth/register/ - Register a new user.

    Creates a new user with phone_number, username, user_type, and password.
    Returns the created user info and JWT tokens on successful registration.
    """
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)

        user_data = UserSerializer(user, context={"request": request}).data

        return Response({
            "user": user_data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }, status=status.HTTP_201_CREATED)


class UserLoginView(generics.GenericAPIView):
    """POST /auth/login/ - Login user and return JWT tokens.

    Authenticates user with phone_number and password.
    Returns user info and JWT tokens (access and refresh) on success.
    """
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        # Generate JWT tokens
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)

        user_data = UserSerializer(user, context={"request": request}).data

        return Response({
            "user": user_data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }, status=status.HTTP_200_OK)


class TokenRefreshView(TokenRefreshView):
    """POST /auth/refresh/ - Refresh an access token.

    Accepts a valid refresh token and returns a new access token.
    """
    pass


class TokenObtainPairView(TokenObtainPairView):
    """POST /auth/token/ - Obtain a new JWT token pair.

    Alternative login endpoint that returns access and refresh tokens.
    Accepts phone_number as USERNAME_FIELD and password.
    """
