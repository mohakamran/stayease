import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, X, Trash2, Edit2, AlertTriangle, Upload, Heart, User, Map, 
  Home, Settings, LogOut, ChevronRight, DollarSign, Calendar, Menu, Bell
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../api/client';

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]); // Guests: trips, Hosts: reservations
  const [wishlist, setWishlist] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Sidebar State
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', city: '', country: '', price_per_night: '', max_guests: 1, amenities: ''
  });
  const [imageFile, setImageFile] = useState(null);
  
  // Settings State
  const [settingsMessage, setSettingsMessage] = useState('');
  const [settingsData, setSettingsData] = useState({
    first_name: '', last_name: '', bio: '', email: ''
  });

  // Notifications and Filters
  const [showNotifications, setShowNotifications] = useState(false);
  const [chartFilter, setChartFilter] = useState('All Time');
  const notifications = [
    { id: 1, text: "Welcome back! Check out new features.", unread: true },
    { id: 2, text: "Your profile is 80% complete.", unread: false }
  ];

  useEffect(() => {
    document.title = `Dashboard | StayEase`;
  }, []);

  const fetchData = async () => {
    try {
      const profileRes = await api.get('users/profile/');
      const userProfile = profileRes.data;
      setProfile(userProfile);
      setSettingsData({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        bio: userProfile.bio || '',
        email: userProfile.email || ''
      });

      if (userProfile.role === 'guest') {
        const bookingsRes = await api.get('bookings/');
        setBookings(bookingsRes.data.results || bookingsRes.data);
        
        const wishRes = await api.get('users/wishlist/');
        setWishlist(wishRes.data);
      } else if (userProfile.role === 'host') {
        const propsRes = await api.get('properties/');
        const allProps = propsRes.data.results || propsRes.data;
        setProperties(allProps.filter(p => p.host?.id === userProfile.id));
        
        const bookingsRes = await api.get('bookings/');
        setBookings(bookingsRes.data.results || bookingsRes.data);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ title: '', description: '', city: '', country: '', price_per_night: '', max_guests: 1, amenities: '' });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (property) => {
    setIsEditing(true);
    setEditingId(property.id);
    setFormData({
      title: property.title,
      description: property.description,
      city: property.city,
      country: property.country,
      price_per_night: property.price_per_night,
      max_guests: property.max_guests,
      amenities: Array.isArray(property.amenities) ? property.amenities.join(', ') : property.amenities
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.price_per_night <= 0) {
      alert("Price must be greater than 0");
      return;
    }
    if (formData.max_guests < 1) {
      alert("Max guests must be at least 1");
      return;
    }
    try {
      const payload = {
        ...formData,
        amenities: formData.amenities.split(',').map(a => a.trim())
      };

      let propertyId = editingId;

      if (isEditing) {
        await api.put(`properties/${editingId}/`, payload);
      } else {
        const res = await api.post('properties/', payload);
        propertyId = res.data.id;
      }

      if (imageFile && propertyId) {
        const imgData = new FormData();
        imgData.append('image', imageFile);
        imgData.append('property', propertyId);
        imgData.append('is_cover', true);
        await api.post(`properties/${propertyId}/images/`, imgData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save property', err);
      alert('Failed to save property');
    }
  };

  const confirmDelete = (property) => {
    setPropertyToDelete(property);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteProperty = async () => {
    if (propertyToDelete) {
      try {
        await api.delete(`properties/${propertyToDelete.id}/`);
        setIsDeleteModalOpen(false);
        setPropertyToDelete(null);
        fetchData();
      } catch(err) {
        console.error(err);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('users/profile/', settingsData);
      setSettingsMessage('Profile updated successfully!');
      setTimeout(() => setSettingsMessage(''), 3000);
      fetchData();
    } catch (error) {
      setSettingsMessage('Failed to update profile.');
    }
  };

  const handleUpgrade = async () => {
    try {
      await api.post('users/upgrade/');
      setSettingsMessage('Successfully upgraded to Host!');
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      setSettingsMessage('Failed to upgrade role.');
    }
  };

  // Calculate Host Earnings
  const totalEarnings = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((acc, curr) => acc + parseFloat(curr.total_price), 0);
    
  const pendingEarnings = bookings
    .filter(b => b.status === 'pending')
    .reduce((acc, curr) => acc + parseFloat(curr.total_price), 0);

  // Chart Data Processing
  const processMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = months.map(m => ({ name: m, amount: 0, count: 0 }));
    
    bookings.forEach(b => {
      if (b.status === 'confirmed') {
        const date = new Date(b.created_at || b.check_in_date);
        const year = date.getFullYear();
        const currentYear = new Date().getFullYear();
        
        if (chartFilter === 'This Year' && year !== currentYear) return;

        const monthIndex = date.getMonth();
        data[monthIndex].amount += parseFloat(b.total_price);
        data[monthIndex].count += 1;
      }
    });
    return data;
  };
  const chartData = processMonthlyData();

  if (loading) return <div className="flex justify-center h-screen items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (!profile) return null;

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden relative">
      
      {/* Mobile Menu Toggle */}
      <button 
        className="md:hidden absolute top-4 left-4 z-50 bg-white p-2 rounded-full shadow-md text-primary"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-40 w-64 h-full bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out shadow-lg md:shadow-none`}>
        <div className="p-8 border-b border-gray-100 flex flex-col items-center">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent text-white rounded-full flex items-center justify-center mb-4 text-3xl font-bold shadow-lg">
            {profile.username.charAt(0).toUpperCase()}
          </div>
          <h2 className="font-bold text-xl text-center line-clamp-1">{profile.first_name || profile.username}</h2>
          <span className="mt-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-500 uppercase tracking-widest">{profile.role}</span>
        </div>
        
        <nav className="flex-1 py-6 flex flex-col space-y-2 px-4">
          <button 
            onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }} 
            className={`flex items-center px-4 py-3 font-semibold rounded-xl transition ${activeTab === 'overview' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <User className="w-5 h-5 mr-3" /> Dashboard
          </button>
          
          {profile.role === 'guest' ? (
            <>
              <button 
                onClick={() => { setActiveTab('trips'); setSidebarOpen(false); }} 
                className={`flex items-center px-4 py-3 font-semibold rounded-xl transition ${activeTab === 'trips' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Map className="w-5 h-5 mr-3" /> My Trips
              </button>
              <button 
                onClick={() => { setActiveTab('wishlist'); setSidebarOpen(false); }} 
                className={`flex items-center px-4 py-3 font-semibold rounded-xl transition ${activeTab === 'wishlist' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Heart className="w-5 h-5 mr-3" /> Wishlist
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => { setActiveTab('properties'); setSidebarOpen(false); }} 
                className={`flex items-center px-4 py-3 font-semibold rounded-xl transition ${activeTab === 'properties' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Home className="w-5 h-5 mr-3" /> Listings
              </button>
              <button 
                onClick={() => { setActiveTab('reservations'); setSidebarOpen(false); }} 
                className={`flex items-center px-4 py-3 font-semibold rounded-xl transition ${activeTab === 'reservations' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Calendar className="w-5 h-5 mr-3" /> Reservations
              </button>
              <button 
                onClick={() => { setActiveTab('earnings'); setSidebarOpen(false); }} 
                className={`flex items-center px-4 py-3 font-semibold rounded-xl transition ${activeTab === 'earnings' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <DollarSign className="w-5 h-5 mr-3" /> Earnings
              </button>
            </>
          )}

          <div className="pt-4 mt-4 border-t border-gray-100">
            <button 
              onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }} 
              className={`flex items-center px-4 py-3 font-semibold rounded-xl transition w-full ${activeTab === 'settings' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Settings className="w-5 h-5 mr-3" /> Settings
            </button>
          </div>
        </nav>
        
        <div className="p-4 border-t border-gray-100">
          <Link to="/" className="flex items-center justify-center px-4 py-3 mb-2 w-full text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition font-bold">
            Back to Homepage
          </Link>
          <button onClick={handleLogout} className="flex items-center justify-center px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl transition font-bold">
            <LogOut className="w-5 h-5 mr-3" /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-gray-50 overflow-hidden flex flex-col h-full">
        
        {/* Dashboard Header Navbar */}
        <header className="bg-white border-b border-gray-100 p-4 px-8 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-800 hidden md:block capitalize">{activeTab}</h2>
          <div className="md:hidden"></div> {/* Spacer for mobile */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition relative"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-bold text-gray-800">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer ${n.unread ? 'bg-blue-50/30' : ''}`}>
                        <p className={`text-sm ${n.unread ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>{n.text}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 text-center border-t border-gray-100">
                    <button className="text-sm font-bold text-primary hover:underline">Mark all as read</button>
                  </div>
                </div>
              )}
            </div>
            <Link to="/" className="text-sm font-bold text-gray-600 hover:text-primary transition bg-gray-100 px-4 py-2 rounded-full hidden sm:block">
              Exit to App
            </Link>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="animate-in fade-in duration-500">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2 mt-2 md:mt-0">Dashboard Overview</h1>
            <p className="text-lg text-gray-500 mb-10">Welcome back, {profile.first_name || profile.username}. Here's what's happening today.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {profile.role === 'guest' ? (
                <>
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                      <Map className="w-7 h-7" />
                    </div>
                    <h3 className="text-gray-500 font-semibold mb-2 text-lg">Total Trips</h3>
                    <p className="text-5xl font-black text-gray-900">{bookings.length}</p>
                  </div>
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div className="w-14 h-14 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center mb-6">
                      <Heart className="w-7 h-7" />
                    </div>
                    <h3 className="text-gray-500 font-semibold mb-2 text-lg">Wishlisted</h3>
                    <p className="text-5xl font-black text-gray-900">{wishlist.length}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                      <Home className="w-7 h-7" />
                    </div>
                    <h3 className="text-gray-500 font-semibold mb-2 text-lg">Active Listings</h3>
                    <p className="text-5xl font-black text-gray-900">{properties.length}</p>
                  </div>
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                      <Calendar className="w-7 h-7" />
                    </div>
                    <h3 className="text-gray-500 font-semibold mb-2 text-lg">Total Reservations</h3>
                    <p className="text-5xl font-black text-gray-900">{bookings.length}</p>
                  </div>
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                      <DollarSign className="w-7 h-7" />
                    </div>
                    <h3 className="text-gray-500 font-semibold mb-2 text-lg">Confirmed Earnings</h3>
                    <p className="text-5xl font-black text-gray-900">${totalEarnings.toLocaleString()}</p>
                  </div>
                </>
              )}
            </div>
            
            {/* Charts Section */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">{profile.role === 'host' ? 'Earnings Overview' : 'Spending Overview'}</h3>
                <select 
                  className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-4 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={chartFilter}
                  onChange={(e) => setChartFilter(e.target.value)}
                >
                  <option value="All Time">All Time</option>
                  <option value="This Year">This Year</option>
                </select>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} tickFormatter={(val) => `$${val}`} />
                    <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    <Bar dataKey="amount" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <h3 className="text-3xl font-extrabold mb-4">Ready for something new?</h3>
                <p className="mb-8 text-lg opacity-90 max-w-lg">Discover thousands of spectacular properties added daily across the globe. Your next great memory is waiting.</p>
                <Link to="/" className="inline-flex items-center px-8 py-4 bg-white text-gray-900 font-bold rounded-full hover:scale-105 transition shadow-xl text-lg">
                  Explore Destinations <ChevronRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
              <div className="absolute top-0 right-0 h-full w-1/2 opacity-30 hidden md:block">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-white">
                  <path d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.3,-46.3C90.8,-33.5,96.8,-18.1,96.5,-2.9C96.2,12.3,89.6,27.3,80.1,40.1C70.6,52.9,58.2,63.5,44.4,71.3C30.6,79.1,15.3,84.1,-0.6,85.1C-16.5,86.1,-33,83.1,-46.8,75.4C-60.6,67.7,-71.7,55.3,-80.1,41.2C-88.5,27.1,-94.2,11.3,-92.6,-3.6C-91,-18.5,-82.1,-32.5,-71.4,-43.6C-60.7,-54.7,-48.2,-62.9,-35.1,-70.6C-22,-78.3,-8.3,-85.5,3.6,-81.4C15.5,-77.3,30.6,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* TRIPS TAB (GUEST) */}
        {activeTab === 'trips' && profile.role === 'guest' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-8 mt-8 md:mt-0">My Trips</h2>
            {bookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 border border-gray-100 shadow-sm text-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6"><Map className="w-12 h-12 text-gray-300" /></div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No trips booked yet</h3>
                <p className="text-gray-500 mb-8 text-lg">Time to dust off your bags and start planning your next adventure.</p>
                <button onClick={() => navigate('/')} className="bg-gray-900 text-white font-bold px-10 py-4 rounded-full hover:bg-black transition shadow-lg text-lg">
                  Start searching
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {bookings.map(booking => (
                  <div key={booking.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 group flex flex-col">
                      <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
                      <img 
                        src={booking.property_detail?.images?.length > 0 ? booking.property_detail.images[0].image : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80'} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700" 
                      />
                      <div className="absolute top-4 left-4">
                        <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-md ${
                          booking.status === 'confirmed' ? 'bg-green-500 text-white' : 
                          booking.status === 'pending' ? 'bg-yellow-400 text-yellow-900' : 'bg-red-500 text-white'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">{booking.property_detail?.city}, {booking.property_detail?.country}</p>
                        <h3 className="font-extrabold text-2xl line-clamp-1 mb-4 text-gray-900">{booking.property_detail?.title}</h3>
                        <div className="inline-flex items-center text-sm text-gray-700 bg-gray-50 py-2.5 px-4 rounded-xl font-semibold border border-gray-100">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(booking.check_in_date).toLocaleDateString()} &rarr; {new Date(booking.check_out_date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-gray-500 font-semibold text-lg">Total Paid</span>
                        <span className="font-black text-2xl text-gray-900">${booking.total_price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* WISHLIST TAB (GUEST) */}
        {activeTab === 'wishlist' && profile.role === 'guest' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-8 mt-8 md:mt-0">Wishlist</h2>
            {wishlist.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 border border-gray-100 shadow-sm text-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6"><Heart className="w-12 h-12 text-gray-300" /></div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Nothing saved yet</h3>
                <p className="text-gray-500 mb-8 text-lg">Explore properties and click the heart icon to save them here.</p>
                <button onClick={() => navigate('/')} className="bg-gray-900 text-white font-bold px-10 py-4 rounded-full hover:bg-black transition shadow-lg text-lg">
                  Explore stays
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlist.map((property) => (
                  <div onClick={() => navigate(`/property/${property.id}`)} key={property.id} className="group cursor-pointer bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden pb-4">
                    <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden mb-4">
                      <img 
                        src={property.images?.length > 0 ? property.images[0].image : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80'} 
                        alt={property.title} 
                        className="object-cover w-full h-full group-hover:scale-105 transition duration-500 ease-out"
                      />
                      <div className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg">
                        <Heart className="w-5 h-5 fill-primary text-primary" strokeWidth={2} />
                      </div>
                    </div>
                    <div className="px-4">
                      <h3 className="font-bold text-gray-900 line-clamp-1 text-lg">{property.city}, {property.country}</h3>
                      <p className="text-gray-500 text-sm line-clamp-1 mt-1 font-medium">{property.title}</p>
                      <p className="mt-3 font-black text-gray-900 text-lg">
                        ${property.price_per_night} <span className="font-medium text-gray-500 text-sm">/ night</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROPERTIES TAB (HOST) */}
        {activeTab === 'properties' && profile.role === 'host' && (
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 mt-8 md:mt-0 gap-4">
              <h2 className="text-4xl font-extrabold text-gray-900">Listings</h2>
              <button 
                onClick={openCreateModal}
                className="bg-gray-900 text-white font-bold px-8 py-3.5 rounded-full hover:bg-black transition shadow-lg flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" /> Add New Property
              </button>
            </div>
            {properties.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 border border-gray-100 shadow-sm text-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6"><Home className="w-12 h-12 text-gray-300" /></div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">You haven't listed any properties yet.</h3>
                <p className="text-gray-500 mb-8 text-lg">Start hosting and earning today.</p>
                <button onClick={openCreateModal} className="border-2 border-primary text-primary font-bold px-10 py-4 rounded-full hover:bg-primary hover:text-white transition shadow-sm text-lg">
                  Create your first listing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {properties.map(property => (
                  <div key={property.id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm flex flex-col group relative">
                    <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
                      <img 
                        src={property.images?.length > 0 ? property.images[0].image : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80'} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700" 
                      />
                      <div className="absolute top-4 right-4 flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(property)} className="p-3 bg-white rounded-full text-gray-700 shadow-xl hover:scale-110 transition-transform">
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button onClick={() => confirmDelete(property)} className="p-3 bg-white rounded-full text-red-500 shadow-xl hover:scale-110 transition-transform hover:bg-red-50">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="p-6 flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="font-extrabold text-2xl line-clamp-1 mb-2 text-gray-900">{property.title}</h3>
                        <p className="text-base text-gray-500 font-semibold mb-4">{property.city}, {property.country}</p>
                      </div>
                      <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-100">
                        <div className="bg-gray-50 px-4 py-2 rounded-xl text-sm text-gray-600 font-bold border border-gray-100">
                          {property.max_guests} Guests
                        </div>
                        <p className="font-black text-2xl text-gray-900">${property.price_per_night} <span className="font-semibold text-base text-gray-500">/ night</span></p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RESERVATIONS TAB (HOST) */}
        {activeTab === 'reservations' && profile.role === 'host' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-8 mt-8 md:mt-0">Reservations</h2>
            {bookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 border border-gray-100 shadow-sm text-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6"><Calendar className="w-12 h-12 text-gray-300" /></div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No reservations yet</h3>
                <p className="text-gray-500 text-lg">When guests book your properties, they will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map(booking => (
                  <div key={booking.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition">
                    <div className="flex items-center gap-6 flex-1">
                      <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0 hidden sm:block">
                        <img 
                          src={booking.property_detail?.images?.length > 0 ? booking.property_detail.images[0].image : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80'} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Booking #{booking.id}</p>
                        <h3 className="font-bold text-xl text-gray-900 mb-1 line-clamp-1">{booking.property_detail?.title}</h3>
                        <p className="text-gray-500 font-medium">Guest: <span className="text-gray-900">{booking.guest_detail?.username}</span></p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 px-6 py-3 rounded-xl border border-gray-100 text-center shrink-0">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Dates</p>
                      <p className="font-semibold text-gray-900">{new Date(booking.check_in_date).toLocaleDateString()} &rarr; {new Date(booking.check_out_date).toLocaleDateString()}</p>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between shrink-0 gap-2">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700 border border-green-200' : 
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {booking.status}
                      </span>
                      <p className="font-black text-2xl text-gray-900">${booking.total_price}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EARNINGS TAB (HOST) */}
        {activeTab === 'earnings' && profile.role === 'host' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-8 mt-8 md:mt-0">Earnings Dashboard</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-10 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-green-100 font-bold text-lg mb-2 uppercase tracking-widest">Total Confirmed Revenue</h3>
                  <p className="text-6xl font-black">${totalEarnings.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                  <p className="mt-6 text-green-100 font-medium">Ready for payout on next scheduled cycle.</p>
                </div>
                <DollarSign className="absolute -right-6 -bottom-6 w-48 h-48 text-white opacity-20" />
              </div>
              
              <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-center">
                <h3 className="text-gray-400 font-bold text-lg mb-2 uppercase tracking-widest">Pending Revenue</h3>
                <p className="text-6xl font-black text-gray-900">${pendingEarnings.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                <p className="mt-6 text-gray-500 font-medium">Awaiting payment confirmation or host approval.</p>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Transactions</h3>
              {bookings.filter(b => b.status !== 'cancelled').length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recent transaction data available.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-4 px-4 text-sm font-bold text-gray-400 uppercase tracking-widest">Booking ID</th>
                        <th className="py-4 px-4 text-sm font-bold text-gray-400 uppercase tracking-widest">Property</th>
                        <th className="py-4 px-4 text-sm font-bold text-gray-400 uppercase tracking-widest">Date Booked</th>
                        <th className="py-4 px-4 text-sm font-bold text-gray-400 uppercase tracking-widest">Status</th>
                        <th className="py-4 px-4 text-sm font-bold text-gray-400 uppercase tracking-widest text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bookings.filter(b => b.status !== 'cancelled').map(booking => (
                        <tr key={booking.id} className="hover:bg-gray-50 transition">
                          <td className="py-4 px-4 font-medium text-gray-900">#{booking.id}</td>
                          <td className="py-4 px-4 font-semibold text-gray-700">{booking.property_detail?.title}</td>
                          <td className="py-4 px-4 text-gray-500">{new Date(booking.created_at).toLocaleDateString()}</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-black text-gray-900 text-right">+ ${booking.total_price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="animate-in fade-in duration-300 max-w-3xl">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-8 mt-8 md:mt-0">Account Settings</h2>
            
            {settingsMessage && (
              <div className={`p-4 rounded-xl mb-6 font-medium ${settingsMessage.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {settingsMessage}
              </div>
            )}

            {profile.role === 'guest' && (
              <div className="bg-gradient-to-r from-primary to-accent p-8 rounded-3xl text-white shadow-xl mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Want to earn extra income?</h3>
                  <p className="text-white text-opacity-90">Unlock hosting features and start listing your properties today.</p>
                </div>
                <button onClick={handleUpgrade} className="bg-white text-primary font-bold px-8 py-4 rounded-full shadow-lg hover:scale-105 transition-transform whitespace-nowrap">
                  Become a Host
                </button>
              </div>
            )}

            <form onSubmit={handleSettingsSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">First Name</label>
                  <input type="text" className="w-full px-4 py-4 rounded-xl border border-gray-300 focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:border-primary outline-none transition bg-gray-50 focus:bg-white font-medium" value={settingsData.first_name} onChange={(e) => setSettingsData({...settingsData, first_name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">Last Name</label>
                  <input type="text" className="w-full px-4 py-4 rounded-xl border border-gray-300 focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:border-primary outline-none transition bg-gray-50 focus:bg-white font-medium" value={settingsData.last_name} onChange={(e) => setSettingsData({...settingsData, last_name: e.target.value})} />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold mb-2 text-gray-700">Email Address</label>
                <input type="email" className="w-full px-4 py-4 rounded-xl border border-gray-300 bg-gray-100 text-gray-500 outline-none font-medium" value={settingsData.email} disabled />
                <p className="text-xs text-gray-500 mt-2 font-medium">Email cannot be changed.</p>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-bold mb-2 text-gray-700">Bio</label>
                <textarea className="w-full px-4 py-4 rounded-xl border border-gray-300 h-32 resize-none focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:border-primary outline-none transition bg-gray-50 focus:bg-white font-medium" value={settingsData.bio} onChange={(e) => setSettingsData({...settingsData, bio: e.target.value})} placeholder="Tell us a little bit about yourself..."></textarea>
              </div>

              <button type="submit" className="bg-gray-900 text-white font-extrabold py-4 px-8 rounded-xl hover:bg-black shadow-lg transition-transform active:scale-95 text-lg w-full md:w-auto">
                Save Profile
              </button>
            </form>
          </div>
        )}
        
        </div>
      </main>

      {/* Property Modal (Create/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-extrabold text-gray-900">{isEditing ? 'Edit Property' : 'List a New Property'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Title</label>
                <input required type="text" className="w-full border border-gray-300 rounded-xl p-4 focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:border-primary outline-none transition bg-gray-50 focus:bg-white font-medium" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Cozy Beachfront Villa" />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Cover Image</label>
                <div className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition cursor-pointer relative bg-gray-50 hover:border-primary">
                  <Upload className="w-10 h-10 mb-3 text-primary" />
                  <span className="text-sm font-bold">{imageFile ? imageFile.name : 'Click to upload a cover photo'}</span>
                  <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Description</label>
                <textarea required className="w-full border border-gray-300 rounded-xl p-4 h-32 focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:border-primary outline-none resize-none transition bg-gray-50 focus:bg-white font-medium" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe your place..." />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">City</label>
                  <input required type="text" className="w-full border border-gray-300 rounded-xl p-4 focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:border-primary outline-none transition bg-gray-50 focus:bg-white font-medium" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">Country</label>
                  <input required type="text" className="w-full border border-gray-300 rounded-xl p-4 focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:border-primary outline-none transition bg-gray-50 focus:bg-white font-medium" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">Price per night ($)</label>
                  <input required type="number" step="0.01" min="1" className="w-full border border-gray-300 rounded-xl p-4 focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:border-primary outline-none transition bg-gray-50 focus:bg-white font-medium" value={formData.price_per_night} onChange={e => setFormData({...formData, price_per_night: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">Max Guests</label>
                  <input required type="number" min="1" className="w-full border border-gray-300 rounded-xl p-4 focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:border-primary outline-none transition bg-gray-50 focus:bg-white font-medium" value={formData.max_guests} onChange={e => setFormData({...formData, max_guests: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Amenities (comma separated)</label>
                <input required type="text" className="w-full border border-gray-300 rounded-xl p-4 focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:border-primary outline-none transition bg-gray-50 focus:bg-white font-medium" value={formData.amenities} onChange={e => setFormData({...formData, amenities: e.target.value})} placeholder="WiFi, Pool, Kitchen..." />
              </div>
              <button type="submit" className="w-full bg-gray-900 text-white font-extrabold py-5 rounded-xl mt-6 hover:bg-black shadow-xl transition-transform active:scale-95 text-lg">
                {isEditing ? 'Save Changes' : 'Publish Listing'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-50 mb-6">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-extrabold mb-3 text-gray-900">Delete Property?</h3>
            <p className="text-gray-500 mb-8 font-medium">Are you sure you want to delete "{propertyToDelete?.title}"? This action cannot be undone.</p>
            <div className="flex space-x-4">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-4 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleDeleteProperty} className="flex-1 py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition shadow-lg">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
