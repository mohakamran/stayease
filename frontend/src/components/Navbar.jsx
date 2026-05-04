import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, User, LogOut, Menu, Globe, ChevronDown, Heart } from 'lucide-react';
import api from '../api/client';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('access_token');
  const [userRole, setUserRole] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (token) {
      api.get('users/profile/')
        .then(res => setUserRole(res.data.role))
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setUserRole(null);
        });
    }
  }, [token]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUserRole(null);
    setDropdownOpen(false);
    navigate('/login');
  };

  const isHome = location.pathname === '/';

  return (
    <nav className={`fixed w-full z-50 top-0 transition-all duration-300 ${scrolled || !isHome ? 'bg-white shadow-sm border-b border-gray-100 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mr-3 group-hover:scale-105 transition-transform shadow-md">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className={`text-2xl font-black tracking-tight transition-colors ${scrolled || !isHome ? 'text-primary' : 'text-white drop-shadow-md'}`}>StayEase</span>
            </Link>
          </div>
          
          {/* Middle Nav (Desktop) */}
          <div className={`hidden md:flex items-center space-x-6 font-bold transition-colors ${scrolled || !isHome ? 'text-gray-700' : 'text-white drop-shadow-md'}`}>
            <Link to="/" className="hover:text-primary transition">Places to stay</Link>
            <Link to="/" className="hover:text-primary transition opacity-70">Experiences</Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className={`hidden sm:flex items-center space-x-4 font-bold transition-colors ${scrolled || !isHome ? 'text-gray-700' : 'text-white drop-shadow-md'}`}>
              <Link to={token ? "/dashboard" : "/register"} className="hover:bg-gray-100 hover:text-gray-900 px-4 py-2 rounded-full transition">
                StayEase your home
              </Link>
              <button className="hover:bg-gray-100 hover:text-gray-900 p-2 rounded-full transition">
                <Globe className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center space-x-2 border p-2 pl-4 rounded-full transition hover:shadow-md ${scrolled || !isHome ? 'bg-white border-gray-200' : 'bg-white border-transparent'}`}
              >
                <Menu className="w-5 h-5 text-gray-500" />
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white">
                  <User className="w-5 h-5" />
                </div>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl py-3 border border-gray-100 text-sm font-semibold text-gray-700 z-50">
                  {token ? (
                    <>
                      <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="block px-5 py-3 hover:bg-gray-50 transition">Dashboard</Link>
                      {userRole === 'guest' && (
                        <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="block px-5 py-3 hover:bg-gray-50 transition">Wishlist</Link>
                      )}
                      {userRole === 'host' && (
                        <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="block px-5 py-3 hover:bg-gray-50 transition">My Properties</Link>
                      )}
                      <div className="border-t border-gray-100 my-2"></div>
                      <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="block px-5 py-3 hover:bg-gray-50 transition">Account Settings</Link>
                      <button onClick={handleLogout} className="block w-full text-left px-5 py-3 hover:bg-gray-50 transition text-red-600">Log Out</button>
                    </>
                  ) : (
                    <>
                      <Link to="/register" onClick={() => setDropdownOpen(false)} className="block px-5 py-3 hover:bg-gray-50 transition font-black text-gray-900">Sign Up</Link>
                      <Link to="/login" onClick={() => setDropdownOpen(false)} className="block px-5 py-3 hover:bg-gray-50 transition">Log In</Link>
                      <div className="border-t border-gray-100 my-2"></div>
                      <Link to="/register" onClick={() => setDropdownOpen(false)} className="block px-5 py-3 hover:bg-gray-50 transition">StayEase your home</Link>
                      <Link to="/pages/help-center" onClick={() => setDropdownOpen(false)} className="block px-5 py-3 hover:bg-gray-50 transition">Help Center</Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
