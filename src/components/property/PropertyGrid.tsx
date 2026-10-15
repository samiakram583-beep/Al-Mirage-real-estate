import React from 'react';
import { Property } from '../../types';
import { PropertyCard } from './PropertyCard';
import { PropertyCardSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';

interface PropertyGridProps {
  properties: Property[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onResetFilters?: () => void;
}

export const PropertyGrid: React.FC<PropertyGridProps> = ({
  properties,
  loading = false,
  emptyTitle,
  emptyDescription,
  onResetFilters,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <EmptyState
        title={emptyTitle || 'No matching properties found'}
        description={
          emptyDescription ||
          'Try clearing search terms or removing city and budget restrictions to discover more options.'
        }
        onAction={onResetFilters}
        actionText="Clear All Filters"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
};
