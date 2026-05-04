import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = "Log In | StayEase";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('users/login/', formData);
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      navigate('/');
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="flex bg-white rounded-3xl shadow-2xl overflow-hidden mt-8 border border-gray-100 min-h-[600px]">
      <div className="hidden md:block w-1/2 relative">
        <img 
          src="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80" 
          className="absolute inset-0 w-full h-full object-cover" 
          alt="Login background" 
        />
        <div className="absolute inset-0 bg-black bg-opacity-20 flex flex-col justify-end p-12 text-white">
          <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">Welcome back.</h2>
          <p className="text-lg font-medium drop-shadow-md">Continue your journey and discover your next perfect stay.</p>
        </div>
      </div>
      
      <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
        <h2 className="text-3xl font-bold mb-8">Log in to StayEase</h2>
        {error && <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 font-medium">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              className="w-full px-4 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition bg-gray-50 focus:bg-white"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-700">Password</label>
              <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">Forgot password?</Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition bg-gray-50 focus:bg-white"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          <button type="submit" className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-opacity-90 transition-transform active:scale-95 shadow-lg mt-4 text-lg">
            Log In
          </button>
        </form>
        <p className="mt-8 text-center text-gray-600">
          Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
