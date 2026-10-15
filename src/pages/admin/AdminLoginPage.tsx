import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building,
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  Database,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { SEOHead } from '../../components/common/SEOHead';
import { ADMIN_AUTHORIZED_EMAIL, isSupabaseConfigured } from '../../lib/supabase';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState(ADMIN_AUTHORIZED_EMAIL);
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect to /admin
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your administrator account password.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      showToast('Logged In Successfully', 'Welcome to the Administrator Console.', 'success');
      navigate('/admin', { replace: true });
    } else {
      setError(res.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#07101D] flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-10 h-10 border-4 border-[#B89B5E] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-300">Checking authenticated session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07101D] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <SEOHead title="Administrator Login | Real Estate In Bahria Town / Orchard Lahore" />

      {/* Subtle backdrop */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#B89B5E_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link to="/" className="inline-flex items-center gap-3 group mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#173C32] border border-[#B89B5E]/30 flex items-center justify-center text-white font-black shadow-lg shadow-[#173C32]/40 group-hover:scale-105 transition-transform">
            <Building className="w-6 h-6 text-[#B89B5E]" />
          </div>
          <div className="text-left">
            <span className="text-lg font-black text-white tracking-tight leading-tight block">
              Real Estate
            </span>
            <span className="text-xs font-semibold text-[#B89B5E] block">
              Bahria Town / Orchard Lahore
            </span>
            <p className="text-[10px] uppercase tracking-widest text-slate-400">
              Agency Management Console
            </p>
          </div>
        </Link>

        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Administrator Sign In
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Secure Supabase authentication for authorized real estate operations
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#0B192C] py-8 px-6 sm:px-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {/* Secure Admin Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Authorized Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-900 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-[#B89B5E]/40 focus:border-[#B89B5E] transition"
                  placeholder="sa3840213@gmail.com"
                  autoComplete="email"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                Allowlisted: {ADMIN_AUTHORIZED_EMAIL}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Supabase Account Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-900 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-[#B89B5E]/40 focus:border-[#B89B5E] transition"
                  placeholder="Enter your Supabase password"
                  autoComplete="current-password"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-[#173C32] hover:bg-[#0F2D25] text-white border border-[#B89B5E]/40 font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-[#173C32]/30 disabled:opacity-50 cursor-pointer mt-2"
            >
              <ShieldCheck className="w-4 h-4 text-[#B89B5E]" />
              <span>{submitting ? 'Verifying with Supabase...' : 'Authenticate & Open Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Database provider status */}
          <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5 border-t border-slate-800">
            <Database className="w-3.5 h-3.5 text-[#B89B5E]" />
            <span>
              {isSupabaseConfigured
                ? 'Protected by Supabase Auth & Row Level Security'
                : 'Supabase Configuration Missing'}
            </span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-xs text-slate-400 hover:text-white transition underline underline-offset-4"
          >
            ← Back to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
};
