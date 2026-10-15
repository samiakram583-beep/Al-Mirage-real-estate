import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Building2, ChevronDown, SlidersHorizontal, Check } from 'lucide-react';
import { PropertyType, PurposeType } from '../../types';

interface SearchBarProps {
  initialPurpose?: PurposeType;
  initialCity?: string;
  initialArea?: string;
  initialType?: PropertyType | 'All';
  initialMinPrice?: number;
  initialMaxPrice?: number;
  onSearch?: (params: any) => void;
  inline?: boolean;
}

const CITIES = [
  'All Cities',
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Peshawar',
  'Faisalabad',
  'Multan',
  'Gwadar',
];

const PROPERTY_TYPES = [
  'All Types',
  'House',
  'Apartment',
  'Flat',
  'Plot',
  'Commercial',
  'Office',
  'Shop',
  'Farmhouse',
  'Building',
];

export const SearchBar: React.FC<SearchBarProps> = ({
  initialPurpose = 'Sale',
  initialCity = 'All Cities',
  initialArea = '',
  initialType = 'All Types',
  initialMinPrice,
  initialMaxPrice,
  onSearch,
  inline = false,
}) => {
  const navigate = useNavigate();
  const [purpose, setPurpose] = useState<PurposeType>(initialPurpose);
  const [city, setCity] = useState(initialCity);
  const [area, setArea] = useState(initialArea);
  const [propertyType, setPropertyType] = useState(initialType);
  const [minPrice, setMinPrice] = useState<string>(initialMinPrice ? String(initialMinPrice) : '');
  const [maxPrice, setMaxPrice] = useState<string>(initialMaxPrice ? String(initialMaxPrice) : '');
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const searchParams = new URLSearchParams();
    searchParams.set('purpose', purpose);
    if (city && city !== 'All Cities') searchParams.set('city', city);
    if (area.trim()) searchParams.set('area', area.trim());
    if (propertyType && propertyType !== 'All Types') searchParams.set('type', propertyType);
    if (minPrice) searchParams.set('min_price', minPrice);
    if (maxPrice) searchParams.set('max_price', maxPrice);

    if (onSearch) {
      onSearch({
        purpose,
        city: city === 'All Cities' ? 'All' : city,
        area: area.trim(),
        property_type: propertyType === 'All Types' ? 'All' : propertyType,
        min_price: minPrice ? Number(minPrice) : undefined,
        max_price: maxPrice ? Number(maxPrice) : undefined,
      });
    } else {
      navigate(`/properties?${searchParams.toString()}`);
    }
  };

  return (
    <div
      className={`w-full bg-white rounded-2xl shadow-xl border border-[#E4E6E1] p-4 sm:p-6 transition-all ${
        inline ? '' : 'max-w-5xl mx-auto -mt-10 sm:-mt-12 relative z-20'
      }`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Purpose Toggle Tabs: Buy vs Rent */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E4E6E1] flex-wrap gap-2">
          <div className="flex items-center gap-1.5 p-1 bg-black/5 rounded-xl">
            <button
              type="button"
              onClick={() => setPurpose('Sale')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                purpose === 'Sale'
                  ? 'bg-[#173C32] text-white shadow-xs'
                  : 'text-[#66706A] hover:text-[#171A18]'
              }`}
            >
              Buy Property
            </button>
            <button
              type="button"
              onClick={() => setPurpose('Rent')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                purpose === 'Rent'
                  ? 'bg-[#173C32] text-white shadow-xs'
                  : 'text-[#66706A] hover:text-[#171A18]'
              }`}
            >
              Rent Property
            </button>
          </div>

          <div className="text-xs text-[#66706A] hidden sm:flex items-center gap-2">
            <span className="font-semibold text-[#171A18]">Quick Search:</span>
            <button
              type="button"
              onClick={() => {
                setCity('Lahore');
                setArea('DHA');
              }}
              className="hover:text-[#173C32] underline underline-offset-2"
            >
              DHA Lahore
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                setCity('Lahore');
                setArea('Bahria Town');
              }}
              className="hover:text-[#173C32] underline underline-offset-2"
            >
              Bahria Town
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                setCity('Islamabad');
                setArea('F-7');
              }}
              className="hover:text-[#173C32] underline underline-offset-2"
            >
              Islamabad F-7
            </button>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-center">
          {/* City */}
          <div className="lg:col-span-3">
            <label className="block text-[11px] font-bold text-[#66706A] uppercase tracking-wider mb-1">
              Select City
            </label>
            <div className="relative">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-12 pl-3.5 pr-8 bg-white/75 hover:bg-white border border-[#D9DDD8] rounded-xl text-sm font-semibold text-[#171A18] appearance-none focus:outline-none focus:ring-2 focus:ring-[#B89B5E]/30 focus:border-[#B89B5E] transition"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#66706A] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Area / Society */}
          <div className="lg:col-span-3">
            <label className="block text-[11px] font-bold text-[#66706A] uppercase tracking-wider mb-1">
              Location / Society
            </label>
            <div className="relative">
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. DHA, Bahria, Gulberg..."
                className="w-full h-12 pl-9 pr-3 bg-white/75 hover:bg-white border border-[#D9DDD8] rounded-xl text-sm font-medium text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#B89B5E]/30 focus:border-[#B89B5E] transition placeholder:text-[#66706A]"
              />
              <MapPin className="w-4 h-4 text-[#B89B5E] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Property Type */}
          <div className="lg:col-span-3">
            <label className="block text-[11px] font-bold text-[#66706A] uppercase tracking-wider mb-1">
              Property Type
            </label>
            <div className="relative">
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as any)}
                className="w-full h-12 pl-3.5 pr-8 bg-white/75 hover:bg-white border border-[#D9DDD8] rounded-xl text-sm font-semibold text-[#171A18] appearance-none focus:outline-none focus:ring-2 focus:ring-[#B89B5E]/30 focus:border-[#B89B5E] transition"
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#66706A] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Price Range Button or Direct Input */}
          <div className="lg:col-span-3 relative">
            <label className="block text-[11px] font-bold text-[#66706A] uppercase tracking-wider mb-1">
              Budget (PKR)
            </label>
            <button
              type="button"
              onClick={() => setShowPriceDropdown(!showPriceDropdown)}
              className="w-full h-12 px-3 bg-white/75 hover:bg-white border border-[#D9DDD8] rounded-xl text-xs font-semibold text-[#171A18] flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-[#B89B5E]/30 focus:border-[#B89B5E] transition"
            >
              <span className="truncate">
                {minPrice || maxPrice
                  ? `${minPrice ? `From ${Number(minPrice) / 100000} Lac` : 'Min'} - ${
                      maxPrice ? `${Number(maxPrice) / 100000} Lac` : 'Max'
                    }`
                  : 'Any Budget Range'}
              </span>
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#66706A] shrink-0 ml-1" />
            </button>

            {/* Price Popover */}
            {showPriceDropdown && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#E4E6E1] p-4 z-30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#171A18]">Filter by PKR Range</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMinPrice('');
                      setMaxPrice('');
                    }}
                    className="text-[11px] text-[#173C32] hover:underline"
                  >
                    Clear
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-[#66706A] uppercase">Min Price</span>
                    <input
                      type="number"
                      placeholder="e.g. 5000000"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white/75 border border-[#D9DDD8] rounded-lg text-[#171A18] focus:border-[#B89B5E] focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#66706A] uppercase">Max Price</span>
                    <input
                      type="number"
                      placeholder="e.g. 50000000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white/75 border border-[#D9DDD8] rounded-lg text-[#171A18] focus:border-[#B89B5E] focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPriceDropdown(false)}
                  className="w-full py-2 bg-[#173C32] hover:bg-[#0F2D25] text-white text-xs font-semibold rounded-lg transition"
                >
                  Apply Budget
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search Submit Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#173C32] hover:bg-[#0F2D25] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Search Available Properties</span>
          </button>
        </div>
      </form>
    </div>
  );
};
