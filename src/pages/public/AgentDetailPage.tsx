import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Phone,
  MessageCircle,
  Mail,
  ShieldCheck,
  Star,
  MapPin,
  Building,
  ArrowLeft,
} from 'lucide-react';
import { PropertyCard } from '../../components/property/PropertyCard';
import { SEOHead } from '../../components/common/SEOHead';
import { Agent, Property } from '../../types';
import { getAgentById, getProperties } from '../../services/store';

export const AgentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    getAgentById(id).then(async (agentData) => {
      setAgent(agentData);
      if (agentData) {
        const res = await getProperties();
        const agentProps = res.properties.filter((p) => p.agent_id === agentData.id);
        setProperties(agentProps);
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent py-20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#173C32] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-transparent py-20 text-center">
        <h2 className="text-xl font-bold text-[#171A18]">Agent Profile Not Found</h2>
        <Link to="/agents" className="text-xs text-[#173C32] underline mt-2 inline-block font-semibold">
          Return to All Agents
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent py-12">
      <SEOHead
        title={`${agent.name} | Property Consultant Profile`}
        description={`${agent.name} - ${agent.title}. Experience: ${agent.experience_years}+ years. Areas: ${agent.areas_served.join(', ')}.`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        <Link
          to="/agents"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#66706A] hover:text-[#173C32] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Agents Directory</span>
        </Link>

        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl border border-[#E4E6E1] p-6 sm:p-10 shadow-xs flex flex-col md:flex-row items-center md:items-start gap-8">
          <img
            src={agent.avatar_url}
            alt={agent.name}
            className="w-36 h-36 sm:w-48 sm:h-48 rounded-3xl object-cover border-2 border-[#E4E6E1] shadow-md shrink-0"
          />

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-3 py-1 rounded-lg text-[10px] font-bold bg-[#173C32] text-white uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#B89B5E]" />
                  Verified Consultant
                </span>
                {agent.license_number && (
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold bg-black/5 text-[#171A18]">
                    Reg: {agent.license_number}
                  </span>
                )}
                {agent.rating && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#B89B5E]/10 text-[#171A18] border border-[#B89B5E]/30 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-[#B89B5E] text-[#B89B5E]" />
                    {agent.rating}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#171A18] tracking-tight">
                {agent.name}
              </h1>
              <p className="text-sm font-semibold text-[#173C32]">{agent.title}</p>
              <p className="text-xs text-[#66706A] font-medium">
                {agent.agency_name || 'Real Estate In Bahria Town / Orchard Lahore'} • {agent.experience_years}+ Years Experience
              </p>
            </div>

            <p className="text-xs sm:text-sm text-[#66706A] leading-relaxed max-w-3xl">
              {agent.bio}
            </p>

            <div className="space-y-1 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#66706A]">
                Specialized Areas:
              </span>
              <div className="flex flex-wrap justify-center md:justify-start gap-1.5">
                {agent.areas_served.map((a) => (
                  <span
                    key={a}
                    className="px-2.5 py-1 rounded-lg bg-[#173C32]/8 text-xs font-medium text-[#173C32]"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Direct Contact CTAs */}
            <div className="pt-3 flex flex-wrap justify-center md:justify-start gap-3">
              <a
                href={`tel:${agent.phone.replace(/[^0-9+]/g, '')}`}
                className="px-5 py-2.5 rounded-xl bg-[#173C32] text-white text-xs font-bold hover:bg-[#0F2D25] transition shadow-xs flex items-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-[#B89B5E]" />
                <span>Call {agent.phone}</span>
              </a>

              <a
                href={`https://wa.me/${agent.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-[#287A58] text-white text-xs font-bold hover:bg-[#1f5f44] transition shadow-xs flex items-center gap-2"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>Chat on WhatsApp</span>
              </a>

              <a
                href={`mailto:${agent.email}`}
                className="px-4 py-2.5 rounded-xl bg-white border border-[#E4E6E1] text-[#171A18] text-xs font-semibold hover:bg-black/5 transition flex items-center gap-2"
              >
                <Mail className="w-3.5 h-3.5 text-[#66706A]" />
                <span>{agent.email}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Listed Properties */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E6E1]">
            <h2 className="text-xl sm:text-2xl font-bold text-[#171A18]">
              Properties Represented by {agent.name} ({properties.length})
            </h2>
          </div>

          {properties.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-[#E4E6E1] text-center">
              <Building className="w-10 h-10 text-[#66706A] mx-auto mb-2" />
              <p className="text-sm font-bold text-[#171A18]">
                No active public listings currently assigned to this agent.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
