import React from 'react';
import { MessageCircle } from 'lucide-react';
import { generateWhatsAppLink } from '../../lib/formatters';
import { recordWhatsAppClick } from '../../services/store';

interface WhatsAppButtonProps {
  phone: string;
  property: {
    property_code: string;
    title: string;
    city: string;
    area: string;
    price: number;
    purpose: string;
  };
  variant?: 'primary' | 'outline' | 'compact';
  className?: string;
  label?: string;
  agentId?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phone,
  property,
  variant = 'primary',
  className = '',
  label = 'WhatsApp',
  agentId,
}) => {
  const url = generateWhatsAppLink(phone, property);

  const handleClick = () => {
    recordWhatsAppClick(property.property_code, agentId, property.area, 'property_whatsapp_btn').catch(() => {});
  };

  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-semibold transition-all rounded-xl shadow-xs';

  const variantStyles = {
    primary:
      'bg-[#287A58] hover:bg-[#1f5f44] text-white px-4 py-2.5 shadow-xs',
    outline:
      'border-2 border-[#287A58] text-[#287A58] hover:bg-[#287A58]/10 px-4 py-2',
    compact:
      'p-2 bg-[#287A58]/10 text-[#287A58] hover:bg-[#287A58]/20 rounded-lg text-xs',
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      aria-label={`Contact on WhatsApp regarding ${property.property_code}`}
    >
      <MessageCircle className="w-4 h-4 fill-current shrink-0" />
      <span>{label}</span>
    </a>
  );
};

