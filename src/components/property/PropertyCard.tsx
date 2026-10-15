import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Bed,
  Bath,
  Maximize2,
  MapPin,
  Sparkles,
  ArrowUpRight,
  Eye,
  Building,
} from 'lucide-react';
import { Property } from '../../types';
import { formatArea, formatPricePKR } from '../../lib/formatters';
import { useFavorites } from '../../context/FavoritesContext';
import { WhatsAppButton } from './WhatsAppButton';

interface PropertyCardProps {
  property: Property;
  featuredBorder?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  featuredBorder = false,
}) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorited = isFavorite(property.id);
  const [imageFailed, setImageFailed] = useState(false);

  const rawImage =
    property.images?.find((img) => img.is_primary && !img.public_url.startsWith('blob:'))?.public_url ||
    property.images?.find((img) => img.public_url && !img.public_url.startsWith('blob:'))?.public_url ||
    (property.cover_image && !property.cover_image.startsWith('blob:') ? property.cover_image : null);

  const hasValidImage = Boolean(rawImage && !imageFailed);

  return (
    <div
      className={`group bg-white rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-lg hover:border-[#173C32]/40 flex flex-col ${
        featuredBorder || property.is_featured
          ? 'border-[#B89B5E] shadow-sm ring-1 ring-[#B89B5E]/30'
          : 'border-[#E4E6E1] shadow-xs'
      }`}
    >
      {/* Image Container with Tasteful Branded Fallback */}
      <div className="relative h-64 overflow-hidden bg-[#F4F5F2]">
        <Link to={`/properties/${property.slug}`} className="block w-full h-full">
          {hasValidImage ? (
            <img
              src={rawImage!}
              alt={property.title}
              loading="lazy"
              onError={() => setImageFailed(true)}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#173C32]/5 via-[#F4F5F2] to-[#B89B5E]/10 flex flex-col items-center justify-center p-6 text-center select-none relative group-hover:bg-[#ECEEEA] transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-[#173C32] border border-[#B89B5E]/30 flex items-center justify-center text-white mb-2.5 shadow-md group-hover:scale-105 transition-transform">
                <Building className="w-7 h-7 text-[#B89B5E]" />
              </div>
              <p className="text-xs font-bold text-[#171A18] line-clamp-1 max-w-[210px]">
                {property.title}
              </p>
              <span className="text-[11px] text-[#66706A] mt-0.5">
                {property.area} • {property.city}
              </span>
              <span className="mt-2 text-[10px] font-bold text-[#173C32] uppercase tracking-wider bg-white/90 px-2.5 py-0.5 rounded-full border border-[#E4E6E1] shadow-xs">
                Verified Listing
              </span>
            </div>
          )}
        </Link>
        {hasValidImage && (
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-black/20 to-black/10 pointer-events-none" />
        )}

        {/* Badges Overlay */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 items-center z-10">
          <span
            className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-xs bg-[#173C32] text-white"
          >
            For {property.purpose}
          </span>
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-black/60 backdrop-blur-md text-white border border-white/10">
            {property.property_type}
          </span>
          {property.is_featured && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#B89B5E] text-white flex items-center gap-1 shadow-xs">
              <Sparkles className="w-3 h-3 fill-current" />
              Featured
            </span>
          )}
        </div>

        {/* Property ID Code Badge */}
        <div className="absolute top-3.5 right-12 z-10">
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-black/60 backdrop-blur-md text-[#B89B5E] border border-[#B89B5E]/30">
            {property.property_code}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => toggleFavorite(property.id, property.property_code)}
          className="absolute top-3.5 right-3.5 p-2 rounded-xl bg-white/90 backdrop-blur-md hover:bg-white text-slate-700 hover:text-rose-500 transition shadow-sm z-10"
          aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              favorited ? 'fill-rose-500 text-rose-500 scale-110' : ''
            }`}
          />
        </button>

        {/* Price Tag in Bottom Left */}
        <div
          className={`absolute bottom-3 left-3.5 z-10 ${
            hasValidImage
              ? 'text-white'
              : 'bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#E4E6E1] shadow-xs'
          }`}
        >
          <p
            className={`text-[10px] font-bold uppercase tracking-wider ${
              hasValidImage ? 'text-[#B89B5E]' : 'text-[#66706A]'
            }`}
          >
            Asking Price
          </p>
          <p
            className={`text-lg sm:text-xl font-black tracking-tight ${
              hasValidImage ? 'text-white drop-shadow-sm font-sans' : 'text-[#173C32] font-sans'
            }`}
          >
            {formatPricePKR(property.price, { isRent: property.purpose === 'Rent' })}
          </p>
        </div>

        {/* Views count */}
        {property.views_count && property.views_count > 0 ? (
          <div className="absolute bottom-3 right-3 text-[11px] text-slate-300 flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded backdrop-blur-xs z-10">
            <Eye className="w-3 h-3" />
            <span>{property.views_count} views</span>
          </div>
        ) : null}
      </div>

      {/* Content Container */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#66706A] mb-2">
            <MapPin className="w-3.5 h-3.5 text-[#B89B5E] shrink-0" />
            <span className="truncate">
              {property.society ? `${property.society}, ` : ''}
              {property.area}, {property.city}
            </span>
          </div>

          {/* Title */}
          <Link to={`/properties/${property.slug}`} className="block group-hover:text-[#173C32] transition">
            <h3 className="text-base font-bold text-[#171A18] line-clamp-2 leading-snug mb-3">
              {property.title}
            </h3>
          </Link>
        </div>

        {/* Specs Grid */}
        <div className="pt-3 border-t border-[#E4E6E1]">
          <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-black/[0.02] border border-[#E4E6E1] rounded-xl text-center text-xs text-[#66706A] mb-4">
            {property.bedrooms > 0 ? (
              <div className="flex flex-col items-center justify-center">
                <span className="flex items-center gap-1 font-bold text-[#171A18]">
                  <Bed className="w-3.5 h-3.5 text-[#66706A]" />
                  {property.bedrooms}
                </span>
                <span className="text-[10px] text-[#66706A]">Beds</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <span className="font-bold text-[#171A18]">-</span>
                <span className="text-[10px] text-[#66706A]">Beds</span>
              </div>
            )}

            {property.bathrooms > 0 ? (
              <div className="flex flex-col items-center justify-center border-x border-[#E4E6E1]">
                <span className="flex items-center gap-1 font-bold text-[#171A18]">
                  <Bath className="w-3.5 h-3.5 text-[#66706A]" />
                  {property.bathrooms}
                </span>
                <span className="text-[10px] text-[#66706A]">Baths</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border-x border-[#E4E6E1]">
                <span className="font-bold text-[#171A18]">-</span>
                <span className="text-[10px] text-[#66706A]">Baths</span>
              </div>
            )}

            <div className="flex flex-col items-center justify-center">
              <span className="flex items-center gap-1 font-bold text-[#171A18]">
                <Maximize2 className="w-3.5 h-3.5 text-[#66706A]" />
                {formatArea(property.area_value, property.area_unit)}
              </span>
              <span className="text-[10px] text-[#66706A]">Area</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2">
            <Link
              to={`/properties/${property.slug}`}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#173C32] hover:bg-[#0F2D25] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>View Property</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            <WhatsAppButton
              phone={property.agent?.phone || property.agent?.whatsapp || '+92 324 4101140'}
              property={property}
              variant="compact"
              className="w-10 h-9.5 shrink-0 flex items-center justify-center !p-0 rounded-xl"
              label=""
            />
          </div>
        </div>
      </div>
    </div>
  );
};
