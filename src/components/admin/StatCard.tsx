import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  } | null;
  noHistoryText?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  noHistoryText,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-[#E4E6E1] p-5 shadow-xs flex items-start justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#66706A] mb-1">
          {title}
        </p>
        <p className="text-2xl sm:text-3xl font-black text-[#171A18] font-sans tracking-tight">
          {value}
        </p>
        {subtitle && <p className="text-xs text-[#66706A] mt-1">{subtitle}</p>}
        {trend ? (
          <div className="flex items-center gap-1 mt-2 text-xs font-semibold">
            <span className={trend.positive ? 'text-[#287A58]' : 'text-[#B84A4A]'}>
              {trend.positive ? '+' : ''}
              {trend.value}
            </span>
            <span className="text-[#66706A] font-normal">vs last month</span>
          </div>
        ) : noHistoryText ? (
          <p className="text-[11px] text-[#66706A] mt-2 font-medium">{noHistoryText}</p>
        ) : null}
      </div>

      <div className="p-3 rounded-xl bg-[#173C32]/8 border border-[#E4E6E1] text-[#173C32]">
        {icon}
      </div>
    </div>
  );
};

