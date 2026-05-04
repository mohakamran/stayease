import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';

export default function Booking() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success', 'error'
  
  const { checkIn, checkOut, property } = location.state || {};

  if (!property || !checkIn || !checkOut) {
    return <div className="text-center mt-20">Invalid booking details. Please go back.</div>;
  }

  // Calculate days
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const days = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  const total = days * property.price_per_night;

  const handleConfirmAndPay = async () => {
    setLoading(true);
    try {
      // 1. Create booking
      const bookingRes = await api.post('bookings/', {
        property: id,
        check_in_date: checkIn,
        check_out_date: checkOut
      });
      const bookingId = bookingRes.data.id;

      // 2. Simulate Payment
      const payRes = await api.post(`payments/${bookingId}/pay/`);
      setPaymentStatus('success');
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (error) {
      console.error(error);
      setPaymentStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-8">
        <button onClick={() => navigate(-1)} className="mr-4 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center font-bold">←</button>
        <h1 className="text-3xl font-bold">Confirm and pay</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-semibold mb-6">Your trip</h2>
          <div className="mb-6">
            <h3 className="font-semibold text-lg">Dates</h3>
            <p className="text-gray-600">{checkIn} to {checkOut} ({days} nights)</p>
          </div>
          
          <hr className="my-8" />
          
          <h2 className="text-2xl font-semibold mb-6">Pay with</h2>
          <div className="p-4 border rounded-xl bg-gray-50 flex items-center">
            <div className="w-8 h-5 bg-blue-600 rounded mr-3 flex items-center justify-center text-white text-xs font-bold italic">VISA</div>
            <span>•••• •••• •••• 1234</span>
          </div>

          <hr className="my-8" />
          
          {paymentStatus === 'error' && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium">
              Payment failed or dates are already booked. Please try again.
            </div>
          )}
          
          {paymentStatus === 'success' && (
            <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 font-medium">
              Payment successful! Redirecting to your dashboard...
            </div>
          )}

          <button 
            onClick={handleConfirmAndPay}
            disabled={loading || paymentStatus === 'success'}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-opacity-90 transition text-lg disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Confirm and pay'}
          </button>
        </div>

        <div>
          <div className="bg-white border rounded-2xl p-6 shadow-xl sticky top-24">
            <div className="flex gap-4 pb-6 border-b">
              <div className="w-28 h-24 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 shadow-sm">
                <img 
                  src={property.images?.length > 0 ? property.images[0].image : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80'} 
                  alt={property.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">{property.city}</p>
                <h3 className="font-semibold">{property.title}</h3>
                <p className="text-sm mt-1">★ New</p>
              </div>
            </div>

            <div className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Price details</h3>
              <div className="flex justify-between mb-3 text-gray-600">
                <span>${property.price_per_night} x {days} nights</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-3 text-gray-600">
                <span>Cleaning fee</span>
                <span>$50.00</span>
              </div>
              <div className="flex justify-between mb-6 text-gray-600">
                <span>Service fee</span>
                <span>$20.00</span>
              </div>
              <hr className="mb-6" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total (USD)</span>
                <span>${(total + 70).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
