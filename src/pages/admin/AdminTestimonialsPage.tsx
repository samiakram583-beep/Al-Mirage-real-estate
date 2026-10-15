import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Edit, Trash2, Star, CheckCircle, MessageSquare } from 'lucide-react';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { Modal } from '../../components/common/Modal';
import { SEOHead } from '../../components/common/SEOHead';
import { Testimonial } from '../../types';
import { getTestimonials, saveTestimonial, deleteTestimonial } from '../../services/store';
import { useToast } from '../../context/ToastContext';

export const AdminTestimonialsPage: React.FC = () => {
  const { openMobileSidebar } = useOutletContext<{ openMobileSidebar: () => void }>();
  const { showToast } = useToast();

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [location, setLocation] = useState('Bahria Town Lahore');
  const [role, setRole] = useState('Homeowner');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  const loadData = () => {
    setLoading(true);
    getTestimonials()
      .then((data) => setTestimonials(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setName('');
    setLocation('Bahria Town Lahore');
    setRole('Client');
    setRating(5);
    setComment('');
    setIsPublished(true);
    setModalOpen(true);
  };

  const openEditModal = (item: Testimonial) => {
    setEditingItem(item);
    setName(item.name);
    setLocation(item.location);
    setRole(item.role);
    setRating(item.rating);
    setComment(item.comment);
    setIsPublished(item.is_published !== false);
    setModalOpen(true);
  };

  const handleDelete = async (id: string, clientName: string) => {
    if (window.confirm(`Delete testimonial from ${clientName}?`)) {
      await deleteTestimonial(id);
      showToast('Testimonial Removed', 'Client feedback deleted.', 'info');
      loadData();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    await saveTestimonial({
      id: editingItem?.id,
      name: name.trim(),
      location: location.trim(),
      role: role.trim(),
      rating: Number(rating),
      comment: comment.trim(),
      is_published: isPublished,
    });

    showToast(
      editingItem ? 'Testimonial Updated' : 'Testimonial Added',
      'Client review saved successfully.',
      'success'
    );
    setModalOpen(false);
    loadData();
  };

  return (
    <div className="flex-1 pb-16">
      <SEOHead title="Testimonials Management | Admin" />

      <AdminHeader
        title="Customer Testimonials"
        subtitle="Manage verified reviews and client statements (Starts empty - Add genuine feedback)"
        onOpenMobileMenu={openMobileSidebar}
        actionButton={
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Testimonial</span>
          </button>
        }
      />

      <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
        {loading ? (
          <p className="py-12 text-center text-slate-400">Loading testimonials...</p>
        ) : testimonials.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center max-w-lg mx-auto">
            <MessageSquare className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">
              No testimonials available yet.
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              In accordance with business requirements, fake testimonials are not created. Add authentic client feedback here as received.
            </p>
            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl"
            >
              + Add First Testimonial
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
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

                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "{item.comment}"
                  </p>

                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{item.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {item.role} • {item.location}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.name)}
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
        title={editingItem ? 'Edit Testimonial' : 'Add Client Testimonial'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Client Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Role / Property Context
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Buyer / Tenant"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bahria Town Sector C"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Star Rating (1 to 5)
            </label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
            >
              <option value={5}>5 Stars - Excellent</option>
              <option value={4}>4 Stars - Very Good</option>
              <option value={3}>3 Stars - Good</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Client Feedback / Statement *
            </label>
            <textarea
              rows={4}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 rounded text-slate-900"
            />
            <span>Publish Testimonial on Public Website</span>
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
              Save Testimonial
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
