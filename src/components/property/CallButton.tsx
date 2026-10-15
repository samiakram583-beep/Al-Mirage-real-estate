import React from 'react';
import { Phone } from 'lucide-react';
import { recordPhoneClick } from '../../services/store';

interface CallButtonProps {
  phone: string;
  className?: string;
  variant?: 'primary' | 'outline' | 'compact';
  label?: string;
  propertyId?: string;
  agentId?: string;
}

export const CallButton: React.FC<CallButtonProps> = ({
  phone,
  className = '',
  variant = 'primary',
  label = 'Call Agent',
  propertyId,
  agentId,
}) => {
  const cleanNumber = phone.replace(/[^0-9+]/g, '');

  const handleClick = () => {
    recordPhoneClick(propertyId, agentId, 'call_btn').catch(() => {});
  };

  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-semibold transition-all rounded-xl shadow-xs';

  const variantStyles = {
    primary: 'bg-[#173C32] hover:bg-[#0F2D25] text-white px-4 py-2.5',
    outline: 'border border-[#E4E6E1] text-[#171A18] hover:bg-black/5 px-4 py-2',
    compact: 'p-2 bg-black/5 text-[#171A18] hover:bg-black/10 rounded-lg text-xs',
  };

  return (
    <a
      href={`tel:${cleanNumber}`}
      onClick={handleClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      aria-label={`Call agent at ${phone}`}
    >
      <Phone className="w-4 h-4 shrink-0 text-[#B89B5E]" />
      <span>{label}</span>
    </a>
  );
};

