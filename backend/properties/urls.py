from django.urls import path, include
from rest_framework_nested import routers
from .views import PropertyViewSet, PropertyImageViewSet, AvailabilityViewSet

router = routers.SimpleRouter()
router.register(r'', PropertyViewSet)

properties_router = routers.NestedSimpleRouter(router, r'', lookup='property')
properties_router.register(r'images', PropertyImageViewSet, basename='property-images')
properties_router.register(r'availability', AvailabilityViewSet, basename='property-availability')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(properties_router.urls)),
]
