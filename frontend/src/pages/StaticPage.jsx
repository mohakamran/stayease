import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function StaticPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // Convert slug to a readable title (e.g., 'help-center' -> 'Help Center')
  const title = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="max-w-4xl mx-auto mt-12 mb-20 px-4">
      <button 
        onClick={() => navigate(-1)} 
        className="text-primary font-medium hover:underline mb-8 inline-block"
      >
        &larr; Back
      </button>
      
      <div className="bg-white rounded-3xl shadow-xl p-10 md:p-16 border border-gray-100">
        <h1 className="text-4xl font-extrabold mb-8 text-gray-900">{title}</h1>
        
        <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
          <p>
            Welcome to the <strong>{title}</strong> page. This is a placeholder page generated for demonstration purposes. In a fully production-ready application, this section would contain detailed policies, comprehensive guides, or interactive resources specific to this topic.
          </p>
          <p>
            StayEase is committed to providing a seamless, secure, and intuitive experience for all of our guests and hosts. Whether you are looking for support, want to join our community initiatives, or are interested in reading about our corporate governance, we are glad you are here.
          </p>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 my-8">
            <h3 className="font-bold text-xl mb-3 text-gray-800">Quick Links</h3>
            <ul className="list-disc list-inside space-y-2 text-primary">
              <li className="cursor-pointer hover:underline">Contact Customer Support</li>
              <li className="cursor-pointer hover:underline">Read our Community Standards</li>
              <li className="cursor-pointer hover:underline">View the latest updates</li>
            </ul>
          </div>
          <p>
            If you have any urgent inquiries regarding your account or an active booking, please navigate to your Dashboard or reach out directly to our 24/7 support line. Thank you for choosing StayEase!
          </p>
        </div>
      </div>
    </div>
  );
}
