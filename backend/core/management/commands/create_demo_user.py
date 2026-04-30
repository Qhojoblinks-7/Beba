from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
from core.models import User, Order, TripMetrics, Vehicle


class Command(BaseCommand):
    help = "Create a demo rider user with sample orders and data for testing."

    def handle(self, *args, **options):
        with transaction.atomic():
            # Create or get demo rider
            rider, created = User.objects.get_or_create(
                phone_number="0555123456",
                defaults={
                    "username": "demorider",
                    "user_type": User.UserType.RIDER,
                    "is_active": True,
                },
            )
            if created:
                rider.set_password("demo123")
                rider.save()
                self.stdout.write(
                    self.style.SUCCESS("Created demo rider: 0555123456 / demo123")
                )
            else:
                # Ensure password is correct
                rider.set_password("demo123")
                rider.save()
                self.stdout.write(
                    self.style.WARNING("Updated demo rider password to demo123")
                )

            # Create or get demo vehicle
            vehicle, _ = Vehicle.objects.get_or_create(
                frame_number="DEMO-FRAME-001",
                defaults={
                    "owner": rider,
                    "make_model": "Veloka MTB",
                    "last_maintenance_date": timezone.now().date(),
                },
            )
            self.stdout.write(self.style.SUCCESS(f"Vehicle: {vehicle.make_model}"))

            # Create demo customer (for placing orders)
            customer, cust_created = User.objects.get_or_create(
                phone_number="0555987654",
                defaults={
                    "username": "democustomer",
                    "user_type": User.UserType.CUSTOMER,
                    "is_active": True,
                },
            )
            if cust_created:
                customer.set_password("demo123")
                customer.save()
                self.stdout.write(
                    self.style.SUCCESS("Created demo customer: 0555987654 / demo123")
                )

            # Create sample orders around Accra
            demo_orders = [
                {
                    "category": Order.Category.FOOD,
                    "pickup_latitude": Decimal("5.6037"),
                    "pickup_longitude": Decimal("-0.1870"),
                    "dropoff_latitude": Decimal("5.6100"),
                    "dropoff_longitude": Decimal("-0.1800"),
                    "pickup_address": "Circle, Accra",
                    "dropoff_address": "Osu, Accra",
                    "status": Order.Status.PENDING,
                },
                {
                    "category": Order.Category.PARCEL,
                    "pickup_latitude": Decimal("5.5748"),
                    "pickup_longitude": Decimal("-0.2250"),
                    "dropoff_latitude": Decimal("5.5800"),
                    "dropoff_longitude": Decimal("-0.2100"),
                    "pickup_address": "Kaneshie Market",
                    "dropoff_address": "Mallam, Accra",
                    "status": Order.Status.PENDING,
                },
                {
                    "category": Order.Category.DOCUMENT,
                    "pickup_latitude": Decimal("5.5593"),
                    "pickup_longitude": Decimal("-0.2058"),
                    "dropoff_latitude": Decimal("5.5700"),
                    "dropoff_longitude": Decimal("-0.1950"),
                    "pickup_address": "Accra Central Post Office",
                    "dropoff_address": "Adabraka, Accra",
                    "status": Order.Status.PENDING,
                },
                {
                    "category": Order.Category.FOOD,
                    "pickup_latitude": Decimal("5.5890"),
                    "pickup_longitude": Decimal("-0.1780"),
                    "dropoff_latitude": Decimal("5.5950"),
                    "dropoff_longitude": Decimal("-0.1720"),
                    "pickup_address": "Labone, Accra",
                    "dropoff_address": "Cantonments, Accra",
                    "status": Order.Status.PENDING,
                },
                {
                    "category": Order.Category.PARCEL,
                    "pickup_latitude": Decimal("5.6200"),
                    "pickup_longitude": Decimal("-0.2000"),
                    "dropoff_latitude": Decimal("5.6300"),
                    "dropoff_longitude": Decimal("-0.1900"),
                    "pickup_address": "Madina Zongo Junction",
                    "dropoff_address": "Legon Campus",
                    "status": Order.Status.PENDING,
                },
            ]

            for i, order_data in enumerate(demo_orders, start=1):
                order, order_created = Order.objects.get_or_create(
                    customer=customer,
                    pickup_address=order_data["pickup_address"],
                    dropoff_address=order_data["dropoff_address"],
                    defaults={
                        "category": order_data["category"],
                        "pickup_latitude": order_data["pickup_latitude"],
                        "pickup_longitude": order_data["pickup_longitude"],
                        "dropoff_latitude": order_data["dropoff_latitude"],
                        "dropoff_longitude": order_data["dropoff_longitude"],
                        "status": order_data["status"],
                        "priority_weight": Order.PRIORITY_WEIGHTS.get(
                            order_data["category"], 10
                        ),
                    },
                )

                if order_created:
                    # Create trip metrics for each order
                    TripMetrics.objects.create(
                        order=order,
                        distance_km=Decimal(f"{3.5 + i}"),
                        expected_duration=15 + (i * 5),
                        base_fare=Decimal("5.00"),
                        distance_fare=Decimal(f"{2.5 + i}"),
                        total_fare=Decimal(f"{7.5 + i}"),
                    )
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"Created {order_data['category']} order: {order_data['pickup_address']} -> {order_data['dropoff_address']}"
                        )
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(
                            f"Order already exists: {order_data['pickup_address']}"
                        )
                    )

            # Create one delivered order for earnings display
            delivered_order, del_created = Order.objects.get_or_create(
                customer=customer,
                rider=rider,
                pickup_address="East Legon, Accra",
                dropoff_address="Airport Residential",
                defaults={
                    "category": Order.Category.FOOD,
                    "pickup_latitude": Decimal("5.6300"),
                    "pickup_longitude": Decimal("-0.1600"),
                    "dropoff_latitude": Decimal("5.6200"),
                    "dropoff_longitude": Decimal("-0.1700"),
                    "status": Order.Status.DELIVERED,
                    "priority_weight": 30,
                },
            )
            if del_created:
                TripMetrics.objects.create(
                    order=delivered_order,
                    distance_km=Decimal("4.20"),
                    expected_duration=20,
                    actual_duration=18,
                    base_fare=Decimal("5.00"),
                    distance_fare=Decimal("3.20"),
                    total_fare=Decimal("8.20"),
                )
                self.stdout.write(
                    self.style.SUCCESS("Created delivered order for earnings demo")
                )

            self.stdout.write(
                self.style.SUCCESS("\nDemo data setup complete! Use these credentials to login:")
            )
            self.stdout.write(self.style.SUCCESS("  Phone: 0555123456"))
            self.stdout.write(self.style.SUCCESS("  Password: demo123"))

