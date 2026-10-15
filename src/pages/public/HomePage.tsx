import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Home,
  Compass,
  TrendingUp,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Users,
  MessageSquare,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { SearchBar } from '../../components/property/SearchBar';
import { PropertyCard } from '../../components/property/PropertyCard';
import { AgentCard } from '../../components/agent/AgentCard';
import { SEOHead } from '../../components/common/SEOHead';
import { Property, LocationArea, Agent, Testimonial, RealEstateService } from '../../types';
import {
  getProperties,
  getPopularAreas,
  getAgents,
  getTestimonials,
  getServices,
} from '../../services/store';
import { useSettings } from '../../context/SettingsContext';

const CATEGORIES = [
  { name: 'Houses', type: 'House', icon: Home },
  { name: 'Plots & Files', type: 'Plot', icon: Compass },
  { name: 'Apartments & Flats', type: 'Apartment', icon: Building2 },
  { name: 'Commercial & Shops', type: 'Commercial', icon: TrendingUp },
  { name: 'Offices', type: 'Office', icon: Award },
  { name: 'Farmhouses', type: 'Farmhouse', icon: Sparkles },
];

export const HomePage: React.FC = () => {
  const { settings } = useSettings();
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [popularAreas, setPopularAreas] = useState<LocationArea[]>([]);
  const [consultants, setConsultants] = useState<Agent[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [services, setServices] = useState<RealEstateService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProperties({ featured: true, limit: 6 }),
      getPopularAreas(),
      getAgents(),
      getTestimonials(),
      getServices(),
    ]).then(([propsRes, areasRes, agentsRes, testRes, servRes]) => {
      setFeaturedProperties(propsRes.properties);
      setPopularAreas(areasRes);
      setConsultants(agentsRes.filter((a) => a.is_active));
      setTestimonials(testRes.filter((t) => t.is_published !== false));
      setServices(servRes.filter((s) => s.is_published !== false));
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-transparent">
      <SEOHead
        title="Real Estate in Bahria Town / Orchard Lahore"
        description="Find verified houses, plots, and commercial properties in Bahria Town Lahore, Bahria Orchard, and surrounding areas."
      />

      {/* HERO SECTION - Crisp, bright, elegant, sitting naturally over transparent background */}
      <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-20 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 border border-[#E4E6E1] text-xs font-semibold text-[#171A18] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#287A58] inline-block" />
            <span>Bahria Town • Bahria Orchard • Lahore Real Estate</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#171A18] tracking-tight leading-[1.15] font-sans">
            Find Your Perfect Property in <br className="hidden sm:inline" />
            <span className="text-[#171A18]">Bahria Town & Orchard Lahore</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#66706A] leading-relaxed font-normal">
            Browse verified houses, residential plots, commercial properties, and rental listings across Bahria Town Lahore, Bahria Orchard, and neighboring sectors.
          </p>
        </div>

        {/* PROMINENT SEARCH COMPONENT */}
        <div className="mt-10 max-w-5xl mx-auto">
          <SearchBar inline />
        </div>
      </section>

      {/* FEATURED PROPERTIES SECTION (Dynamic, with clean empty state) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16 border-t border-[#E4E6E1]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold text-[#66706A] uppercase tracking-widest">
              Selected Listings
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-[#171A18] tracking-tight">
              Featured Properties
            </h2>
          </div>
          <Link
            to="/properties"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#173C32] hover:text-[#0F2D25] transition"
          >
            <span>View All Properties</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuredProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-[#E4E6E1] p-12 text-center max-w-lg mx-auto">
            <Home className="w-10 h-10 text-[#66706A] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#171A18] mb-1">
              No properties available at the moment.
            </h3>
            <p className="text-xs text-[#66706A] mb-5">
              Verified property listings will appear here once added by our administration.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#173C32] hover:bg-[#0F2D25] text-white text-xs font-bold rounded-xl transition"
            >
              Contact Us for Inquiries
            </Link>
          </div>
        )}
      </section>

      {/* PROPERTY CATEGORIES - Seamless transparent container with subtle card surfaces */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16 border-t border-[#E4E6E1]">
        <div>
          <div className="mb-8">
            <p className="text-xs font-bold text-[#66706A] uppercase tracking-widest">
              Browse Categories
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-[#171A18] tracking-tight">
              Property Types in Lahore
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  to={`/properties?type=${cat.type}`}
                  className="p-5 bg-white rounded-2xl border border-[#E4E6E1] hover:border-[#173C32] hover:shadow-xs transition-all text-center flex flex-col items-center justify-center space-y-2.5 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-black/5 group-hover:bg-[#173C32] group-hover:text-white text-[#173C32] flex items-center justify-center transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#171A18]">
                    {cat.name}
                  </h3>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* POPULAR AREAS (Bahria Town, Bahria Orchard, Raiwind Road, DHA) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16 border-t border-[#E4E6E1]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold text-[#66706A] uppercase tracking-widest">
              Locations & Sectors
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-[#171A18] tracking-tight">
              Popular Housing Areas
            </h2>
          </div>
          <Link
            to="/areas"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#173C32] hover:text-[#0F2D25] transition"
          >
            <span>Explore All Areas</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularAreas.map((area) => (
            <Link
              key={area.id}
              to={`/areas/${area.slug}`}
              className="bg-white rounded-2xl border border-[#E4E6E1] overflow-hidden hover:shadow-md transition-all group flex flex-col"
            >
              <div className="h-44 relative bg-black/5 overflow-hidden">
                <img
                  src={area.image_url}
                  alt={area.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h3 className="text-base font-bold text-[#171A18] group-hover:text-[#173C32] transition">
                    {area.name}
                  </h3>
                  <p className="text-xs text-[#66706A] line-clamp-2 mt-1">
                    {area.description}
                  </p>
                </div>
                <span className="text-xs font-bold text-[#173C32] flex items-center gap-1 pt-2">
                  View Sector Listings <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* DYNAMIC SERVICES SECTION */}
      {services.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16 border-t border-[#E4E6E1]">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-xs font-bold text-[#66706A] uppercase tracking-widest">
                  Our Services
                </p>
                <h2 className="text-2xl sm:text-3xl font-black text-[#171A18] tracking-tight">
                  Real Estate Solutions
                </h2>
              </div>
              <Link
                to="/services"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#173C32] hover:text-[#0F2D25] transition"
              >
                <span>All Services</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {services.map((serv) => (
                <div
                  key={serv.id}
                  className="bg-white p-6 rounded-2xl border border-[#E4E6E1] space-y-3 shadow-xs"
                >
                  <h3 className="text-base font-bold text-[#171A18]">{serv.title}</h3>
                  <p className="text-xs text-[#66706A] leading-relaxed">
                    {serv.short_description || serv.full_description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PROPERTY CONSULTANTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16 border-t border-[#E4E6E1]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold text-[#66706A] uppercase tracking-widest">
              Team & Advisors
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-[#171A18] tracking-tight">
              Property Consultants
            </h2>
          </div>
          {consultants.length > 0 && (
            <Link
              to="/agents"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#173C32] hover:text-[#0F2D25] transition"
            >
              <span>View All Consultants</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {consultants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {consultants.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-[#E4E6E1] p-8 text-center max-w-md mx-auto">
            <Users className="w-8 h-8 text-[#66706A] mx-auto mb-2" />
            <h3 className="text-sm font-bold text-[#171A18]">
              No property consultants have been added yet.
            </h3>
            <p className="text-xs text-[#66706A] mt-1">
              Our registered team members will be listed here once configured.
            </p>
          </div>
        )}
      </section>

      {/* TESTIMONIALS SECTION */}
      {testimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16 border-t border-[#E4E6E1]">
          <div>
            <div className="text-center max-w-xl mx-auto mb-10">
              <p className="text-xs font-bold text-[#66706A] uppercase tracking-widest">
                Client Feedback
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-[#171A18] tracking-tight">
                Client Testimonials
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((test) => (
                <div
                  key={test.id}
                  className="bg-white p-6 rounded-2xl border border-[#E4E6E1] space-y-3 shadow-xs"
                >
                  <p className="text-xs text-[#66706A] leading-relaxed italic">
                    "{test.comment}"
                  </p>
                  <div className="pt-2 border-t border-[#E4E6E1] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#171A18]">{test.name}</p>
                      <p className="text-[10px] text-[#66706A]">{test.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CONTACT CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16 border-t border-[#E4E6E1]">
        <div className="bg-white rounded-3xl border border-[#E4E6E1] p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold text-[#B89B5E] uppercase tracking-widest">
              Direct Agency Inquiries
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#171A18] tracking-tight">
              Looking to Buy, Sell, or Rent in Bahria Town or Orchard?
            </h2>
            <p className="text-xs sm:text-sm text-[#66706A] leading-relaxed">
              Connect with our Bahria Orchard office for verified options, current market rates, and secure property transfers across Bahria Town Lahore, Bahria Orchard, and Raiwind Road.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-[#66706A]">
              <a
                href={settings.google_maps_url || 'https://maps.google.com/?q=8689%2BFP+Lahore+Pakistan'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[#171A18] font-semibold hover:text-[#173C32] transition"
              >
                <MapPin className="w-3.5 h-3.5 text-[#B89B5E] shrink-0" />
                <span>Tower 3, Office #17, Raiwind Road, Bahria Orchard Lahore</span>
              </a>
              <span className="hidden sm:inline text-[#E4E6E1]">•</span>
              <span className="font-mono bg-[#173C32]/8 text-[#173C32] px-2 py-0.5 rounded text-[11px] font-semibold">
                Plus Code: 8689+FP Lahore
              </span>
              <span className="hidden sm:inline text-[#E4E6E1]">•</span>
              <span className="text-[11px] text-[#66706A]">
                Open Daily: Mon–Thu, Sat–Sun 9am–10pm | Fri 11am–10pm
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            {settings.phone && (
              <a
                href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                className="px-6 py-3 rounded-xl bg-[#173C32] hover:bg-[#0F2D25] text-white font-bold text-xs flex items-center gap-2 transition shadow-xs"
              >
                <Phone className="w-3.5 h-3.5 text-[#B89B5E]" />
                <span>Call {settings.phone}</span>
              </a>
            )}
            <Link
              to="/contact"
              className="px-6 py-3 rounded-xl border border-[#173C32] text-[#173C32] hover:bg-[#173C32] hover:text-white font-bold text-xs uppercase tracking-wider transition"
            >
              Contact Office
            </Link>
            {settings.whatsapp && (
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl border border-[#E4E6E1] hover:bg-black/5 text-[#287A58] font-bold text-xs flex items-center gap-1.5 transition"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
