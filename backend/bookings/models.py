from django.db import models
from django.conf import settings
from properties.models import Property
from django.core.exceptions import ValidationError

class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    )

    guest = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='bookings')
    check_in_date = models.DateField()
    check_out_date = models.DateField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Booking by {self.guest.username} at {self.property.title}"

    def clean(self):
        if self.check_in_date >= self.check_out_date:
            raise ValidationError("Check-out date must be after check-in date.")
        
        # Conflict Handling (Double Booking)
        # Check if there's any CONFIRMED booking overlapping with these dates
        overlapping_bookings = Booking.objects.filter(
            property=self.property,
            status='confirmed',
            check_in_date__lt=self.check_out_date,
            check_out_date__gt=self.check_in_date
        ).exclude(pk=self.pk)
        
        if overlapping_bookings.exists():
            raise ValidationError("These dates are already booked.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
