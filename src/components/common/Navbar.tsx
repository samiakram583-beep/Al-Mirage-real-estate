import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Phone,
  MessageCircle,
  Heart,
  Menu,
  X,
  Building,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useSettings } from '../../context/SettingsContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { favorites } = useFavorites();
  const { settings } = useSettings();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { name: 'Properties', href: '/properties' },
    { name: 'Buy', href: '/buy' },
    { name: 'Rent', href: '/rent' },
    { name: 'Areas', href: '/areas' },
    { name: 'Consultants', href: '/agents' },
    { name: 'Services', href: '/services' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const hasPhone = Boolean(settings.phone && settings.phone !== '+92 300 0000000');
  const hasWhatsapp = Boolean(settings.whatsapp && settings.whatsapp !== '+92 300 0000000');

  return (
    <header className="sticky top-0 z-40 w-full bg-white/88 backdrop-blur-md text-[#171A18] border-b border-[#E4E6E1]">
      {/* Top Bar with Business Location & Direct Contact */}
      <div className="bg-white/60 text-xs py-1.5 px-4 sm:px-8 border-b border-[#E4E6E1] text-[#66706A]">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-[#171A18] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#287A58] inline-block" />
              Bahria Town & Bahria Orchard Lahore
            </span>
            <span className="hidden md:inline text-[#E4E6E1]">|</span>
            <span className="hidden md:inline text-[#66706A]">
              Verified Properties & Local Advisory
            </span>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {hasPhone && (
              <a
                href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                className="flex items-center gap-1.5 text-[#171A18] hover:text-[#173C32] font-semibold transition"
              >
                <Phone className="w-3.5 h-3.5 text-[#66706A]" />
                <span>{settings.phone}</span>
              </a>
            )}

            {hasWhatsapp && (
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[#287A58] hover:text-[#0F2D25] font-semibold transition"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>WhatsApp</span>
              </a>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#173C32] text-white hover:bg-[#0F2D25] transition text-[11px] font-semibold"
                >
                  <Shield className="w-3 h-3 text-[#B89B5E]" />
                  <span>Admin Panel</span>
                </Link>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="text-[11px] text-[#66706A] hover:text-rose-600 transition font-medium cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/admin/login"
                className="text-[#66706A] hover:text-[#173C32] transition text-xs font-medium"
              >
                Admin Panel Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#173C32] text-white flex items-center justify-center font-bold shadow-xs group-hover:bg-[#0F2D25] transition-colors">
            <Building className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <span className="text-base sm:text-lg font-black tracking-tight text-[#171A18] block leading-tight truncate">
              {settings.business_name}
            </span>
            <p className="text-[11px] text-[#66706A] font-medium truncate">
              Bahria Town • Bahria Orchard • Lahore
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                isActive(item.href)
                  ? 'text-[#173C32] bg-[#173C32]/8 font-black'
                  : 'text-[#171A18] hover:text-[#173C32] hover:bg-black/5'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right CTA / Favorites */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            to="/properties?favorites=true"
            className="relative p-2.5 rounded-xl border border-[#E4E6E1] text-[#171A18] hover:text-rose-600 hover:bg-white/80 transition"
            title="Saved Properties"
          >
            <Heart className={`w-4 h-4 ${favorites.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#173C32] text-white text-[9px] font-bold flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </Link>

          {user ? (
            <Link
              to="/admin/properties/new"
              className="px-4 py-2.5 rounded-xl bg-[#173C32] hover:bg-[#0F2D25] text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5"
            >
              <span>+ Add Property</span>
            </Link>
          ) : (
            <Link
              to="/contact"
              className="px-4 py-2.5 rounded-xl bg-[#173C32] hover:bg-[#0F2D25] text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5"
            >
              <span>Contact Agency</span>
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            to="/properties?favorites=true"
            className="relative p-2 rounded-lg border border-[#E4E6E1] text-[#171A18]"
          >
            <Heart className={`w-4 h-4 ${favorites.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#173C32] text-white text-[9px] font-bold flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-[#E4E6E1] text-[#171A18] hover:bg-white/80 transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-md border-t border-[#E4E6E1] px-5 py-6 space-y-4 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-2 pb-4 border-b border-[#E4E6E1]">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-xl text-xs font-bold ${
                  isActive(item.href)
                    ? 'bg-[#173C32] text-white'
                    : 'text-[#171A18] hover:bg-[#173C32]/8'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            {settings.phone && (
              <a
                href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                className="w-full py-2.5 px-4 rounded-xl bg-[#173C32] hover:bg-[#0F2D25] text-white font-bold text-center text-xs flex items-center justify-center gap-2 shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call {settings.phone}</span>
              </a>
            )}
            {isAuthenticated ? (
              <div className="flex gap-2">
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#173C32] text-white font-bold text-center text-xs"
                >
                  Admin Panel
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="py-2.5 px-3 rounded-xl border border-rose-300 text-rose-600 font-bold text-xs"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl border border-[#E4E6E1] text-[#171A18] hover:text-[#173C32] font-bold text-center text-xs"
              >
                Admin Panel Login
              </Link>
            )}
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 px-4 rounded-xl border border-[#173C32] text-[#173C32] hover:bg-[#173C32] hover:text-white font-bold text-center text-xs transition"
            >
              Contact Office
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
