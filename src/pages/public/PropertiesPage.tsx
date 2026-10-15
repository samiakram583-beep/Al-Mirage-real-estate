import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import {
  SlidersHorizontal,
  Search,
  ArrowUpDown,
  Filter,
  Sparkles,
  Heart,
} from 'lucide-react';
import { FilterPanel } from '../../components/property/FilterPanel';
import { PropertyGrid } from '../../components/property/PropertyGrid';
import { Pagination } from '../../components/common/Pagination';
import { SEOHead } from '../../components/common/SEOHead';
import { Property, PropertyFilterParams, PropertyType, PurposeType } from '../../types';
import { getProperties } from '../../services/store';
import { useFavorites } from '../../context/FavoritesContext';

interface PropertiesPageProps {
  forcedPurpose?: PurposeType;
}

export const PropertiesPage: React.FC<PropertiesPageProps> = ({ forcedPurpose }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { favorites } = useFavorites();

  const showFavoritesOnly = searchParams.get('favorites') === 'true';

  // Read initial query parameters
  const initialPurpose: PurposeType | undefined =
    forcedPurpose || (searchParams.get('purpose') as PurposeType) || undefined;
  const initialType: PropertyType | 'All' =
    (searchParams.get('type') as PropertyType) || 'All';
  const initialCity = searchParams.get('city') || 'All';
  const initialArea = searchParams.get('area') || '';
  const initialMinPrice = searchParams.get('min_price')
    ? Number(searchParams.get('min_price'))
    : undefined;
  const initialMaxPrice = searchParams.get('max_price')
    ? Number(searchParams.get('max_price'))
    : undefined;
  const initialQuery = searchParams.get('q') || '';
  const initialSort = (searchParams.get('sort') as any) || 'newest';
  const initialPage = Number(searchParams.get('page')) || 1;

  const [filters, setFilters] = useState<PropertyFilterParams>({
    purpose: initialPurpose,
    property_type: initialType,
    city: initialCity,
    area: initialArea,
    min_price: initialMinPrice,
    max_price: initialMaxPrice,
    query: initialQuery,
    sort_by: initialSort,
    page: initialPage,
    limit: 9,
  });

  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // Sync forcedPurpose if component prop changes (/buy vs /rent)
  useEffect(() => {
    if (forcedPurpose && filters.purpose !== forcedPurpose) {
      setFilters((prev) => ({ ...prev, purpose: forcedPurpose, page: 1 }));
    }
  }, [forcedPurpose]);

  // Load properties whenever filters change
  useEffect(() => {
    setLoading(true);
    getProperties(filters)
      .then((res) => {
        if (showFavoritesOnly) {
          const favProps = res.properties.filter((p) => favorites.includes(p.id));
          setProperties(favProps);
          setTotal(favProps.length);
          setTotalPages(1);
        } else {
          setProperties(res.properties);
          setTotal(res.total);
          setTotalPages(res.totalPages);
        }
      })
      .finally(() => setLoading(false));
  }, [filters, showFavoritesOnly, favorites]);

  const handleFilterChange = (updated: PropertyFilterParams) => {
    setFilters(updated);
    // Sync URL
    const params = new URLSearchParams();
    if (updated.purpose) params.set('purpose', updated.purpose);
    if (updated.city && updated.city !== 'All') params.set('city', updated.city);
    if (updated.area) params.set('area', updated.area);
    if (updated.property_type && updated.property_type !== 'All')
      params.set('type', updated.property_type);
    if (updated.min_price) params.set('min_price', String(updated.min_price));
    if (updated.max_price) params.set('max_price', String(updated.max_price));
    if (updated.sort_by && updated.sort_by !== 'newest') params.set('sort', updated.sort_by);
    if (updated.page && updated.page > 1) params.set('page', String(updated.page));
    if (updated.query) params.set('q', updated.query);
    if (showFavoritesOnly) params.set('favorites', 'true');
    setSearchParams(params, { replace: true });
  };

  const handleResetFilters = () => {
    const clean: PropertyFilterParams = {
      purpose: forcedPurpose,
      property_type: 'All',
      city: 'All',
      area: '',
      sort_by: 'newest',
      page: 1,
      limit: 9,
    };
    setSearchQuery('');
    handleFilterChange(clean);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange({ ...filters, query: searchQuery.trim(), page: 1 });
  };

  const pageTitle = showFavoritesOnly
    ? 'Saved Favorite Properties'
    : forcedPurpose === 'Sale'
    ? 'Properties for Sale in Pakistan'
    : forcedPurpose === 'Rent'
    ? 'Properties for Rent in Pakistan'
    : 'Browse All Properties';

  return (
    <div className="min-h-screen bg-transparent py-8 sm:py-12">
      <SEOHead
        title={`${pageTitle} | Real Estate In Bahria Town / Orchard Lahore`}
        description="Search through verified houses, residential plots, and commercial properties for sale or rent across Bahria Town Lahore, Bahria Orchard, and Raiwind Road."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E4E6E1]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {showFavoritesOnly && (
                  <span className="p-1 rounded-md bg-rose-50 text-rose-600">
                    <Heart className="w-4 h-4 fill-current" />
                  </span>
                )}
                <h1 className="text-2xl sm:text-3xl font-black text-[#171A18] tracking-tight font-sans">
                  {pageTitle}
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-[#66706A]">
                {showFavoritesOnly
                  ? `You have saved ${favorites.length} listings in your short-list.`
                  : `Showing verified residential and commercial properties in Pakistan.`}
              </p>
            </div>

            {/* Search Input in Header */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md w-full">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search title, city, area or code (e.g. PB-1001)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-white/75 hover:bg-white border border-[#D9DDD8] rounded-xl text-[#171A18] placeholder:text-[#66706A] focus:border-[#B89B5E] focus:outline-none shadow-xs"
                />
                <Search className="w-3.5 h-3.5 text-[#66706A] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-[#173C32] hover:bg-[#0F2D25] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>

          {/* Sub Bar: Controls, Sort, and Mobile Filter Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E4E6E1] rounded-xl text-xs font-bold text-[#171A18] hover:border-[#173C32] shadow-xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#173C32]" />
                <span>Filters</span>
              </button>

              <span className="text-xs text-[#66706A]">
                Found <strong className="text-[#171A18]">{total}</strong> properties
              </span>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#66706A] hidden sm:inline">Sort By:</span>
              <select
                value={filters.sort_by || 'newest'}
                onChange={(e) =>
                  handleFilterChange({ ...filters, sort_by: e.target.value as any, page: 1 })
                }
                className="px-3 py-2 text-xs font-semibold bg-white border border-[#D9DDD8] rounded-xl text-[#171A18] shadow-xs focus:border-[#B89B5E] focus:outline-none"
              >
                <option value="newest">Newest Listed</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="area_desc">Area: Largest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content: Sidebar + Grid */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Desktop Filter Panel */}
          <FilterPanel
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
            totalResults={total}
            isOpenMobile={mobileFilterOpen}
            onCloseMobile={() => setMobileFilterOpen(false)}
          />

          {/* Listings Grid */}
          <div className="flex-1 w-full">
            <PropertyGrid
              properties={properties}
              loading={loading}
              emptyTitle={
                showFavoritesOnly
                  ? 'No saved properties yet'
                  : 'No properties match your filter criteria'
              }
              emptyDescription={
                showFavoritesOnly
                  ? 'Click the heart icon on any property card to save it here for later.'
                  : 'Try expanding your price range, clearing the society field, or switching between Buy and Rent.'
              }
              onResetFilters={handleResetFilters}
            />

            {!loading && totalPages > 1 && (
              <Pagination
                currentPage={filters.page || 1}
                totalPages={totalPages}
                onPageChange={(page) => handleFilterChange({ ...filters, page })}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
