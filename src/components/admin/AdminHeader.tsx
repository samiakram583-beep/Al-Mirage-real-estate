import React from 'react';
import { Menu, Database, ShieldCheck, ExternalLink, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onOpenMobileMenu?: () => void;
  actionButton?: React.ReactNode;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  subtitle,
  onOpenMobileMenu,
  actionButton,
}) => {
  const { user } = useAuth();

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-[#E4E6E1] px-4 sm:px-8 py-4 sticky top-0 z-30 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="p-2 rounded-xl border border-[#E4E6E1] text-[#171A18] hover:bg-black/5 md:hidden"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#171A18] tracking-tight font-sans">
            {title}
          </h1>
          {subtitle && <p className="text-xs text-[#66706A] mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Backend State Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 border border-[#E4E6E1] text-[11px] font-semibold text-[#66706A]">
          <Database className="w-3.5 h-3.5 text-[#B89B5E]" />
          <span>{isSupabaseConfigured ? 'Live Supabase DB' : 'Enterprise Engine'}</span>
        </div>

        {actionButton ? (
          actionButton
        ) : (
          <Link
            to="/admin/properties/new"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-[#173C32] hover:bg-[#0F2D25] text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Property</span>
          </Link>
        )}
      </div>
    </header>
  );
};
