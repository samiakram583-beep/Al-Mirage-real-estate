import React, { useState, useEffect } from 'react';
import { Users, Search, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AgentCard } from '../../components/agent/AgentCard';
import { SEOHead } from '../../components/common/SEOHead';
import { Agent } from '../../types';
import { getAgents } from '../../services/store';

export const AgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    getAgents().then((data) => {
      setAgents(data);
      setLoading(false);
    });
  }, []);

  const filtered = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.areas_served.some((area) => area.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-transparent py-12 sm:py-16">
      <SEOHead
        title="Property Consultants | Real Estate in Bahria Town / Orchard Lahore"
        description="Meet our property consultants specializing in Bahria Town Lahore, Bahria Orchard, and surrounding areas."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E4E6E1]">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[#B89B5E]">
              Agency Team
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-[#171A18] tracking-tight mt-1">
              Property Consultants
            </h1>
            <p className="text-xs sm:text-sm text-[#66706A] mt-2 leading-relaxed">
              Consultants dedicated to real estate advisory, property transfers, and site visits in Bahria Town Lahore, Bahria Orchard, and connected sectors.
            </p>
          </div>

          {agents.length > 0 && (
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Search consultant..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white/75 text-[#171A18] placeholder-[#66706A] border border-[#D9DDD8] rounded-xl focus:ring-2 focus:ring-[#B89B5E]/30 focus:border-[#B89B5E] shadow-xs outline-none"
              />
              <Search className="w-3.5 h-3.5 text-[#66706A] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          )}
        </div>

        {loading ? (
          <p className="py-12 text-center text-[#66706A]">Loading consultants...</p>
        ) : agents.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-[#E4E6E1] p-12 text-center max-w-lg mx-auto">
            <Users className="w-10 h-10 text-[#66706A] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#171A18] mb-1">
              Our property consultants will be listed here soon.
            </h3>
            <p className="text-xs text-[#66706A] mb-5 leading-relaxed">
              Consultants registered by the agency will be showcased here. Contact our office directly for property consultations.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#173C32] hover:bg-[#0F2D25] text-white text-xs font-bold rounded-xl transition shadow-xs"
            >
              Contact Our Agency
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
