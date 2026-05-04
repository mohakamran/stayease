import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PropertyDetail from './pages/PropertyDetail';
import Booking from './pages/Booking';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import StaticPage from './pages/StaticPage';
import ForgotPassword from './pages/ForgotPassword';
import Footer from './components/Footer';

function AppContent() {
  const location = useLocation();
  const isDashboardLayout = location.pathname.startsWith('/dashboard');

  return (
    <div className={`flex flex-col min-h-screen font-sans text-gray-900 bg-white ${isDashboardLayout ? 'bg-gray-50' : ''}`}>
      {!isDashboardLayout && <Navbar />}
      
      <main className={`flex-grow ${isDashboardLayout ? '' : 'pb-10'}`}>
        <Routes>
          {/* Edge to edge home page */}
          <Route path="/" element={<Home />} />
          
          {/* Padded inner pages */}
          <Route path="/login" element={<div className="pt-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"><Login /></div>} />
          <Route path="/register" element={<div className="pt-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"><Register /></div>} />
          <Route path="/forgot-password" element={<div className="pt-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"><ForgotPassword /></div>} />
          <Route path="/property/:id" element={<div className="pt-28 px-4 sm:px-6 lg:px-8"><PropertyDetail /></div>} />
          <Route path="/booking/:id" element={<div className="pt-28 px-4 sm:px-6 lg:px-8"><Booking /></div>} />
          <Route path="/pages/:slug" element={<div className="pt-28 px-4 sm:px-6 lg:px-8"><StaticPage /></div>} />
          
          {/* Full viewport dashboard pages */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      
      {!isDashboardLayout && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
