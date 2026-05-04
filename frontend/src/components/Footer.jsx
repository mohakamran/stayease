import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t mt-16 py-12 text-sm text-gray-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-3">
              <li><Link to="/pages/help-center" className="hover:underline">Help Center</Link></li>
              <li><Link to="/pages/safety-information" className="hover:underline">Safety information</Link></li>
              <li><Link to="/pages/cancellation-options" className="hover:underline">Cancellation options</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Community</h4>
            <ul className="space-y-3">
              <li><Link to="/pages/disaster-relief" className="hover:underline">StayEase.org: disaster relief</Link></li>
              <li><Link to="/pages/support-refugees" className="hover:underline">Support Afghan refugees</Link></li>
              <li><Link to="/pages/combating-discrimination" className="hover:underline">Combating discrimination</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Hosting</h4>
            <ul className="space-y-3">
              <li><Link to="/pages/try-hosting" className="hover:underline">Try hosting</Link></li>
              <li><Link to="/pages/stayease-cover" className="hover:underline">StayEaseCover for Hosts</Link></li>
              <li><Link to="/pages/hosting-resources" className="hover:underline">Explore hosting resources</Link></li>
              <li><Link to="/pages/host-responsibly" className="hover:underline">How to host responsibly</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-4">About</h4>
            <ul className="space-y-3">
              <li><Link to="/pages/newsroom" className="hover:underline">Newsroom</Link></li>
              <li><Link to="/pages/new-features" className="hover:underline">Learn about new features</Link></li>
              <li><Link to="/pages/founders-letter" className="hover:underline">Letter from our founders</Link></li>
              <li><Link to="/pages/careers" className="hover:underline">Careers</Link></li>
              <li><Link to="/pages/investors" className="hover:underline">Investors</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-300 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="space-x-3">
            <span>© 2026 StayEase, Inc.</span>
            <span>·</span>
            <Link to="/pages/privacy" className="hover:underline">Privacy</Link>
            <span>·</span>
            <Link to="/pages/terms" className="hover:underline">Terms</Link>
            <span>·</span>
            <Link to="/pages/sitemap" className="hover:underline">Sitemap</Link>
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <span className="font-medium cursor-pointer hover:underline">English (US)</span>
            <span className="font-medium cursor-pointer hover:underline">$ USD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
