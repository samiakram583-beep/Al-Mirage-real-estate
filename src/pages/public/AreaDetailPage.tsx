import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SEOHead } from '../../components/common/SEOHead';
import { PropertyGrid } from '../../components/property/PropertyGrid';
import { Property, LocationArea } from '../../types';
import { getAreaBySlug, getProperties, getPopularAreas } from '../../services/store';

export const AreaDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [area, setArea] = useState<LocationArea | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    getAreaBySlug(slug).then(async (areaData) => {
      if (areaData) {
        setArea(areaData);
        const res = await getProperties({
          society: areaData.name,
          limit: 12,
        });
        setProperties(res.properties);
      } else {
        const allAreas = await getPopularAreas();
        const fallback = allAreas.find((a) =>
          a.slug.includes(slug.toLowerCase()) ||
          a.name.toLowerCase().includes(slug.toLowerCase())
        );
        if (fallback) {
          setArea(fallback);
          const res = await getProperties({ query: fallback.name, limit: 12 });
          setProperties(res.properties);
        }
      }
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent py-20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#173C32] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!area) {
    return (
      <div className="min-h-screen bg-transparent py-20 px-4 text-center">
        <h2 className="text-xl font-bold text-[#171A18]">Area Not Found</h2>
        <Link to="/areas" className="text-xs text-[#173C32] underline mt-2 inline-block font-semibold">
          Return to All Areas
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-20">
      <SEOHead
        title={`${area.name} Real Estate | Bahria Town / Orchard Lahore`}
        description={`Explore houses, plots, and commercial listings in ${area.name}. ${area.description}`}
      />

      {/* Header Banner - Clean, Bright & Seamless */}
      <div className="bg-transparent border-b border-[#E4E6E1] py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <Link
            to="/areas"
            className="inline-flex items-center gap-1.5 text-xs text-[#66706A] hover:text-[#173C32] transition font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Sectors & Areas</span>
          </Link>

          <div className="space-y-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#173C32]/8 text-[#173C32] uppercase tracking-wider inline-block">
              {area.city}, {area.province}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-[#171A18] tracking-tight">
              {area.name} Listings
            </h1>
            <p className="max-w-2xl text-xs sm:text-sm text-[#66706A] leading-relaxed">
              {area.description}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[#66706A] font-semibold">Key Sectors / Blocks:</span>
            {area.popular_societies.map((soc) => (
              <span key={soc} className="px-2.5 py-0.5 rounded-md bg-white border border-[#E4E6E1] text-[#171A18] font-medium">
                {soc}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Properties in this area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-10 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#E4E6E1]">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#171A18]">
              Properties in {area.name}
            </h2>
            <p className="text-xs text-[#66706A] mt-0.5">
              {properties.length} active listings found
            </p>
          </div>
        </div>

        <PropertyGrid
          properties={properties}
          emptyTitle={`No properties currently listed in ${area.name}`}
          emptyDescription="Properties added to this sector will appear here. Contact us if you are seeking a specific plot or house."
        />
      </div>
    </div>
  );
};
