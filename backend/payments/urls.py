from django.urls import path
from .views import PaymentSimulationView

urlpatterns = [
    path('<int:booking_id>/pay/', PaymentSimulationView.as_view(), name='simulate_payment'),
]
