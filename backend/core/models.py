from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator


class User(AbstractUser):
    """Custom User model for Beba platform."""

    class UserType(models.TextChoices):
        CUSTOMER = "CUSTOMER", _("Customer")
        RIDER = "RIDER", _("Rider")

    phone_number = models.CharField(
        max_length=15,
        unique=True,
        help_text=_("Phone number for login and identification")
    )
    user_type = models.CharField(
        max_length=10,
        choices=UserType.choices,
        default=UserType.CUSTOMER,
        help_text=_("Type of user: Customer or Rider")
    )
    profile_photo = models.ImageField(
        upload_to="profile_photos/",
        null=True,
        blank=True,
        help_text=_("Profile photo of the user")
    )
    is_active = models.BooleanField(
        default=True,
        help_text=_("Whether the user account is active")
    )

    # Make phone_number the USERNAME_FIELD for authentication
    USERNAME_FIELD = "phone_number"
    REQUIRED_FIELDS = ["username"]  # Required by DjangoAbstractUser

    def __str__(self):
        return f"{self.phone_number} ({self.get_user_type_display()})"


class Vehicle(models.Model):
    """Vehicle model for tracking rider equipment."""

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="vehicles",
        limit_choices_to={"user_type": User.UserType.RIDER},
        help_text=_("Rider who owns this vehicle")
    )
    make_model = models.CharField(
        max_length=100,
        help_text=_("Vehicle make and model (e.g., 'Veloka MTB')")
    )
    frame_number = models.CharField(
        max_length=50,
        unique=True,
        help_text=_("Unique frame/chassis number")
    )
    last_maintenance_date = models.DateField(
        null=True,
        blank=True,
        help_text=_("Last maintenance date")
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.make_model} - {self.frame_number}"


class Order(models.Model):
    """Central Order model with food priority logic."""

    class Category(models.TextChoices):
        FOOD = "FOOD", _("Food")
        PARCEL = "PARCEL", _("Parcel")
        DOCUMENT = "DOCUMENT", _("Document")

    class Status(models.TextChoices):
        PENDING = "PENDING", _("Pending")
        PICKED_UP = "PICKED_UP", _("Picked Up")
        IN_TRANSIT = "IN_TRANSIT", _("In Transit")
        DELIVERED = "DELIVERED", _("Delivered")

    # Priority weights (higher = more priority)
    PRIORITY_WEIGHTS = {
        Category.FOOD: 30,
        Category.PARCEL: 10,
        Category.DOCUMENT: 20,
    }

    customer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="customer_orders",
        limit_choices_to={"user_type": User.UserType.CUSTOMER}
    )
    rider = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="rider_orders",
        limit_choices_to={"user_type": User.UserType.RIDER}
    )
    category = models.CharField(
        max_length=10,
        choices=Category.choices,
        default=Category.FOOD
    )
    priority_weight = models.IntegerField(
        default=10,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text=_("Higher weight means higher priority (food gets 30)")
    )
    status = models.CharField(
        max_length=12,
        choices=Status.choices,
        default=Status.PENDING
    )
    pickup_latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        help_text=_("Pickup location latitude")
    )
    pickup_longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        help_text=_("Pickup location longitude")
    )
    dropoff_latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        help_text=_("Dropoff location latitude")
    )
    dropoff_longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        help_text=_("Dropoff location longitude")
    )
    pickup_address = models.CharField(max_length=255, blank=True)
    dropoff_address = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Auto-assign priority based on category
        if not self.priority_weight:
            self.priority_weight = self.PRIORITY_WEIGHTS.get(self.category, 10)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order #{self.pk} - {self.category} ({self.status})"


class TripMetrics(models.Model):
    """Stores trip calculation data for fee engine and analytics."""

    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name="trip_metrics"
    )
    distance_km = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        help_text=_("Distance in kilometers")
    )
    expected_duration = models.PositiveIntegerField(
        help_text=_("Expected duration in minutes")
    )
    actual_duration = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text=_("Actual duration in minutes")
    )
    wait_time_minutes = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        help_text=_("Wait time calculated by geofence logic")
    )
    base_fare = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        help_text=_("Base fee")
    )
    distance_fare = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        help_text=_("Fee based on distance")
    )
    delay_fare = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
        help_text=_("Additional fee for delays")
    )
    total_fare = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        help_text=_("Total fare charged")
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Trip #{self.order_id} - {self.total_fare}"


class LocationLog(models.Model):
    """Stores rider location history for live tracking."""

    rider = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="location_logs",
        limit_choices_to={"user_type": User.UserType.RIDER}
    )
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6
    )
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["rider", "-timestamp"]),
        ]

    def __str__(self):
        return f"{self.rider} @ {self.timestamp}"


class Review(models.Model):
    """Review model for quality control and rider ratings."""

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="reviews"
    )
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text=_("Rating from 1 to 5 stars")
    )
    comment = models.TextField(
        blank=True,
        help_text=_("Optional review comment")
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["order"]  # One review per order

    def __str__(self):
        return f"Review for Order #{self.order_id}: {self.rating}★"