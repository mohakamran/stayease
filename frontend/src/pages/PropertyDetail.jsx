import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Users, Home as HomeIcon, Star, Heart } from 'lucide-react';
import api from '../api/client';

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await api.get(`properties/${id}/`);
        setProperty(res.data);
        document.title = `${res.data.title} | StayEase`;
        
        if (token) {
          try {
            const wishRes = await api.get('users/wishlist/');
            const wishlists = wishRes.data.map(w => w.id);
            if (wishlists.includes(parseInt(id))) {
              setIsWishlisted(true);
            }
          } catch(err) {}
        }
      } catch (err) {
        setError('Failed to load property details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const toggleWishlist = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      if (isWishlisted) {
        await api.delete(`users/wishlist/${id}/`);
        setIsWishlisted(false);
      } else {
        await api.post(`users/wishlist/${id}/`);
        setIsWishlisted(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBook = () => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (!checkIn || !checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }
    // Navigate to booking confirmation with state
    navigate(`/booking/${id}`, { state: { checkIn, checkOut, property } });
  };

  if (loading) return <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (!property) return <div className="text-center mt-20">Property not found</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-start mb-4">
        <h1 className="text-3xl font-bold">{property.title}</h1>
        <button 
          onClick={toggleWishlist}
          className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition font-medium underline"
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-primary text-primary' : 'text-gray-600'}`} />
          <span>Save</span>
        </button>
      </div>
      <div className="flex items-center text-gray-600 mb-6 font-medium">
        <MapPin className="w-5 h-5 mr-1" />
        {property.city}, {property.country}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[60vh] min-h-[400px] mb-8">
        <div className="h-full rounded-l-3xl overflow-hidden bg-gray-100">
          <img 
            src={property.images?.length > 0 ? property.images[0].image : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80'} 
            alt={property.title} 
            className="w-full h-full object-cover hover:scale-105 transition duration-700"
          />
        </div>
        <div className="grid grid-rows-2 gap-4 h-full hidden md:grid">
          <div className="bg-gray-100 rounded-tr-3xl overflow-hidden">
            <img 
              src={property.images?.length > 1 ? property.images[1].image : 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80'} 
              alt="Secondary view" 
              className="w-full h-full object-cover hover:scale-105 transition duration-700"
            />
          </div>
          <div className="bg-gray-100 rounded-br-3xl overflow-hidden relative">
            <img 
              src={property.images?.length > 2 ? property.images[2].image : 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=80'} 
              alt="Third view" 
              className="w-full h-full object-cover hover:scale-105 transition duration-700"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center pb-6 border-b">
            <div>
              <h2 className="text-2xl font-bold">Hosted by {property.host?.first_name || property.host?.username}</h2>
              <div className="flex gap-4 mt-2 text-gray-600">
                <span className="flex items-center"><Users className="w-4 h-4 mr-1"/> {property.max_guests} guests</span>
              </div>
            </div>
          </div>
          <div className="py-6 border-b">
            <h3 className="text-xl font-semibold mb-4">About this space</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{property.description}</p>
          </div>
          <div className="py-6">
            <h3 className="text-xl font-semibold mb-4">Amenities</h3>
            <div className="grid grid-cols-2 gap-4">
              {property.amenities.map((amenity, idx) => (
                <div key={idx} className="flex items-center text-gray-700">
                  <HomeIcon className="w-5 h-5 mr-3 text-gray-400" />
                  {amenity}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white border rounded-2xl p-6 shadow-xl sticky top-24">
            <div className="flex justify-between items-end mb-6">
              <span className="text-2xl font-bold">${property.price_per_night} <span className="text-base font-normal text-gray-500">/ night</span></span>
            </div>
            
            <div className="border rounded-xl overflow-hidden mb-6">
              <div className="flex border-b">
                <div className="w-1/2 p-3 border-r">
                  <label className="block text-xs font-bold text-gray-700 uppercase">Check-in</label>
                  <input type="date" className="w-full outline-none text-sm mt-1" value={checkIn} onChange={(e)=>setCheckIn(e.target.value)} />
                </div>
                <div className="w-1/2 p-3">
                  <label className="block text-xs font-bold text-gray-700 uppercase">Check-out</label>
                  <input type="date" className="w-full outline-none text-sm mt-1" value={checkOut} onChange={(e)=>setCheckOut(e.target.value)} />
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleBook}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-opacity-90 transition text-lg"
            >
              Reserve
            </button>
            <p className="text-center text-gray-500 text-sm mt-4">You won't be charged yet</p>
          </div>
        </div>
      </div>
    </div>
  );
}
