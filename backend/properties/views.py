from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Property, PropertyImage, Availability
from .serializers import PropertySerializer, PropertyImageSerializer, AvailabilitySerializer

class IsHostOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.is_host()

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.host == request.user

class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [IsHostOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['city', 'country', 'price_per_night', 'max_guests']
    search_fields = ['title', 'description', 'city']
    ordering_fields = ['price_per_night', 'created_at']

class PropertyImageViewSet(viewsets.ModelViewSet):
    queryset = PropertyImage.objects.all()
    serializer_class = PropertyImageSerializer
    permission_classes = [IsHostOrReadOnly]

    def perform_create(self, serializer):
        property_id = self.request.data.get('property')
        property_obj = Property.objects.get(id=property_id)
        if property_obj.host != self.request.user:
            raise permissions.PermissionDenied("You do not own this property.")
        serializer.save(property=property_obj)

class AvailabilityViewSet(viewsets.ModelViewSet):
    serializer_class = AvailabilitySerializer
    permission_classes = [IsHostOrReadOnly]

    def get_queryset(self):
        property_id = self.kwargs.get('property_pk')
        if property_id:
            return Availability.objects.filter(property_id=property_id)
        return Availability.objects.all()

    def perform_create(self, serializer):
        property_id = self.kwargs.get('property_pk')
        property_obj = Property.objects.get(id=property_id)
        if property_obj.host != self.request.user:
            raise permissions.PermissionDenied("You do not own this property.")
        serializer.save(property=property_obj)
