import React, { useState } from 'react';
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  Check,
  ChevronDown,
} from 'lucide-react';
import { AreaUnit, PropertyFilterParams, PropertyType, PurposeType } from '../../types';

interface FilterPanelProps {
  filters: PropertyFilterParams;
  onChange: (updated: PropertyFilterParams) => void;
  onReset: () => void;
  totalResults?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

const PAKISTANI_CITIES = ['All', 'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Faisalabad'];
const PROPERTY_TYPES: (PropertyType | 'All')[] = [
  'All',
  'House',
  'Apartment',
  'Flat',
  'Plot',
  'Commercial',
  'Office',
  'Shop',
  'Farmhouse',
];
const BEDROOM_OPTIONS: (number | 'Any')[] = ['Any', 1, 2, 3, 4, 5, 6];
const BATHROOM_OPTIONS: (number | 'Any')[] = ['Any', 1, 2, 3, 4, 5];
const AREA_UNITS: AreaUnit[] = ['Marla', 'Kanal', 'Sq. Yds', 'Sq. Ft'];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onChange,
  onReset,
  totalResults,
  isOpenMobile,
  onCloseMobile,
}) => {
  const handlePurposeChange = (purpose: PurposeType) => {
    onChange({ ...filters, purpose, page: 1 });
  };

  const handleCityChange = (city: string) => {
    onChange({ ...filters, city: city as any, page: 1 });
  };

  const handleTypeChange = (type: PropertyType | 'All') => {
    onChange({ ...filters, property_type: type, page: 1 });
  };

  const handleBedroomsChange = (beds: number | 'Any') => {
    onChange({ ...filters, bedrooms: beds, page: 1 });
  };

  const handleBathroomsChange = (baths: number | 'Any') => {
    onChange({ ...filters, bathrooms: baths, page: 1 });
  };

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E4E6E1]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#173C32]" />
          <h3 className="font-bold text-[#171A18] text-base">Filter Properties</h3>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-[#173C32] hover:text-[#0F2D25] font-semibold flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Purpose: Buy vs Rent */}
      <div>
        <label className="block text-xs font-bold text-[#171A18] uppercase tracking-wider mb-2">
          Purpose
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handlePurposeChange('Sale')}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              filters.purpose === 'Sale'
                ? 'bg-[#173C32] text-white shadow-xs'
                : 'bg-black/5 text-[#66706A] hover:text-[#171A18]'
            }`}
          >
            For Sale
          </button>
          <button
            type="button"
            onClick={() => handlePurposeChange('Rent')}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              filters.purpose === 'Rent'
                ? 'bg-[#173C32] text-white shadow-xs'
                : 'bg-black/5 text-[#66706A] hover:text-[#171A18]'
            }`}
          >
            For Rent
          </button>
        </div>
      </div>

      {/* City */}
      <div>
        <label className="block text-xs font-bold text-[#171A18] uppercase tracking-wider mb-2">
          City
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PAKISTANI_CITIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => handleCityChange(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                (filters.city || 'All') === c
                  ? 'bg-[#173C32] text-white font-bold'
                  : 'bg-black/5 text-[#171A18] hover:bg-black/10'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Area / Society text filter */}
      <div>
        <label className="block text-xs font-bold text-[#171A18] uppercase tracking-wider mb-1.5">
          Area / Society
        </label>
        <input
          type="text"
          placeholder="e.g. Phase 6, Sector C..."
          value={filters.area || ''}
          onChange={(e) => onChange({ ...filters, area: e.target.value, page: 1 })}
          className="w-full px-3 py-2 text-xs bg-white/75 hover:bg-white border border-[#D9DDD8] rounded-xl text-[#171A18] placeholder:text-[#66706A] focus:border-[#B89B5E] focus:outline-none"
        />
      </div>

      {/* Property Type */}
      <div>
        <label className="block text-xs font-bold text-[#171A18] uppercase tracking-wider mb-2">
          Property Type
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PROPERTY_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleTypeChange(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                (filters.property_type || 'All') === t
                  ? 'bg-[#173C32] text-white font-bold'
                  : 'bg-black/5 text-[#171A18] hover:bg-black/10'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-bold text-[#171A18] uppercase tracking-wider mb-2">
          Price Range (PKR)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-[#66706A]">Min PKR</span>
            <input
              type="number"
              placeholder="e.g. 5,000,000"
              value={filters.min_price || ''}
              onChange={(e) =>
                onChange({
                  ...filters,
                  min_price: e.target.value ? Number(e.target.value) : undefined,
                  page: 1,
                })
              }
              className="w-full px-3 py-2 text-xs bg-white/75 hover:bg-white border border-[#D9DDD8] rounded-xl text-[#171A18] placeholder:text-[#66706A] focus:border-[#B89B5E] focus:outline-none"
            />
          </div>
          <div>
            <span className="text-[10px] text-[#66706A]">Max PKR</span>
            <input
              type="number"
              placeholder="e.g. 100,000,000"
              value={filters.max_price || ''}
              onChange={(e) =>
                onChange({
                  ...filters,
                  max_price: e.target.value ? Number(e.target.value) : undefined,
                  page: 1,
                })
              }
              className="w-full px-3 py-2 text-xs bg-white/75 hover:bg-white border border-[#D9DDD8] rounded-xl text-[#171A18] placeholder:text-[#66706A] focus:border-[#B89B5E] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Bedrooms */}
      <div>
        <label className="block text-xs font-bold text-[#171A18] uppercase tracking-wider mb-2">
          Bedrooms
        </label>
        <div className="grid grid-cols-7 gap-1">
          {BEDROOM_OPTIONS.map((beds) => (
            <button
              key={beds}
              type="button"
              onClick={() => handleBedroomsChange(beds)}
              className={`py-1.5 text-xs font-semibold rounded-lg text-center transition ${
                (filters.bedrooms || 'Any') === beds
                  ? 'bg-[#173C32] text-white font-bold'
                  : 'bg-black/5 text-[#171A18] hover:bg-black/10'
              }`}
            >
              {beds === 'Any' ? 'Any' : `${beds}+`}
            </button>
          ))}
        </div>
      </div>

      {/* Bathrooms */}
      <div>
        <label className="block text-xs font-bold text-[#171A18] uppercase tracking-wider mb-2">
          Bathrooms
        </label>
        <div className="grid grid-cols-6 gap-1">
          {BATHROOM_OPTIONS.map((baths) => (
            <button
              key={baths}
              type="button"
              onClick={() => handleBathroomsChange(baths)}
              className={`py-1.5 text-xs font-semibold rounded-lg text-center transition ${
                (filters.bathrooms || 'Any') === baths
                  ? 'bg-[#173C32] text-white font-bold'
                  : 'bg-black/5 text-[#171A18] hover:bg-black/10'
              }`}
            >
              {baths === 'Any' ? 'Any' : `${baths}+`}
            </button>
          ))}
        </div>
      </div>

      {/* Area Unit & Size */}
      <div>
        <label className="block text-xs font-bold text-[#171A18] uppercase tracking-wider mb-2">
          Area Size
        </label>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input
            type="number"
            placeholder="Min area"
            value={filters.min_area || ''}
            onChange={(e) =>
              onChange({
                ...filters,
                min_area: e.target.value ? Number(e.target.value) : undefined,
                page: 1,
              })
            }
            className="w-full px-3 py-2 text-xs bg-white/75 hover:bg-white border border-[#D9DDD8] rounded-xl text-[#171A18] placeholder:text-[#66706A] focus:border-[#B89B5E] focus:outline-none"
          />
          <select
            value={filters.area_unit || 'Marla'}
            onChange={(e) =>
              onChange({ ...filters, area_unit: e.target.value as AreaUnit, page: 1 })
            }
            className="w-full px-2.5 py-2 text-xs bg-white/75 hover:bg-white border border-[#D9DDD8] rounded-xl text-[#171A18] focus:border-[#B89B5E] focus:outline-none"
          >
            {AREA_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Toggles: Furnished, Parking, Featured */}
      <div className="pt-2 border-t border-[#E4E6E1] space-y-2.5">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#171A18]">
          <input
            type="checkbox"
            checked={Boolean(filters.furnished)}
            onChange={(e) => onChange({ ...filters, furnished: e.target.checked || undefined, page: 1 })}
            className="w-4 h-4 rounded accent-[#173C32]"
          />
          <span>Furnished Properties Only</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#171A18]">
          <input
            type="checkbox"
            checked={Boolean(filters.parking)}
            onChange={(e) => onChange({ ...filters, parking: e.target.checked || undefined, page: 1 })}
            className="w-4 h-4 rounded accent-[#173C32]"
          />
          <span>Dedicated Parking Included</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#171A18]">
          <input
            type="checkbox"
            checked={Boolean(filters.featured)}
            onChange={(e) => onChange({ ...filters, featured: e.target.checked || undefined, page: 1 })}
            className="w-4 h-4 rounded accent-[#173C32]"
          />
          <span>Featured Listings Only</span>
        </label>
      </div>

      {totalResults !== undefined && (
        <div className="pt-4 border-t border-[#E4E6E1] text-center">
          <p className="text-xs text-[#66706A] font-medium">
            Showing <strong className="text-[#171A18]">{totalResults}</strong> matching results
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 bg-white rounded-2xl border border-[#E4E6E1] p-5 shadow-xs shrink-0 self-start sticky top-28">
        {content}
      </div>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm h-full bg-white shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="flex justify-end mb-2">
              <button
                onClick={onCloseMobile}
                className="p-1 rounded-lg text-[#66706A] hover:text-[#171A18] hover:bg-black/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {content}
            <div className="mt-6">
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-full py-3 bg-[#173C32] hover:bg-[#0F2D25] text-white text-xs font-bold rounded-xl transition"
              >
                Apply & View ({totalResults || 0} Results)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
