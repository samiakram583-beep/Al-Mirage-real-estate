import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Save, Building, Phone, Mail, Globe, MapPin, Check, Database, Copy, RefreshCw, ShieldCheck } from 'lucide-react';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { SEOHead } from '../../components/common/SEOHead';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { checkSupabaseHealth } from '../../services/store';
import { ADMIN_AUTHORIZED_EMAIL } from '../../lib/supabase';

export const AdminSettingsPage: React.FC = () => {
  const { openMobileSidebar } = useOutletContext<{ openMobileSidebar: () => void }>();
  const { settings, updateSettings } = useSettings();
  const { showToast } = useToast();

  const [formData, setFormData] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateSettings(formData);
    setSaving(false);
    showToast('Settings Saved', 'Site configuration and SEO defaults updated.', 'success');
  };

  return (
    <div className="flex-1 pb-16">
      <SEOHead title="Site & Agency Settings | Agency Admin Portal" />

      <AdminHeader
        title="Portal & Agency Configuration"
        subtitle="Manage agency contact information, helpline numbers, WhatsApp routing, and global SEO metadata"
        onOpenMobileMenu={openMobileSidebar}
      />

      <div className="p-4 sm:p-8 max-w-5xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Branding */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Building className="w-4 h-4 text-amber-500" />
              <span>Agency Brand & Identity</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Business / Agency Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Marketing Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Business Hours
                </label>
                <input
                  type="text"
                  value={formData.business_hours || ''}
                  onChange={(e) => setFormData({ ...formData, business_hours: e.target.value })}
                  placeholder="e.g. Monday – Saturday: 9:30 AM – 7:30 PM PKT"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Short Business Description
                </label>
                <input
                  type="text"
                  value={formData.business_description || ''}
                  onChange={(e) => setFormData({ ...formData, business_description: e.target.value })}
                  placeholder="e.g. Property services across Bahria Town & Orchard Lahore"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                About Agency Description
              </label>
              <textarea
                rows={4}
                value={formData.about_text}
                onChange={(e) => setFormData({ ...formData, about_text: e.target.value })}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl leading-relaxed"
              />
            </div>
          </div>

          {/* Contact & WhatsApp Desk */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-500" />
              <span>Contact Channels & Helplines</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Official Phone
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  WhatsApp Direct Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Official Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#171A18] uppercase tracking-wider mb-1">
                  Primary Office Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white/75 text-[#171A18] border border-[#D9DDD8] rounded-xl focus:border-[#B89B5E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171A18] uppercase tracking-wider mb-1">
                  Default City
                </label>
                <input
                  type="text"
                  value={formData.default_city}
                  onChange={(e) => setFormData({ ...formData, default_city: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white/75 text-[#171A18] border border-[#D9DDD8] rounded-xl focus:border-[#B89B5E] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#171A18] uppercase tracking-wider mb-1">
                  Google Maps Plus Code
                </label>
                <input
                  type="text"
                  value={formData.plus_code || ''}
                  onChange={(e) => setFormData({ ...formData, plus_code: e.target.value })}
                  placeholder="e.g. 8689+FP Lahore, Pakistan"
                  className="w-full px-3 py-2 text-xs bg-white/75 text-[#171A18] border border-[#D9DDD8] rounded-xl focus:border-[#B89B5E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171A18] uppercase tracking-wider mb-1">
                  Google Maps URL / Directions Link
                </label>
                <input
                  type="url"
                  value={formData.google_maps_url || ''}
                  onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
                  placeholder="https://www.google.com/maps/search/?api=1&query=..."
                  className="w-full px-3 py-2 text-xs bg-white/75 text-[#171A18] border border-[#D9DDD8] rounded-xl focus:border-[#B89B5E] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Global SEO Defaults */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-500" />
              <span>SEO Defaults & Social Media</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Default Title
              </label>
              <input
                type="text"
                value={formData.seo_defaults.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seo_defaults: { ...formData.seo_defaults, title: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Default Meta Description
              </label>
              <textarea
                rows={2}
                value={formData.seo_defaults.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seo_defaults: { ...formData.seo_defaults, description: e.target.value },
                  })
                }
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Facebook URL
                </label>
                <input
                  type="url"
                  value={formData.facebook_url}
                  onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Instagram URL
                </label>
                <input
                  type="url"
                  value={formData.instagram_url}
                  onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Supabase Database Connection & Live Synchronization */}
          <div className="bg-white rounded-3xl border border-[#E4E6E1] p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4E6E1] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#171A18] flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#173C32]" />
                  <span>Supabase Database & Real Estate Records</span>
                </h3>
                <p className="text-xs text-[#66706A] mt-0.5">
                  Live connection and schema verification for properties, inquiries, and admin records.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={checkingHealth}
                  onClick={async () => {
                    setCheckingHealth(true);
                    const res = await checkSupabaseHealth();
                    setHealthStatus(res);
                    setCheckingHealth(false);
                    if (res.connected) {
                      showToast('Database Verified', 'All database tables responded successfully.', 'success');
                    } else {
                      showToast('Schema Check Required', 'Run supabase/schema.sql in Supabase SQL editor to initialize tables.', 'info');
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#173C32]/8 hover:bg-[#173C32]/15 text-[#173C32] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${checkingHealth ? 'animate-spin' : ''}`} />
                  <span>{checkingHealth ? 'Verifying...' : 'Test Connection'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    fetch('/supabase/schema.sql')
                      .then((r) => r.text())
                      .catch(() => '')
                      .then((sql) => {
                        if (sql) {
                          navigator.clipboard.writeText(sql);
                          showToast('SQL Copied', 'Copied supabase/schema.sql to clipboard. Paste into Supabase SQL Editor.', 'success');
                        } else {
                          showToast('SQL Script', 'Migration schema is stored at /supabase/schema.sql', 'info');
                        }
                      });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#E4E6E1] hover:bg-black/5 text-[#171A18] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-[#B89B5E]" />
                  <span>Copy SQL Script</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-black/[0.02] border border-[#E4E6E1] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#66706A]">Supabase Project Endpoint</span>
                <p className="font-mono text-[#171A18] truncate">https://lsbfglbtcywwpsqetfzx.supabase.co</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/[0.02] border border-[#E4E6E1] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#66706A]">Authorized Admin Account</span>
                <p className="font-mono text-[#171A18] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#287A58]" />
                  <span>{ADMIN_AUTHORIZED_EMAIL}</span>
                </p>
              </div>
            </div>

            {healthStatus && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <p className="font-bold text-slate-800">PostgreSQL Schema Tables Status:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  {Object.entries(healthStatus.tablesFound).map(([table, found]) => (
                    <div key={table} className="flex items-center gap-1.5 font-medium">
                      <span className={`w-2 h-2 rounded-full ${found ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span className="capitalize">{table}:</span>
                      <span className={found ? 'text-emerald-700 font-bold' : 'text-amber-700'}>
                        {found ? 'Ready' : 'Pending SQL'}
                      </span>
                    </div>
                  ))}
                </div>
                {!healthStatus.connected && (
                  <p className="text-[11px] text-amber-800 pt-1 leading-relaxed">
                    Notice: If any tables are marked Pending SQL, copy <code>supabase/schema.sql</code> and execute it in your Supabase project's SQL Editor to activate PostgreSQL tables and RLS security.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-[#173C32] hover:bg-[#0F2D25] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
