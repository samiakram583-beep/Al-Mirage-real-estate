import React from 'react';
import { Phone, MessageCircle, Mail } from 'lucide-react';
import { Property } from '../../types';
import { generateWhatsAppLink } from '../../lib/formatters';
import { recordPhoneClick, recordWhatsAppClick } from '../../services/store';

interface MobilePropertyBottomBarProps {
  property: Property;
  onOpenInquiryModal: () => void;
}

export const MobilePropertyBottomBar: React.FC<MobilePropertyBottomBarProps> = ({
  property,
  onOpenInquiryModal,
}) => {
  const phone = property.agent?.phone || '+923008456789';
  const whatsapp = property.agent?.whatsapp || phone;
  const whatsappUrl = generateWhatsAppLink(whatsapp, property);

  const handleCallClick = () => {
    recordPhoneClick(property.id, property.agent_id, 'mobile_bottom_bar').catch(() => {});
  };

  const handleWhatsAppClick = () => {
    recordWhatsAppClick(property.property_code, property.agent_id, property.area, 'mobile_bottom_bar').catch(() => {});
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 lg:hidden shadow-2xl">
      <div className="max-w-md mx-auto grid grid-cols-3 gap-2">
        <a
          href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
          onClick={handleCallClick}
          className="flex flex-col items-center justify-center py-2 px-1 bg-slate-900 text-white rounded-xl text-[11px] font-bold shadow-xs active:scale-95 transition"
        >
          <Phone className="w-4 h-4 text-amber-400 mb-0.5" />
          <span>Call</span>
        </a>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWhatsAppClick}
          className="flex flex-col items-center justify-center py-2 px-1 bg-emerald-600 text-white rounded-xl text-[11px] font-bold shadow-xs active:scale-95 transition"
        >
          <MessageCircle className="w-4 h-4 fill-current mb-0.5" />
          <span>WhatsApp</span>
        </a>

        <button
          type="button"
          onClick={onOpenInquiryModal}
          className="flex flex-col items-center justify-center py-2 px-1 bg-amber-400 text-slate-950 rounded-xl text-[11px] font-bold shadow-xs active:scale-95 transition"
        >
          <Mail className="w-4 h-4 mb-0.5" />
          <span>Inquire</span>
        </button>
      </div>
    </div>
  );
};

