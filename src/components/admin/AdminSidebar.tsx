import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building,
  PlusCircle,
  Inbox,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  MessageSquare,
  Briefcase,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminSidebar: React.FC<{ onCloseMobile?: () => void }> = ({ onCloseMobile }) => {
  const { user, logout } = useAuth();

  const links = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'All Properties', href: '/admin/properties', icon: Building },
    { name: 'Add Property', href: '/admin/properties/new', icon: PlusCircle },
    { name: 'Consultants', href: '/admin/agents', icon: Users },
    { name: 'Leads & Inquiries', href: '/admin/leads', icon: Inbox },
    { name: 'Testimonials', href: '/admin/testimonials', icon: MessageSquare },
    { name: 'Services', href: '/admin/services', icon: Briefcase },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/admin' && location.pathname === '/admin') return true;
    if (href !== '/admin' && location.pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <aside className="w-64 bg-[#171A18] text-white/80 flex flex-col h-full border-r border-[#242926]">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#242926] flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#173C32] text-white flex items-center justify-center font-bold">
            <Building className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-black text-white tracking-tight block truncate">
              BAHRIA REAL ESTATE
            </span>
            <p className="text-[10px] text-[#66706A]">Admin Control Panel</p>
          </div>
        </Link>
      </div>

      {/* Current User Pill */}
      {user && (
        <div className="px-5 py-3 bg-black/30 border-b border-[#242926] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#173C32] border border-[#B89B5E] text-white font-bold text-xs flex items-center justify-center shrink-0">
              {user.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.email}</p>
              <p className="text-[10px] text-[#B89B5E] uppercase font-semibold">Authorized Admin</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="p-3 flex-1 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <Link
              key={link.name}
              to={link.href}
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                active
                  ? 'bg-[#173C32] text-white font-bold shadow-xs'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-white/50'}`} />
                <span>{link.name}</span>
              </div>
              {active && <ChevronRight className="w-3.5 h-3.5 text-[#B89B5E]" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-[#242926] space-y-1">
        <Link
          to="/"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-white/70 hover:text-white hover:bg-white/5 transition"
        >
          <ExternalLink className="w-4 h-4 text-[#B89B5E]" />
          <span>View Public Website</span>
        </Link>
        <button
          type="button"
          onClick={() => logout()}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#B84A4A] hover:text-[#d26262] hover:bg-white/5 transition text-left cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
