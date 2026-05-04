import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Search, Heart, Home as HomeIcon, Map, Key, Star } from 'lucide-react';
import api from '../api/client';

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    document.title = "StayEase | The Premium Real Estate Platform";
    const fetchData = async () => {
      try {
        const propsRes = await api.get('properties/');
        setProperties(propsRes.data.results || propsRes.data);
        
        if (token) {
          try {
            const wishRes = await api.get('users/wishlist/');
            setWishlists(wishRes.data.map(w => w.id));
          } catch(err) {
            console.error('Failed to fetch wishlist', err);
          }
        }
      } catch (error) {
        console.error('Failed to fetch properties:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const toggleWishlist = async (e, propertyId) => {
    e.preventDefault(); // prevent navigation
    if (!token) {
      navigate('/login');
      return;
    }
    
    try {
      if (wishlists.includes(propertyId)) {
        await api.delete(`users/wishlist/${propertyId}/`);
        setWishlists(wishlists.filter(id => id !== propertyId));
      } else {
        await api.post(`users/wishlist/${propertyId}/`);
        setWishlists([...wishlists, propertyId]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      {token ? (
        <div className="bg-gradient-to-r from-primary to-accent pt-32 pb-24 px-8 text-white shadow-xl mb-16 relative overflow-hidden">
          <div className="relative z-10 max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Welcome back to StayEase!</h1>
            <p className="text-xl opacity-90 max-w-2xl mb-8">Ready for your next getaway? Explore our latest properties or check your dashboard for upcoming trips.</p>
            <div className="flex gap-4">
              <Link to="/dashboard" className="bg-white text-primary font-bold px-6 py-3 rounded-full hover:scale-105 transition-transform shadow-lg">
                Go to Dashboard
              </Link>
            </div>
          </div>
          <div className="absolute top-0 right-0 h-full w-1/3 opacity-20 hidden md:block">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-white">
              <path d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.3,-46.3C90.8,-33.5,96.8,-18.1,96.5,-2.9C96.2,12.3,89.6,27.3,80.1,40.1C70.6,52.9,58.2,63.5,44.4,71.3C30.6,79.1,15.3,84.1,-0.6,85.1C-16.5,86.1,-33,83.1,-46.8,75.4C-60.6,67.7,-71.7,55.3,-80.1,41.2C-88.5,27.1,-94.2,11.3,-92.6,-3.6C-91,-18.5,-82.1,-32.5,-71.4,-43.6C-60.7,-54.7,-48.2,-62.9,-35.1,-70.6C-22,-78.3,-8.3,-85.5,3.6,-81.4C15.5,-77.3,30.6,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
            </svg>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden bg-gray-900 h-[70vh] min-h-[500px] mb-16 flex items-center justify-center text-center shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            alt="Hero background"
          />
          <div className="relative z-10 px-4 w-full max-w-4xl mt-16">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 drop-shadow-lg tracking-tight">
              Find your next adventure.
            </h1>
            <div className="bg-white p-3 rounded-full flex flex-col md:flex-row w-full shadow-2xl items-center text-left">
              <div className="flex-1 px-6 py-2 border-b md:border-b-0 md:border-r border-gray-200 w-full">
                <p className="text-xs font-bold uppercase text-gray-800 tracking-wider">Where</p>
                <input type="text" placeholder="Search destinations" className="w-full outline-none text-gray-600 bg-transparent text-lg placeholder-gray-400 font-medium" />
              </div>
              <div className="flex-1 px-6 py-2 border-b md:border-b-0 md:border-r border-gray-200 w-full">
                <p className="text-xs font-bold uppercase text-gray-800 tracking-wider">Check In</p>
                <input type="text" placeholder="Add dates" className="w-full outline-none text-gray-600 bg-transparent text-lg placeholder-gray-400 font-medium" />
              </div>
              <div className="flex-1 px-6 py-2 w-full">
                <p className="text-xs font-bold uppercase text-gray-800 tracking-wider">Guests</p>
                <input type="text" placeholder="Add guests" className="w-full outline-none text-gray-600 bg-transparent text-lg placeholder-gray-400 font-medium" />
              </div>
              <button className="bg-primary text-white p-5 rounded-full md:ml-2 hover:bg-opacity-90 transition-transform active:scale-95 w-full md:w-auto flex justify-center mt-4 md:mt-0 shadow-lg">
                <Search className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Container for rest of page */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Categories */}
      <div className="mb-12 border-b border-gray-100 pb-6 overflow-x-auto hide-scrollbar">
        <div className="flex space-x-8 min-w-max px-4">
          {[
            { name: 'Amazing pools', icon: <Search className="w-6 h-6 mb-2" /> },
            { name: 'Beachfront', icon: <HomeIcon className="w-6 h-6 mb-2" /> },
            { name: 'Cabins', icon: <HomeIcon className="w-6 h-6 mb-2" /> },
            { name: 'Trending', icon: <Star className="w-6 h-6 mb-2" /> },
            { name: 'Mansions', icon: <HomeIcon className="w-6 h-6 mb-2" /> },
            { name: 'Countryside', icon: <MapPin className="w-6 h-6 mb-2" /> },
            { name: 'Skiing', icon: <HomeIcon className="w-6 h-6 mb-2" /> },
            { name: 'Lakefront', icon: <Map className="w-6 h-6 mb-2" /> },
          ].map((cat, i) => (
            <div key={i} className="flex flex-col items-center justify-center min-w-[80px] text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-900 pb-2 cursor-pointer transition-all duration-200">
              {cat.icon}
              <span className="text-sm font-semibold">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Properties */}
      <div className="mb-20">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-bold">Featured stays</h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {properties.map((property) => (
              <Link to={`/property/${property.id}`} key={property.id} className="group cursor-pointer">
                <div className="aspect-[4/3] bg-gray-200 rounded-2xl mb-4 overflow-hidden relative shadow-sm">
                  <img 
                    src={property.images?.length > 0 ? property.images[0].image : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80'} 
                    alt={property.title} 
                    className="object-cover w-full h-full group-hover:scale-105 transition duration-500 ease-out"
                  />
                  <button 
                    onClick={(e) => toggleWishlist(e, property.id)}
                    className="absolute top-3 right-3 p-2 transition-transform hover:scale-110 active:scale-95"
                  >
                    <Heart className={`w-7 h-7 drop-shadow-md ${wishlists.includes(property.id) ? 'fill-primary text-primary' : 'text-white'}`} strokeWidth={2} />
                  </button>
                </div>
                <div className="flex justify-between items-start px-1">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{property.city}, {property.country}</h3>
                    <p className="text-gray-500 text-sm line-clamp-1 mt-1">{property.title}</p>
                    <p className="mt-2 font-semibold text-gray-900 text-lg">
                      ${property.price_per_night} <span className="font-normal text-gray-500 text-sm">night</span>
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="mb-20 bg-gray-50 rounded-3xl p-12 text-center border border-gray-100">
        <h2 className="text-3xl font-bold mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 text-primary">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">1. Search</h3>
            <p className="text-gray-600 px-4">Find your perfect destination from thousands of beautiful properties around the globe.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 text-primary">
              <Map className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">2. Book</h3>
            <p className="text-gray-600 px-4">Secure your dates instantly with our easy, conflict-free booking system.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 text-primary">
              <Key className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">3. Stay</h3>
            <p className="text-gray-600 px-4">Arrive, unlock the door, and enjoy your unforgettable adventure.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-primary to-accent rounded-3xl p-12 text-center text-white shadow-2xl mb-12 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold mb-6">Got extra space?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">Turn your extra room or entire home into a source of income. Join thousands of hosts who are earning today.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to={token ? "/settings" : "/register"} className="bg-white text-primary font-bold px-8 py-4 rounded-full shadow-lg hover:scale-105 transition-transform text-lg">
              Become a Host
            </Link>
            <Link to={token ? "/" : "/login"} className="bg-transparent border-2 border-white text-white font-bold px-8 py-4 rounded-full shadow-lg hover:bg-white hover:bg-opacity-10 transition text-lg">
              Start Booking Today
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
