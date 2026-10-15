import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Edit, Trash2, Home, Building2, Key, Compass, ShieldCheck, Award } from 'lucide-react';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { Modal } from '../../components/common/Modal';
import { SEOHead } from '../../components/common/SEOHead';
import { RealEstateService } from '../../types';
import { getServices, saveService, deleteService } from '../../services/store';
import { useToast } from '../../context/ToastContext';
import { generateSlug } from '../../lib/formatters';

const ICONS = ['Home', 'Building2', 'Key', 'Compass', 'ShieldCheck', 'Award'];

export const AdminServicesPage: React.FC = () => {
  const { openMobileSidebar } = useOutletContext<{ openMobileSidebar: () => void }>();
  const { showToast } = useToast();

  const [services, setServices] = useState<RealEstateService[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RealEstateService | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [iconName, setIconName] = useState('Home');
  const [benefitsInput, setBenefitsInput] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  const loadData = () => {
    setLoading(true);
    getServices()
      .then((data) => setServices(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setTitle('');
    setSlug('');
    setShortDescription('');
    setFullDescription('');
    setIconName('Home');
    setBenefitsInput('');
    setIsPublished(true);
    setModalOpen(true);
  };

  const openEditModal = (item: RealEstateService) => {
    setEditingItem(item);
    setTitle(item.title);
    setSlug(item.slug);
    setShortDescription(item.short_description);
    setFullDescription(item.full_description);
    setIconName(item.icon_name || 'Home');
    setBenefitsInput(item.benefits?.join(', ') || '');
    setIsPublished(item.is_published !== false);
    setModalOpen(true);
  };

  const handleDelete = async (id: string, serviceTitle: string) => {
    if (window.confirm(`Delete service "${serviceTitle}"?`)) {
      await deleteService(id);
      showToast('Service Deleted', 'Service removed from portal.', 'info');
      loadData();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const benefits = benefitsInput
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean);

    await saveService({
      id: editingItem?.id,
      title: title.trim(),
      slug: slug.trim() || generateSlug(title),
      short_description: shortDescription.trim(),
      full_description: fullDescription.trim(),
      icon_name: iconName,
      benefits,
      is_published: isPublished,
    });

    showToast(
      editingItem ? 'Service Updated' : 'Service Added',
      'Service successfully saved.',
      'success'
    );
    setModalOpen(false);
    loadData();
  };

  return (
    <div className="flex-1 pb-16">
      <SEOHead title="Services Management | Admin" />

      <AdminHeader
        title="Real Estate Services"
        subtitle="Configure verified service offerings (Buying, Selling, Tenancy, Consultation)"
        onOpenMobileMenu={openMobileSidebar}
        actionButton={
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service</span>
          </button>
        }
      />

      <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
        {loading ? (
          <p className="py-12 text-center text-slate-400">Loading services...</p>
        ) : services.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center max-w-lg mx-auto">
            <Home className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">
              No services configured yet.
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Add the specific confirmed services offered by the business (e.g. Property Buying, Plot File Verification, Rental Management).
            </p>
            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl"
            >
              + Add First Service
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Icon: {item.icon_name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.is_published !== false
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.is_published !== false ? 'Published' : 'Hidden'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.short_description || item.full_description}
                  </p>

                  {item.benefits && item.benefits.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      {item.benefits.map((b) => (
                        <p key={b} className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <span>{b}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Service' : 'Add Real Estate Service'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Service Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!editingItem) setSlug(generateSlug(e.target.value));
              }}
              placeholder="e.g. Property Buying in Bahria Town"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Icon
            </label>
            <select
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            >
              {ICONS.map((ic) => (
                <option key={ic} value={ic}>
                  {ic}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Short Summary
            </label>
            <textarea
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Brief overview shown on cards..."
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Description
            </label>
            <textarea
              rows={4}
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              placeholder="Detailed explanation of the service workflow..."
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Key Deliverables (Comma-separated)
            </label>
            <input
              type="text"
              value={benefitsInput}
              onChange={(e) => setBenefitsInput(e.target.value)}
              placeholder="e.g. Physical site tours, Society file verification, Direct transfer coordination"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 rounded text-slate-900"
            />
            <span>Publish Service on Public Website</span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800"
            >
              Save Service
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
