from rest_framework import serializers
from .models import Booking
from properties.serializers import PropertySerializer
from django.utils import timezone

class BookingSerializer(serializers.ModelSerializer):
    property_detail = PropertySerializer(source='property', read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ('guest', 'status', 'total_price', 'created_at', 'updated_at')

    def validate(self, data):
        # Additional validation on top of model's clean method
        if data['check_in_date'] < timezone.now().date():
            raise serializers.ValidationError({"check_in_date": "Check-in date cannot be in the past."})
        return data

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['guest'] = request.user
        
        # Calculate total price dynamically
        property_obj = validated_data['property']
        days = (validated_data['check_out_date'] - validated_data['check_in_date']).days
        validated_data['total_price'] = days * property_obj.price_per_night
        
        return super().create(validated_data)
