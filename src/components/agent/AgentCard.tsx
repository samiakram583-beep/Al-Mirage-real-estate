import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageCircle, Star, ShieldCheck, MapPin, ArrowRight } from 'lucide-react';
import { Agent } from '../../types';
import { recordPhoneClick, recordWhatsAppClick } from '../../services/store';

interface AgentCardProps {
  agent: Agent;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  return (
    <div className="bg-white rounded-2xl border border-[#E4E6E1] shadow-xs overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col group">
      {/* Photo Header */}
      <div className="relative h-60 bg-slate-900 overflow-hidden">
        <img
          src={agent.avatar_url}
          alt={agent.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/10" />

        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#173C32] text-white uppercase tracking-wider flex items-center gap-1 shadow-xs">
            <ShieldCheck className="w-3 h-3 text-[#B89B5E]" />
            Verified Agent
          </span>
        </div>

        {agent.rating && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[#B89B5E] text-xs font-bold flex items-center gap-1">
            <Star className="w-3 h-3 fill-current text-[#B89B5E]" />
            <span>{agent.rating}</span>
          </div>
        )}

        <div className="absolute bottom-3 left-4 right-4 text-white">
          <p className="text-lg font-bold leading-tight">{agent.name}</p>
          <p className="text-xs text-[#B89B5E] line-clamp-1">{agent.title}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs text-[#66706A] mb-3 pb-2 border-b border-[#E4E6E1]">
            <span>Experience:</span>
            <span className="font-bold text-[#171A18]">{agent.experience_years}+ Years</span>
          </div>

          <div className="space-y-1 mb-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#66706A]">
              Areas Served:
            </p>
            <div className="flex flex-wrap gap-1">
              {agent.areas_served.slice(0, 3).map((area) => (
                <span
                  key={area}
                  className="px-2 py-0.5 rounded-md bg-black/5 text-[10px] font-semibold text-[#171A18]"
                >
                  {area}
                </span>
              ))}
              {agent.areas_served.length > 3 && (
                <span className="px-1.5 py-0.5 rounded-md bg-black/5 text-[10px] text-[#66706A]">
                  +{agent.areas_served.length - 3}
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-[#66706A] line-clamp-2 leading-relaxed">
            {agent.bio}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-[#E4E6E1] flex items-center gap-2">
          <a
            href={`tel:${agent.phone.replace(/[^0-9+]/g, '')}`}
            onClick={() => recordPhoneClick(undefined, agent.id, 'agent_card').catch(() => {})}
            className="flex-1 py-2 px-2.5 rounded-xl bg-black/5 hover:bg-black/10 text-[#171A18] text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            title={`Call ${agent.name}`}
          >
            <Phone className="w-3.5 h-3.5 text-[#173C32]" />
            <span className="truncate">Call</span>
          </a>

          <a
            href={`https://wa.me/${agent.whatsapp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => recordWhatsAppClick(undefined, agent.id, undefined, 'agent_card').catch(() => {})}
            className="flex-1 py-2 px-2.5 rounded-xl bg-[#287A58] hover:bg-[#1f5f44] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs"
            title={`WhatsApp ${agent.name}`}
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span className="truncate">WhatsApp</span>
          </a>

          <Link
            to={`/agents/${agent.id}`}
            className="p-2 rounded-xl border border-[#E4E6E1] hover:bg-black/5 text-[#171A18] hover:text-[#173C32] transition"
            title="View Full Profile & Properties"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
