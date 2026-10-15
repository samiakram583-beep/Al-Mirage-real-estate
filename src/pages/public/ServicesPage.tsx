import React, { useState, useEffect } from 'react';
import {
  Home,
  Globe,
  ShieldCheck,
  Key,
  Building2,
  Compass,
  CheckCircle2,
  ArrowRight,
  Briefcase,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEOHead } from '../../components/common/SEOHead';
import { RealEstateService } from '../../types';
import { getServices } from '../../services/store';

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<RealEstateService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServices()
      .then((data) => setServices(data.filter((s) => s.is_published !== false)))
      .finally(() => setLoading(false));
  }, []);

  const iconMap: Record<string, React.ReactNode> = {
    Home: <Home className="w-5 h-5 text-slate-900" />,
    Building2: <Building2 className="w-5 h-5 text-[#173C32]" />,
    Key: <Key className="w-5 h-5 text-[#173C32]" />,
    Compass: <Compass className="w-5 h-5 text-[#173C32]" />,
    ShieldCheck: <ShieldCheck className="w-5 h-5 text-[#173C32]" />,
    Globe: <Globe className="w-5 h-5 text-[#173C32]" />,
  };

  return (
    <div className="min-h-screen bg-transparent py-12 sm:py-16">
      <SEOHead
        title="Real Estate Services | Bahria Town & Orchard Lahore"
        description="Explore confirmed property services for buying, selling, and leasing across Bahria Town Lahore, Bahria Orchard, and surrounding areas."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-[#B89B5E]">
            Agency Capabilities
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#171A18] tracking-tight mt-1">
            Real Estate Services
          </h1>
          <p className="text-xs sm:text-sm text-[#66706A] mt-2 leading-relaxed">
            Property advisory services covering residential houses, commercial spaces, and plots around Bahria Town Lahore, Bahria Orchard, and Raiwind Road.
          </p>
        </div>

        {loading ? (
          <p className="py-12 text-center text-[#66706A]">Loading services...</p>
        ) : services.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-[#E4E6E1] p-12 text-center max-w-lg mx-auto">
            <Briefcase className="w-10 h-10 text-[#66706A] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#171A18] mb-1">
              No services listed at the moment.
            </h3>
            <p className="text-xs text-[#66706A] mb-5 leading-relaxed">
              Confirmed agency services will be published here. Please contact our office directly for customized buying, selling, or rental assistance.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#173C32] hover:bg-[#0F2D25] text-white text-xs font-bold rounded-xl transition shadow-xs"
            >
              Contact Our Office
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((serv) => (
              <div
                key={serv.id}
                className="bg-white rounded-3xl border border-[#E4E6E1] p-8 shadow-xs flex flex-col justify-between space-y-6 hover:border-[#173C32]/40 transition"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#173C32]/8 flex items-center justify-center">
                    {iconMap[serv.icon_name] || <Home className="w-5 h-5 text-[#173C32]" />}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#171A18] leading-snug">
                      {serv.title}
                    </h3>
                    {serv.short_description && (
                      <p className="text-xs text-[#66706A] mt-1 font-medium">
                        {serv.short_description}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-[#66706A] leading-relaxed">
                    {serv.full_description}
                  </p>

                  {serv.benefits && serv.benefits.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-[#E4E6E1]">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#66706A]">
                        Deliverables:
                      </p>
                      {serv.benefits.map((b) => (
                        <div key={b} className="flex items-start gap-2 text-xs text-[#171A18]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#287A58] shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Link
                    to="/contact"
                    className="w-full py-2.5 px-4 rounded-xl bg-transparent hover:bg-[#173C32] hover:text-white text-[#173C32] text-xs font-bold transition flex items-center justify-center gap-1.5 border border-[#173C32]"
                  >
                    <span>Inquire About Service</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
