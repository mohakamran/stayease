import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    // Mock API call
    setSubmitted(true);
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-2xl border border-gray-100 min-h-[400px] flex flex-col justify-center">
      {!submitted ? (
        <>
          <h2 className="text-3xl font-bold mb-4">Reset Password</h2>
          <p className="text-gray-600 mb-8">Enter the email address associated with your account, and we'll send you a link to reset your password.</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition bg-gray-50 focus:bg-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-opacity-90 transition-transform active:scale-95 shadow-lg text-lg">
              Send Reset Link
            </button>
          </form>
        </>
      ) : (
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Check your email</h2>
          <p className="text-gray-600 mb-8">If an account exists for <strong>{email}</strong>, you will receive password reset instructions shortly.</p>
          <Link to="/login" className="text-primary font-bold hover:underline">Return to Log In</Link>
        </div>
      )}
    </div>
  );
}
