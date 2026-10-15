import React from 'react';
import { InquiryStatus } from '../../types';

interface LeadStatusBadgeProps {
  status: InquiryStatus;
  size?: 'sm' | 'md';
}

export const LeadStatusBadge: React.FC<LeadStatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const styles: Record<InquiryStatus, string> = {
    New: 'bg-blue-50 text-blue-700 border-blue-200',
    Contacted: 'bg-purple-50 text-purple-700 border-purple-200',
    Qualified: 'bg-amber-50 text-amber-800 border-amber-200',
    'Viewing Scheduled': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Negotiation: 'bg-orange-50 text-orange-700 border-orange-200',
    Closed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    Lost: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const sizeClasses =
    size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-bold rounded-lg border uppercase tracking-wider ${styles[status] || 'bg-slate-100 text-slate-700'} ${sizeClasses}`}
    >
      {status}
    </span>
  );
};
