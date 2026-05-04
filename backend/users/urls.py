from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, ProfileView, upgrade_to_host, wishlist_manager

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('upgrade/', upgrade_to_host, name='upgrade_to_host'),
    path('wishlist/', wishlist_manager, name='wishlist_get'),
    path('wishlist/<int:property_id>/', wishlist_manager, name='wishlist_manage'),
]
