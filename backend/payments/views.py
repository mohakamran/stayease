from rest_framework import views, permissions, status
from rest_framework.response import Response
from bookings.models import Booking
import random

class PaymentSimulationView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(id=booking_id, guest=request.user)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

        if booking.status != 'pending':
            return Response({"error": "Booking is not pending."}, status=status.HTTP_400_BAD_REQUEST)

        # Simulate success/failure (80% success rate)
        is_success = random.random() < 0.8

        if is_success:
            booking.status = 'confirmed'
            booking.save()
            # Here we would normally trigger a Celery task for email notification
            return Response({"status": "Payment successful. Booking confirmed!"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Payment failed. Please try again."}, status=status.HTTP_400_BAD_REQUEST)
