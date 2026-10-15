import React from 'react';
import { Link } from 'react-router-dom';
import { Building, MapPin, Phone, Mail, MessageCircle, ExternalLink, Clock } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const Footer: React.FC = () => {
  const { settings } = useSettings();

  return (
    <footer className="bg-[#173C32] text-white/80 pt-16 pb-12 border-t border-[#0F2D25]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Col 1: Business Identity */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-white border border-white/15 flex items-center justify-center font-bold">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-base font-black text-white leading-tight block">
                  {settings.business_name}
                </span>
                <p className="text-[11px] text-[#B89B5E] font-medium">
                  Bahria Town & Orchard Lahore
                </p>
              </div>
            </Link>

            <p className="text-xs text-white/70 leading-relaxed">
              {settings.business_description ||
                settings.about_text?.slice(0, 180) ||
                'Specialized real estate services around Bahria Town, Bahria Orchard, and relevant Lahore areas.'}
            </p>

            <div className="pt-2 text-xs text-white/70 space-y-1">
              <div className="flex items-center gap-2 font-semibold text-white/90">
                <Clock className="w-3.5 h-3.5 text-[#B89B5E] shrink-0" />
                <span>Office Opening Hours</span>
              </div>
              <p className="pl-5 text-white/80">Mon – Thu, Sat – Sun: 9:00 AM – 10:00 PM</p>
              <p className="pl-5 text-white/80">Friday: 11:00 AM – 10:00 PM</p>
            </div>
          </div>

          {/* Col 2: Navigation Portals */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-2">
              Explore Properties
            </h4>
            <div className="w-6 h-0.5 bg-[#B89B5E] mb-4" />
            <ul className="space-y-2.5 text-xs text-white/70">
              <li>
                <Link to="/properties" className="hover:text-white transition">
                  All Properties
                </Link>
              </li>
              <li>
                <Link to="/buy" className="hover:text-white transition">
                  Properties for Sale
                </Link>
              </li>
              <li>
                <Link to="/rent" className="hover:text-white transition">
                  Properties for Rent
                </Link>
              </li>
              <li>
                <Link to="/properties?type=Plot" className="hover:text-white transition">
                  Residential & Commercial Plots
                </Link>
              </li>
              <li>
                <Link to="/areas" className="hover:text-white transition">
                  Bahria Town & Orchard Sectors
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Key Localities */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-2">
              Lahore Locations
            </h4>
            <div className="w-6 h-0.5 bg-[#B89B5E] mb-4" />
            <ul className="space-y-2.5 text-xs text-white/70">
              <li>
                <Link to="/areas/bahria-town-lahore" className="hover:text-white transition">
                  Bahria Town Lahore (Sectors A-F)
                </Link>
              </li>
              <li>
                <Link to="/areas/bahria-orchard-lahore" className="hover:text-white transition">
                  Bahria Orchard (Phases 1-4)
                </Link>
              </li>
              <li>
                <Link to="/areas/raiwind-road-lahore" className="hover:text-white transition">
                  Raiwind Road Corridor
                </Link>
              </li>
              <li>
                <Link to="/areas/dha-lahore" className="hover:text-white transition">
                  DHA Lahore
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Office */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-2">
              Office & Contact
            </h4>
            <div className="w-6 h-0.5 bg-[#B89B5E] mb-4" />
            <ul className="space-y-3 text-xs text-white/70">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#B89B5E] shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="text-white/90">{settings.address}</span>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className="inline-block px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-[#B89B5E]">
                      Plus Code: {settings.plus_code || '8689+FP Lahore, Pakistan'}
                    </span>
                    <a
                      href={settings.google_maps_url || 'https://www.google.com/maps/search/?api=1&query=8689%2BFP+Lahore,+Pakistan'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#B89B5E] hover:text-white underline font-semibold flex items-center gap-1"
                    >
                      Get Directions ↗
                    </a>
                  </div>
                </div>
              </li>
              {settings.phone && (
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#B89B5E] shrink-0" />
                  <a
                    href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                    className="hover:underline text-white font-bold tracking-wide"
                  >
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings.whatsapp && (
                <li className="flex items-center gap-2.5">
                  <MessageCircle className="w-4 h-4 text-[#287A58] shrink-0" />
                  <a
                    href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#E4E6E1] hover:text-white font-semibold hover:underline"
                  >
                    WhatsApp Message
                  </a>
                </li>
              )}
              {settings.email && (
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#B89B5E] shrink-0" />
                  <a href={`mailto:${settings.email}`} className="hover:underline text-white">
                    {settings.email}
                  </a>
                </li>
              )}
            </ul>

            <div className="mt-5 pt-4 border-t border-white/10">
              <Link
                to="/admin/login"
                className="text-xs text-[#B89B5E] hover:text-white font-bold flex items-center gap-1 transition"
              >
                <span>Agent & Admin Portal</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} {settings.business_name}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-white transition">
              About
            </Link>
            <Link to="/services" className="hover:text-white transition">
              Services
            </Link>
            <Link to="/contact" className="hover:text-white transition">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
