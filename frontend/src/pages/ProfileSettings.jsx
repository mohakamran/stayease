import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function ProfileSettings() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    bio: ''
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('users/profile/');
        setProfile({
          username: response.data.username || '',
          email: response.data.email || '',
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          bio: response.data.bio || '',
          role: response.data.role || 'guest'
        });
      } catch (error) {
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('users/profile/', profile);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setMessage('Failed to update profile.');
    }
  };

  const handleUpgrade = async () => {
    try {
      await api.post('users/upgrade/');
      setProfile({...profile, role: 'host'});
      setMessage('Successfully upgraded to Host!');
      setTimeout(() => setMessage(''), 3000);
      // Reload page to update navbar
      window.location.reload();
    } catch (error) {
      setMessage('Failed to upgrade role.');
    }
  };

  if (loading) return <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
      
      {message && (
        <div className={`p-4 rounded-xl mb-6 font-medium ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      {profile.role === 'guest' && (
        <div className="bg-gradient-to-r from-primary to-accent p-8 rounded-3xl text-white shadow-xl mb-8 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold mb-2">Want to earn extra income?</h3>
            <p className="text-white text-opacity-90">Unlock hosting features and start listing your properties today.</p>
          </div>
          <button onClick={handleUpgrade} className="bg-white text-primary font-bold px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-transform">
            Become a Host
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">First Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              value={profile.first_name}
              onChange={(e) => setProfile({...profile, first_name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Last Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              value={profile.last_name}
              onChange={(e) => setProfile({...profile, last_name: e.target.value})}
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2 text-gray-700">Email Address</label>
          <input 
            type="email" 
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-500 outline-none"
            value={profile.email}
            disabled
          />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold mb-2 text-gray-700">Bio</label>
          <textarea 
            className="w-full px-4 py-3 rounded-xl border border-gray-300 h-32 resize-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            value={profile.bio}
            onChange={(e) => setProfile({...profile, bio: e.target.value})}
            placeholder="Tell us a little bit about yourself..."
          ></textarea>
        </div>

        <button type="submit" className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-opacity-90 transition-transform active:scale-95 shadow-lg">
          Save Profile
        </button>
      </form>
    </div>
  );
}
