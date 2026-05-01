from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from core.models import Order, TripMetrics, Vehicle, Review, LocationLog
from decimal import Decimal
import math

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    profile_photo_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "phone_number", "user_type", "profile_photo_url", "first_name", "last_name"]
        read_only_fields = ["id", "phone_number", "user_type"]

    def get_profile_photo_url(self, obj):
        if obj.profile_photo:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.profile_photo.url)
            return obj.profile_photo.url
        return None

class TripMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TripMetrics
        fields = "__all__"
        read_only_fields = ["id", "created_at"]
        
class DemandCenterSerializer(serializers.Serializer):
    """Serializer for mapping high-demand delivery zones."""
    area = serializers.CharField()
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
    order_count = serializers.IntegerField()
class OrderSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)
    rider = UserSerializer(read_only=True)
    trip_metrics = TripMetricsSerializer(read_only=True)
    distance_from_rider = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id", "customer", "rider", "category", "priority_weight",
            "status", "pickup_latitude", "pickup_longitude",
            "dropoff_latitude", "dropoff_longitude",
            "pickup_address", "dropoff_address",
            "created_at", "updated_at", "trip_metrics",
            "distance_from_rider"
        ]
        read_only_fields = ["id", "customer", "rider", "created_at", "updated_at"]

    def get_distance_from_rider(self, obj):
        """Calculates distance based on rider's current GPS sent via query params."""
        request = self.context.get("request")
        if request and "lat" in request.query_params and "lng" in request.query_params:
            try:
                # Use Decimal for coordinate precision
                r_lat = Decimal(request.query_params.get("lat"))
                r_lng = Decimal(request.query_params.get("lng"))
                return round(self._haversine(r_lat, r_lng, obj.pickup_latitude, obj.pickup_longitude), 2)
            except (ValueError, TypeError, AttributeError):
                pass
        return None

    def _haversine(self, lat1, lon1, lat2, lon2):
        R = 6371  # Kilometers
        dLat = math.radians(float(lat2 - lat1))
        dLon = math.radians(float(lon2 - lon1))
        a = math.sin(dLat/2)**2 + math.cos(math.radians(float(lat1))) * \
            math.cos(math.radians(float(lat2))) * math.sin(dLon/2)**2
        return R * (2 * math.atan2(math.sqrt(a), math.sqrt(1-a)))

class LocationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = LocationLog
        fields = ["id", "rider", "latitude", "longitude", "timestamp"]
        read_only_fields = ["id", "rider", "timestamp"]

    def validate_latitude(self, value):
        if value < -90 or value > 90:
            raise serializers.ValidationError("Invalid latitude range.")
        return value

    def validate_longitude(self, value):
        if value < -180 or value > 180:
            raise serializers.ValidationError("Invalid longitude range.")
        return value

class TripHistorySerializer(serializers.ModelSerializer):
    """Serializer for rider trip history with time, location, and amount."""
    time = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    amount = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = ['time', 'location', 'amount']
    
    def get_time(self, obj):
        # Use completion time (updated_at) when order was marked delivered
        return obj.updated_at.strftime('%H:%M')
    
    def get_location(self, obj):
        # Return pickup_address or fallback
        return obj.pickup_address if obj.pickup_address else "Pickup location"
    
    def get_amount(self, obj):
        # Return total_fare from trip_metrics; fallback to base_fare if available
        if hasattr(obj, 'trip_metrics') and obj.trip_metrics:
            return obj.trip_metrics.total_fare
        return None

class LoginSerializer(serializers.Serializer):
    """Refined Login Serializer using standard authenticate() methods."""
    phone_number = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    def validate(self, attrs):
        phone_number = attrs.get("phone_number")
        password = attrs.get("password")

        # Standard DRF way to authenticate using the phone_number as the username field
        user = authenticate(
            request=self.context.get('request'),
            username=phone_number,
            password=password
        )

        if not user:
            raise serializers.ValidationError("Incorrect phone number or password.")
        
        if not user.is_active:
            raise serializers.ValidationError("This account is currently inactive.")

        attrs["user"] = user
        return attrs

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["phone_number", "username", "user_type", "password", "password_confirm", "first_name", "last_name"]

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        return User.objects.create_user(**validated_data)