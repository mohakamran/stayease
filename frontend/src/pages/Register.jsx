import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '',
    role: 'guest'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = "Sign Up | StayEase";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    try {
      await api.post('users/register/', formData);
      navigate('/login');
    } catch (err) {
      const errorMsg = err.response?.data?.username ? 'Username already exists.' : 'Registration failed. Please check your inputs.';
      setError(errorMsg);
    }
  };

  return (
    <div className="flex bg-white rounded-3xl shadow-2xl overflow-hidden mt-8 border border-gray-100 min-h-[600px]">
      <div className="hidden md:block w-1/2 relative">
        <img 
          src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80" 
          className="absolute inset-0 w-full h-full object-cover" 
          alt="Register background" 
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-end p-12 text-white">
          <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">Join StayEase.</h2>
          <p className="text-lg font-medium drop-shadow-md">Unlock access to extraordinary homes, or start earning by sharing yours.</p>
        </div>
      </div>
      
      <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
        <h2 className="text-3xl font-bold mb-8">Create an account</h2>
        {error && <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 font-medium">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Username</label>
            <input
              type="text"
              placeholder="Choose a username"
              className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition bg-gray-50 focus:bg-white"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Email address</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition bg-gray-50 focus:bg-white"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition bg-gray-50 focus:bg-white"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 mt-2">I want to...</label>
            <div className="flex space-x-4">
              <label className={`flex-1 border p-4 rounded-xl cursor-pointer transition ${formData.role === 'guest' ? 'border-primary bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}>
                <input type="radio" name="role" value="guest" className="hidden" onChange={(e) => setFormData({...formData, role: e.target.value})} checked={formData.role === 'guest'} />
                <span className="block font-bold text-gray-800">Travel</span>
                <span className="text-xs text-gray-500">Book places</span>
              </label>
              <label className={`flex-1 border p-4 rounded-xl cursor-pointer transition ${formData.role === 'host' ? 'border-primary bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}>
                <input type="radio" name="role" value="host" className="hidden" onChange={(e) => setFormData({...formData, role: e.target.value})} checked={formData.role === 'host'} />
                <span className="block font-bold text-gray-800">Host</span>
                <span className="text-xs text-gray-500">List properties</span>
              </label>
            </div>
          </div>
          <button type="submit" className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-opacity-90 transition-transform active:scale-95 shadow-lg mt-6 text-lg">
            Sign Up
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
