from rest_framework import viewsets, permissions, exceptions
from .models import Review
from bookings.models import Booking
from .serializers import ReviewSerializer

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    queryset = Review.objects.all()

    def perform_create(self, serializer):
        property_obj = serializer.validated_data.get('property')
        user = self.request.user
        
        # Check if user has a confirmed booking for this property
        has_booked = Booking.objects.filter(guest=user, property=property_obj, status='confirmed').exists()
        if not has_booked:
            raise exceptions.PermissionDenied("You can only review properties you have booked and stayed at.")
            
        serializer.save(user=user)
