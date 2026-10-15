import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import { SEOHead } from '../../components/common/SEOHead';
import { LocationArea } from '../../types';
import { getPopularAreas } from '../../services/store';

export const AreasPage: React.FC = () => {
  const [areas, setAreas] = useState<LocationArea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPopularAreas().then((data) => {
      setAreas(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-transparent py-12 sm:py-16">
      <SEOHead
        title="Bahria Town & Orchard Lahore Housing Areas | Real Estate"
        description="Explore housing sectors and developments across Bahria Town Lahore, Bahria Orchard phases, and Raiwind Road corridor."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-[#B89B5E]">
            Sectors & Neighborhoods
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#171A18] tracking-tight mt-1">
            Bahria Town & Orchard Locations
          </h1>
          <p className="text-xs sm:text-sm text-[#66706A] mt-2 leading-relaxed">
            Detailed information on housing sectors, blocks, and commercial zones across Bahria Town Lahore, Bahria Orchard phases, and connected Lahore roads.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 bg-white/60 border border-[#E4E6E1] rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {areas.map((area) => (
              <div
                key={area.id}
                className="bg-white rounded-3xl border border-[#E4E6E1] overflow-hidden shadow-xs hover:shadow-md hover:border-[#173C32]/40 transition-all flex flex-col group"
              >
                <div className="relative h-48 overflow-hidden bg-black/5">
                  <img
                    src={area.image_url}
                    alt={area.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white text-[#171A18] uppercase tracking-wider shadow-xs border border-[#E4E6E1]">
                      {area.city}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h2 className="text-lg font-bold text-[#171A18] leading-snug">
                      {area.name}
                    </h2>
                    <p className="text-xs text-[#66706A] line-clamp-3 leading-relaxed mt-2">
                      {area.description}
                    </p>

                    <div className="space-y-1.5 pt-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#66706A]">
                        Sectors / Phases:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {area.popular_societies.map((soc) => (
                          <span
                            key={soc}
                            className="px-2 py-0.5 rounded-md bg-[#173C32]/8 text-[10px] font-medium text-[#173C32]"
                          >
                            {soc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E4E6E1]">
                    <Link
                      to={`/areas/${area.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#173C32] hover:text-[#0F2D25] transition"
                    >
                      <span>Explore Sector Listings</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
