from django.urls import path
from rest_framework.routers import DefaultRouter
from core import views

app_name = "core"

urlpatterns = [
    # Authentication endpoints
    path("auth/register/", views.UserRegisterView.as_view(), name="register"),
    path("auth/login/", views.UserLoginView.as_view(), name="login"),
    path("auth/refresh/", views.TokenRefreshView.as_view(), name="token-refresh"),
    path("auth/token/", views.TokenObtainPairView.as_view(), name="token-obtain-pair"),

    # Rider endpoints
    path("api/riders/me/", views.RiderProfileView.as_view(), name="rider-profile"),
    path("api/rider/analytics/", views.RiderAnalyticsView.as_view(), name="rider-analytics"),
    path("api/riders/active-order/", views.RiderActiveOrderView.as_view(), name="rider-active-order"),
    path("api/riders/nearby-orders/", views.NearbyOrdersView.as_view(), name="nearby-orders"),

    # Order endpoints
    path("api/orders/<int:pk>/accept/", views.OrderAcceptView.as_view(), name="order-accept"),
    path("api/orders/<int:pk>/start-pickup/", views.OrderStartPickupView.as_view(), name="order-start-pickup"),
    path("api/orders/<int:pk>/complete/", views.OrderCompleteView.as_view(), name="order-complete"),

    # Other endpoints
    path("api/location/update/", views.LocationUpdateView.as_view(), name="location-update"),
    path("api/heatmap/demand-centers/", views.HeatmapDemandView.as_view(), name="heatmap-demand"),
]
