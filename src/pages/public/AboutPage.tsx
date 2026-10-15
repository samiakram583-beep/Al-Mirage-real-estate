import React from 'react';
import { Link } from 'react-router-dom';
import { Building, ShieldCheck, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { SEOHead } from '../../components/common/SEOHead';
import { useSettings } from '../../context/SettingsContext';

export const AboutPage: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-transparent py-12 sm:py-16">
      <SEOHead
        title="About Us | Real Estate In Bahria Town / Orchard Lahore"
        description="Learn about our real estate agency focusing on property services across Bahria Town Lahore, Bahria Orchard, and surrounding Lahore areas."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-14">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#B89B5E]">
            About The Agency
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#171A18] tracking-tight leading-tight">
            {settings.business_name}
          </h1>
          <p className="text-sm sm:text-base text-[#66706A] leading-relaxed">
            {settings.about_text}
          </p>
        </div>

        {/* Focus Areas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-[#E4E6E1] space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#173C32]/8 flex items-center justify-center font-bold text-[#173C32]">
              <Building className="w-5 h-5 text-[#173C32]" />
            </div>
            <h3 className="text-base font-bold text-[#171A18]">Bahria Town Lahore Focus</h3>
            <p className="text-xs text-[#66706A] leading-relaxed">
              Assisting clients in Sectors A through F, Safari Villas, and commercial zones with verified property files, transparent price discussions, and seamless transfer support.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-[#E4E6E1] space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#173C32]/8 flex items-center justify-center font-bold text-[#173C32]">
              <MapPin className="w-5 h-5 text-[#173C32]" />
            </div>
            <h3 className="text-base font-bold text-[#171A18]">Bahria Orchard Specialization</h3>
            <p className="text-xs text-[#66706A] leading-relaxed">
              Covering residential houses, commercial avenues, and plot options in Bahria Orchard Phase 1, Phase 2, Phase 3, and Phase 4 on Raiwind Road.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-[#E4E6E1] space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#173C32]/8 flex items-center justify-center font-bold text-[#173C32]">
              <ShieldCheck className="w-5 h-5 text-[#173C32]" />
            </div>
            <h3 className="text-base font-bold text-[#171A18]">Verified Transfer Procedures</h3>
            <p className="text-xs text-[#66706A] leading-relaxed">
              Guiding clients through NDC issuance, official society file verification, tax calculations, and secure title transfers without ambiguity.
            </p>
          </div>
        </div>

        {/* Business Office Banner */}
        <div className="bg-white rounded-3xl border border-[#E4E6E1] p-8 sm:p-10 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#171A18]">Office & Inquiries</h2>
              <p className="text-xs text-[#66706A] leading-relaxed max-w-2xl mt-1">
                Our office is situated on Raiwind Road serving Bahria Town and Bahria Orchard clients. Contact us directly or visit our office.
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 px-6 py-3 bg-[#173C32] hover:bg-[#0F2D25] text-white text-xs font-bold rounded-xl shadow-xs transition shrink-0"
            >
              <span>Contact Office</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#66706A]">
            <div>
              <strong className="text-[#171A18]">Address: </strong>
              <span>{settings.address}</span>
            </div>
            {settings.phone && (
              <div>
                <strong className="text-[#171A18]">Phone: </strong>
                <a
                  href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                  className="text-[#173C32] font-bold hover:underline"
                >
                  {settings.phone}
                </a>
              </div>
            )}
            {settings.plus_code && (
              <div>
                <strong className="text-[#171A18]">Plus Code: </strong>
                <span className="font-mono text-[#171A18]">{settings.plus_code}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
