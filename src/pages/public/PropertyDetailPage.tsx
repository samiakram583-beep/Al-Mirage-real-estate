import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Car,
  Layers,
  Heart,
  Share2,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Building,
  Sparkles,
  ArrowLeft,
  Navigation,
  ExternalLink,
} from 'lucide-react';
import { PropertyGallery } from '../../components/property/PropertyGallery';
import { InquiryForm } from '../../components/property/InquiryForm';
import { WhatsAppButton } from '../../components/property/WhatsAppButton';
import { CallButton } from '../../components/property/CallButton';
import { MobilePropertyBottomBar } from '../../components/property/MobilePropertyBottomBar';
import { PropertyCard } from '../../components/property/PropertyCard';
import { SEOHead } from '../../components/common/SEOHead';
import { Modal } from '../../components/common/Modal';
import { Property } from '../../types';
import {
  getPropertyBySlugOrId,
  getProperties,
  recordPropertyView,
} from '../../services/store';
import { formatArea, formatDate, formatExactPKR, formatPricePKR } from '../../lib/formatters';
import { useFavorites } from '../../context/FavoritesContext';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';

export const PropertyDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { settings } = useSettings();
  const [property, setProperty] = useState<Property | null>(null);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);

  const { toggleFavorite, isFavorite } = useFavorites();
  const { showToast } = useToast();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getPropertyBySlugOrId(slug).then((data) => {
      setProperty(data);
      if (data) {
        recordPropertyView(data.id);
        // Load similar properties in same city/purpose
        getProperties({
          city: data.city,
          purpose: data.purpose,
          limit: 3,
        }).then((sim) => {
          setSimilarProperties(sim.properties.filter((p) => p.id !== data.id));
        });
      }
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent py-16 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[#173C32] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-[#66706A]">Loading Property Record...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-transparent py-20 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-[#E4E6E1] shadow-xs space-y-4">
          <Building className="w-12 h-12 text-[#66706A] mx-auto" />
          <h2 className="text-xl font-bold text-[#171A18]">Property Listing Not Found</h2>
          <p className="text-xs text-[#66706A]">
            The property listing you requested may have been archived, sold, or moved.
          </p>
          <Link
            to="/properties"
            className="inline-block px-6 py-2.5 bg-[#173C32] hover:bg-[#0F2D25] text-white font-bold text-xs rounded-xl transition"
          >
            Explore Available Properties
          </Link>
        </div>
      </div>
    );
  }

  const favorited = isFavorite(property.id);
  const agent = property.agent;
  const agentPhone = agent?.phone || settings.phone || '+92 324 4101140';
  const agentWhatsApp = agent?.whatsapp || settings.whatsapp || agentPhone;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out property ${property.property_code}: ${property.title}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link Copied', 'Property URL copied to clipboard.', 'info');
    }
  };

  // Structured Data Schema for Real Estate Listing
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SingleFamilyResidence',
    name: property.title,
    description: property.description,
    identifier: property.property_code,
    numberOfRooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address,
      addressLocality: property.city,
      addressRegion: property.province,
      addressCountry: 'PK',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: property.latitude,
      longitude: property.longitude,
    },
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'PKR',
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <div className="min-h-screen bg-transparent pb-24 lg:pb-16">
      <SEOHead
        title={`${property.title} | ${property.property_code}`}
        description={`${property.property_type} in ${property.area}, ${property.city}. Price: ${formatPricePKR(property.price)}. ${property.description.slice(0, 140)}...`}
        image={property.images?.[0]?.public_url}
        schema={schema}
      />

      {/* Breadcrumb Bar */}
      <div className="bg-transparent border-b border-[#E4E6E1] py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-[#66706A]">
          <div className="flex items-center gap-1.5 overflow-hidden truncate">
            <Link to="/" className="hover:text-[#173C32] transition shrink-0">
              Home
            </Link>
            <span>/</span>
            <Link to="/properties" className="hover:text-[#173C32] transition shrink-0">
              Properties
            </Link>
            <span>/</span>
            <Link
              to={`/properties?city=${property.city}`}
              className="hover:text-[#173C32] transition shrink-0"
            >
              {property.city}
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#171A18] truncate">
              {property.property_code}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => toggleFavorite(property.id, property.property_code)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E4E6E1] text-xs font-semibold text-[#171A18] hover:bg-black/5 transition"
            >
              <Heart
                className={`w-3.5 h-3.5 ${favorited ? 'fill-rose-500 text-rose-500' : ''}`}
              />
              <span className="hidden sm:inline">
                {favorited ? 'Saved' : 'Save Property'}
              </span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E4E6E1] text-xs font-semibold text-[#171A18] hover:bg-black/5 transition"
              title="Share Listing"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Title, Badges, & Price Header */}
        <div className="bg-white rounded-3xl border border-[#E4E6E1] p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-[#173C32] text-white"
                >
                  For {property.purpose}
                </span>

                <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-black/5 text-[#171A18]">
                  {property.property_type}
                </span>

                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[#173C32] text-white">
                  ID: {property.property_code}
                </span>

                {property.is_featured && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#B89B5E] text-white flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-3 h-3 fill-current" />
                    Featured Residence
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#171A18] tracking-tight leading-snug">
                {property.title}
              </h1>

              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#66706A] font-medium">
                <MapPin className="w-4 h-4 text-[#B89B5E] shrink-0" />
                <span>
                  {property.address} • {property.area}, {property.city},{' '}
                  {property.province}
                </span>
              </div>
            </div>

            {/* Price block */}
            <div className="lg:text-right shrink-0 p-4 sm:p-6 rounded-2xl bg-black/[0.02] border border-[#E4E6E1]">
              <p className="text-xs uppercase tracking-widest text-[#66706A] font-bold mb-1">
                Demanded Price
              </p>
              <p className="text-3xl sm:text-4xl font-black text-[#173C32] tracking-tight">
                {formatPricePKR(property.price, { isRent: property.purpose === 'Rent' })}
              </p>
              <p className="text-xs text-[#66706A] mt-1 font-mono font-semibold">
                Exact: {formatExactPKR(property.price)}
              </p>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <PropertyGallery
          images={property.images || []}
          title={property.title}
        />

        {/* Main Content Layout: Details + Sticky Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols): Specs, Description, Features, Location Map */}
          <div className="lg:col-span-8 space-y-8">
            {/* Quick Specs Banner */}
            <div className="bg-white rounded-2xl border border-[#E4E6E1] p-6 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#66706A] mb-4">
                Property Overview & Specs
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-3.5 rounded-xl bg-black/[0.02] border border-[#E4E6E1] flex flex-col items-center justify-center">
                  <Maximize2 className="w-5 h-5 text-[#173C32] mb-1" />
                  <span className="text-base font-black text-[#171A18]">
                    {formatArea(property.area_value, property.area_unit)}
                  </span>
                  <span className="text-[11px] text-[#66706A] font-medium">Covered Area</span>
                </div>

                <div className="p-3.5 rounded-xl bg-black/[0.02] border border-[#E4E6E1] flex flex-col items-center justify-center">
                  <Bed className="w-5 h-5 text-[#173C32] mb-1" />
                  <span className="text-base font-black text-[#171A18]">
                    {property.bedrooms > 0 ? property.bedrooms : 'N/A'}
                  </span>
                  <span className="text-[11px] text-[#66706A] font-medium">Bedrooms</span>
                </div>

                <div className="p-3.5 rounded-xl bg-black/[0.02] border border-[#E4E6E1] flex flex-col items-center justify-center">
                  <Bath className="w-5 h-5 text-[#173C32] mb-1" />
                  <span className="text-base font-black text-[#171A18]">
                    {property.bathrooms > 0 ? property.bathrooms : 'N/A'}
                  </span>
                  <span className="text-[11px] text-[#66706A] font-medium">Bathrooms</span>
                </div>

                <div className="p-3.5 rounded-xl bg-black/[0.02] border border-[#E4E6E1] flex flex-col items-center justify-center">
                  <Car className="w-5 h-5 text-[#173C32] mb-1" />
                  <span className="text-base font-black text-[#171A18]">
                    {property.parking_spaces > 0 ? property.parking_spaces : 'N/A'}
                  </span>
                  <span className="text-[11px] text-[#66706A] font-medium">Car Parking</span>
                </div>
              </div>

              {/* Extra details row */}
              <div className="mt-4 pt-4 border-t border-[#E4E6E1] grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[#66706A]">Floors:</span>{' '}
                  <span className="font-bold text-[#171A18]">{property.floors || 1} Storey</span>
                </div>
                <div>
                  <span className="text-[#66706A]">Furnishing:</span>{' '}
                  <span className="font-bold text-[#171A18]">
                    {property.is_furnished ? 'Fully Furnished' : 'Unfurnished'}
                  </span>
                </div>
                <div>
                  <span className="text-[#66706A]">Listed Date:</span>{' '}
                  <span className="font-bold text-[#171A18]">
                    {formatDate(property.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-[#E4E6E1] p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-lg font-bold text-[#171A18] pb-2 border-b border-[#E4E6E1]">
                Property Description
              </h2>
              <p className="text-sm text-[#171A18] leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Features & Luxury Amenities List */}
            {property.features && property.features.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E4E6E1] p-6 sm:p-8 space-y-4 shadow-xs">
                <h2 className="text-lg font-bold text-[#171A18] pb-2 border-b border-[#E4E6E1]">
                  Features & Luxury Amenities
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {property.features.map((feat) => (
                    <div
                      key={feat}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-black/[0.02] border border-[#E4E6E1] text-xs font-semibold text-[#171A18]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#287A58] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location Map Banner */}
            <div className="bg-white rounded-2xl border border-[#E4E6E1] p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#E4E6E1]">
                <h2 className="text-lg font-bold text-[#171A18]">Location & Neighborhood</h2>
                <a
                  href={`https://maps.google.com/?q=${property.latitude || 31.4682},${property.longitude || 74.4539}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#173C32] hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="relative h-64 rounded-2xl overflow-hidden bg-black/[0.03] border border-[#E4E6E1] flex items-center justify-center">
                {/* Visual Location Card */}
                <div className="absolute inset-0 bg-[radial-gradient(#E4E6E1_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="relative z-10 text-center p-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-[#E4E6E1] max-w-sm">
                  <div className="w-10 h-10 rounded-full bg-[#173C32] text-white flex items-center justify-center mx-auto mb-2 font-bold shadow-xs">
                    <Navigation className="w-5 h-5 fill-current text-[#B89B5E]" />
                  </div>
                  <p className="text-xs font-bold text-[#171A18]">{property.address}</p>
                  <p className="text-[11px] text-[#66706A] mt-0.5">
                    {property.area}, {property.city}, {property.province}
                  </p>
                  <a
                    href={`https://maps.google.com/?q=${property.latitude || 31.4682},${property.longitude || 74.4539}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-3 px-4 py-1.5 rounded-lg bg-[#173C32] hover:bg-[#0F2D25] text-white text-[11px] font-bold transition"
                  >
                    <span>Get Directions</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Sticky Agent Card & Inquiry Form */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            {/* Agent Info Card */}
            {agent && (
              <div className="bg-white rounded-2xl border border-[#E4E6E1] p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b border-[#E4E6E1]">
                  <img
                    src={agent.avatar_url}
                    alt={agent.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-[#173C32] shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#173C32] bg-[#173C32]/10 px-2 py-0.5 rounded">
                      Listing Agent
                    </span>
                    <h3 className="text-base font-bold text-[#171A18] truncate mt-1">
                      {agent.name}
                    </h3>
                    <p className="text-xs text-[#66706A] truncate">{agent.title}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <WhatsAppButton
                    phone={agentWhatsApp}
                    property={property}
                    variant="primary"
                    className="w-full py-3"
                    label="WhatsApp Property Inquiry"
                  />

                  <CallButton
                    phone={agentPhone}
                    variant="outline"
                    className="w-full py-2.5"
                    label={`Call ${agentPhone}`}
                  />
                </div>

                <div className="pt-2 text-center">
                  <Link
                    to={`/agents/${agent.id}`}
                    className="text-xs text-[#66706A] hover:text-[#173C32] font-semibold underline underline-offset-2"
                  >
                    View Agent Profile & Portfolio
                  </Link>
                </div>
              </div>
            )}

            {/* Desktop Lead Inquiry Form */}
            <InquiryForm
              propertyId={property.id}
              propertyCode={property.property_code}
              propertyTitle={property.title}
              agentId={agent?.id}
              agentName={agent?.name}
            />
          </div>
        </div>

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <div className="pt-8 border-t border-[#E4E6E1] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#B89B5E]">
                  Recommendations
                </p>
                <h3 className="text-xl sm:text-2xl font-black text-[#171A18] tracking-tight">
                  Similar Properties in {property.city}
                </h3>
              </div>
              <Link
                to={`/properties?city=${property.city}`}
                className="text-xs font-bold text-[#173C32] hover:text-[#0F2D25] hover:underline"
              >
                View More
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarProperties.map((sim) => (
                <PropertyCard key={sim.id} property={sim} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Action Bar */}
      <MobilePropertyBottomBar
        property={property}
        onOpenInquiryModal={() => setInquiryModalOpen(true)}
      />

      {/* Mobile Inquiry Form Modal */}
      <Modal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        title={`Inquire About ${property.property_code}`}
      >
        <InquiryForm
          propertyId={property.id}
          propertyCode={property.property_code}
          propertyTitle={property.title}
          agentId={agent?.id}
          agentName={agent?.name}
        />
      </Modal>
    </div>
  );
};
