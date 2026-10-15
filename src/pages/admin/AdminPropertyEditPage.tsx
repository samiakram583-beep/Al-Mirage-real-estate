import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { PropertyForm } from '../../components/admin/PropertyForm';
import { SEOHead } from '../../components/common/SEOHead';
import { Property } from '../../types';
import { getPropertyBySlugOrId } from '../../services/store';

export const AdminPropertyEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const { openMobileSidebar } = useOutletContext<{ openMobileSidebar: () => void }>();

  const [initialData, setInitialData] = useState<Property | undefined>(undefined);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getPropertyBySlugOrId(id).then((res) => {
        if (res) setInitialData(res);
        setLoading(false);
      });
    }
  }, [id]);

  return (
    <div className="flex-1 pb-16">
      <SEOHead
        title={isEdit ? 'Edit Property Listing | Admin Portal' : 'New Property Listing | Admin Portal'}
      />

      <AdminHeader
        title={isEdit ? `Edit Property (${initialData?.property_code || id})` : 'Add New Property Listing'}
        subtitle="Complete location, dimensions, pricing, gallery photos, and SEO metadata"
        onOpenMobileMenu={openMobileSidebar}
      />

      <div className="p-4 sm:p-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 mt-3 font-semibold">Loading Property Information...</p>
          </div>
        ) : (
          <PropertyForm initialData={initialData} isEdit={isEdit} />
        )}
      </div>
    </div>
  );
};
