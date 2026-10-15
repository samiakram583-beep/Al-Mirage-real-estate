import React from 'react';
import { SearchX, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No properties found',
  description = 'Try adjusting your search criteria, removing price filters, or expanding your preferred location.',
  actionText = 'Reset Filters',
  actionHref,
  onAction,
  icon,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-xl mx-auto my-8">
      <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100">
        {icon || <SearchX className="w-8 h-8" />}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 leading-relaxed">{description}</p>
      {actionHref ? (
        <Link
          to={actionHref}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0B192C] text-white text-sm font-semibold rounded-xl hover:bg-[#1E3E62] transition shadow-sm"
        >
          {actionText}
          <ArrowRight className="w-4 h-4" />
        </Link>
      ) : onAction ? (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0B192C] text-white text-sm font-semibold rounded-xl hover:bg-[#1E3E62] transition shadow-sm"
        >
          {actionText}
          <ArrowRight className="w-4 h-4" />
        </button>
      ) : null}
    </div>
  );
};
