import React from 'react';

export const PropertyCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm animate-pulse flex flex-col">
      <div className="h-60 bg-slate-200 relative" />
      <div className="p-5 flex-1 flex flex-col space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-5 w-24 bg-slate-200 rounded" />
          <div className="h-4 w-16 bg-slate-200 rounded" />
        </div>
        <div className="h-6 w-3/4 bg-slate-200 rounded" />
        <div className="h-4 w-1/2 bg-slate-200 rounded" />
        <div className="h-10 bg-slate-100 rounded-lg my-2" />
        <div className="pt-2 flex justify-between items-center border-t border-slate-100">
          <div className="h-5 w-28 bg-slate-200 rounded" />
          <div className="h-8 w-24 bg-slate-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 animate-pulse">
      <div className="h-12 bg-slate-100" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 px-6 flex items-center justify-between gap-4">
          <div className="h-4 w-1/4 bg-slate-200 rounded" />
          <div className="h-4 w-1/6 bg-slate-200 rounded" />
          <div className="h-4 w-1/5 bg-slate-200 rounded" />
          <div className="h-4 w-1/12 bg-slate-200 rounded" />
        </div>
      ))}
    </div>
  );
};
