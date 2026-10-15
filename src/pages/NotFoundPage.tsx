import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-6 text-center">
      <SEOHead title="Page Not Found | Real Estate In Bahria Town / Orchard Lahore" />

      <div className="max-w-md bg-white p-8 sm:p-12 rounded-3xl border border-[#E4E6E1] shadow-xl space-y-4">
        <span className="text-5xl font-black text-[#B89B5E] font-mono">404</span>
        <h1 className="text-xl sm:text-2xl font-black text-[#171A18] tracking-tight">
          Property or Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-[#66706A] leading-relaxed">
          The requested page may have expired, been relocated, or never existed in our directory.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
          <Link
            to="/"
            className="px-5 py-2.5 bg-[#173C32] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#0F2D25] transition flex items-center justify-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>
          <Link
            to="/properties"
            className="px-5 py-2.5 bg-slate-100 text-slate-800 font-bold text-xs rounded-xl hover:bg-slate-200 transition flex items-center justify-center gap-1.5"
          >
            <span>Search Properties</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
