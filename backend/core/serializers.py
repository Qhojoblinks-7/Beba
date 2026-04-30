from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.core.exceptions import ValidationError
from core.models import Order, TripMetrics, Vehicle, Review, LocationLog
from django.db.models import Sum, Count, Q, F
from django.db.models.functions import TruncDate
from datetime import datetime, timedelta
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
        fields = [
            "id", "order", "distance_km", "expected_duration",
            "actual_duration", "wait_time_minutes", "base_fare",
            "distance_fare", "delay_fare", "total_fare", "created_at"
        ]
        read_only_fields = ["id", "created_at"]


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
        request = self.context.get("request")
        if request and "lat" in request.query_params and "lng" in request.query_params:
            try:
                rider_lat = float(request.query_params.get("lat"))
                rider_lng = float(request.query_params.get("lng"))
                return self._calculate_distance(
                    rider_lat, rider_lng,
                    float(obj.pickup_latitude), float(obj.pickup_longitude)
                )
            except (ValueError, TypeError):
                pass
        return None

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


class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = [
            "id", "owner", "make_model", "frame_number",
            "last_maintenance_date", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "owner", "created_at", "updated_at"]


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ["id", "order", "rating", "comment", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value


class LocationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = LocationLog
        fields = ["id", "rider", "latitude", "longitude", "timestamp"]
        read_only_fields = ["id", "timestamp"]

    def validate(self, data):
        rider = data.get("rider")
        if rider and rider.user_type != User.UserType.RIDER:
            raise serializers.ValidationError("Only riders can log location")
        return data


class EarningsSummarySerializer(serializers.Serializer):
    date = serializers.DateField()
    daily_total = serializers.DecimalField(max_digits=10, decimal_places=2)
    completed_trips = serializers.IntegerField()
    wait_fees_earned = serializers.DecimalField(max_digits=10, decimal_places=2)


class DemandCenterSerializer(serializers.Serializer):
    area = serializers.CharField()
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
    order_count = serializers.IntegerField()


class UserRegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, required=True)
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ["phone_number", "username", "user_type", "password", "password_confirm"]

    def validate_phone_number(self, value):
        """Validate that the phone number is not already in use."""
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("This phone number is already registered.")
        return value

    def validate_username(self, value):
        """Validate that the username is not already taken."""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate(self, data):
        """Validate that passwords match."""
        password = data.get("password")
        password_confirm = data.get("password_confirm")
        if password and password_confirm and password != password_confirm:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return data

    def create(self, validated_data):
        """Create a user with the validated data."""
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")
        user = User.objects.create_user(
            phone_number=validated_data["phone_number"],
            username=validated_data["username"],
            user_type=validated_data["user_type"],
            password=password
        )
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    phone_number = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        """Validate credentials and return user."""
        phone_number = attrs.get("phone_number")
        password = attrs.get("password")

        if phone_number and password:
            user = User.objects.filter(phone_number=phone_number).first()
            if user is None:
                raise serializers.ValidationError({"phone_number": "No user found with this phone number."})
            if not user.check_password(password):
                raise serializers.ValidationError({"password": "Incorrect password."})
            if not user.is_active:
                raise serializers.ValidationError({"detail": "This account is inactive."})
            attrs["user"] = user
        else:
            raise serializers.ValidationError({"detail": "Phone number and password are required."})
        return attrs
