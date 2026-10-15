import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Plus,
  Search,
  SlidersHorizontal,
  Edit,
  Copy,
  Trash2,
  CheckCircle,
  Eye,
  ExternalLink,
  Sparkles,
  ArrowUpDown,
  MoreVertical,
  Check,
  X,
  AlertTriangle,
  Loader2,
  Building,
} from 'lucide-react';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { SEOHead } from '../../components/common/SEOHead';
import { Modal } from '../../components/common/Modal';
import { Property, PropertyStatus, PurposeType } from '../../types';
import {
  getProperties,
  deleteProperty,
  duplicateProperty,
  saveProperty,
} from '../../services/store';
import { formatArea, formatPricePKR } from '../../lib/formatters';
import { useToast } from '../../context/ToastContext';

const PropertyRowThumbnail: React.FC<{ property: Property }> = ({ property }) => {
  const [failed, setFailed] = useState(false);
  const imageUrl =
    property.images?.find((img) => img.is_primary && !img.public_url.startsWith('blob:'))?.public_url ||
    property.images?.[0]?.public_url ||
    property.cover_image;

  const validUrl = imageUrl && !imageUrl.startsWith('blob:') ? imageUrl : null;

  if (!validUrl || failed) {
    return (
      <div className="w-12 h-12 rounded-xl bg-[#173C32]/10 border border-[#E4E6E1] flex items-center justify-center shrink-0 text-[#173C32]">
        <Building className="w-5 h-5 text-[#173C32]" />
      </div>
    );
  }

  return (
    <img
      src={validUrl}
      alt=""
      onError={() => setFailed(true)}
      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
    />
  );
};

export const AdminPropertiesPage: React.FC = () => {
  const { openMobileSidebar } = useOutletContext<{ openMobileSidebar: () => void }>();
  const { showToast } = useToast();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPurpose, setFilterPurpose] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterCity, setFilterCity] = useState<string>('All');

  // Delete Confirmation Modal State
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProperties = () => {
    setLoading(true);
    getProperties({ limit: 100 })
      .then((res) => setProperties(res.properties))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const confirmDelete = async () => {
    if (!propertyToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteProperty(propertyToDelete.id);
      if (res.success) {
        showToast(
          'Property Deleted',
          `Property ${propertyToDelete.property_code} was deleted successfully.`,
          'success'
        );
        setPropertyToDelete(null);
        loadProperties();
      } else {
        showToast(
          'Deletion Failed',
          res.error || 'Failed to delete property from database.',
          'error'
        );
      }
    } catch (err: any) {
      showToast('Deletion Error', err.message || 'An unexpected error occurred.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    const clone = await duplicateProperty(id);
    if (clone) {
      showToast('Property Duplicated', `Created copy ${clone.property_code}.`, 'success');
      loadProperties();
    }
  };

  const handleStatusChange = async (id: string, newStatus: PropertyStatus) => {
    await saveProperty({ id, status: newStatus });
    showToast('Status Updated', `Property marked as ${newStatus}.`, 'success');
    loadProperties();
  };

  const handleTogglePublished = async (id: string, current: boolean) => {
    await saveProperty({ id, is_published: !current });
    showToast(
      !current ? 'Listing Published' : 'Listing Unpublished',
      !current ? 'Now visible to public visitors.' : 'Hidden from public searches.',
      'info'
    );
    loadProperties();
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    await saveProperty({ id, is_featured: !current });
    showToast(
      !current ? 'Marked Featured' : 'Featured Removed',
      !current ? 'Pinned to homepage luxury showcase.' : 'Removed from featured spotlight.',
      'info'
    );
    loadProperties();
  };

  const filtered = properties.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.property_code.toLowerCase().includes(search.toLowerCase()) ||
      p.area.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase());

    const matchesPurpose = filterPurpose === 'All' || p.purpose === filterPurpose;
    const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
    const matchesCity = filterCity === 'All' || p.city === filterCity;

    return matchesSearch && matchesPurpose && matchesStatus && matchesCity;
  });

  return (
    <div className="flex-1 pb-16">
      <SEOHead title="Manage Property Inventory | Admin Portal" />

      <AdminHeader
        title="Property Inventory & Listings"
        subtitle="Create, edit, duplicate, and toggle published/sold status"
        onOpenMobileMenu={openMobileSidebar}
      />

      <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Filter Controls Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search title, ID, area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <select
              value={filterPurpose}
              onChange={(e) => setFilterPurpose(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              <option value="All">All Purposes</option>
              <option value="Sale">Sale Only</option>
              <option value="Rent">Rent Only</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Under Offer">Under Offer</option>
              <option value="Sold">Sold</option>
              <option value="Rented">Rented</option>
            </select>

            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              <option value="All">All Cities</option>
              <option value="Lahore">Lahore</option>
              <option value="Karachi">Karachi</option>
              <option value="Islamabad">Islamabad</option>
              <option value="Rawalpindi">Rawalpindi</option>
            </select>

            <Link
              to="/admin/properties/new"
              className="px-4 py-2 bg-[#0B192C] hover:bg-[#1E3E62] text-amber-400 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 ml-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Property</span>
            </Link>
          </div>
        </div>

        {/* Properties Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">Property / Title</th>
                  <th className="py-4 px-4">Code</th>
                  <th className="py-4 px-4">Purpose / Type</th>
                  <th className="py-4 px-4">Location</th>
                  <th className="py-4 px-4">Price (PKR)</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-center">Featured</th>
                  <th className="py-4 px-4 text-center">Public</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      Loading properties...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      No matching properties found in inventory.
                    </td>
                  </tr>
                ) : (
                  filtered.map((prop) => (
                    <tr key={prop.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <PropertyRowThumbnail property={prop} />
                          <div className="min-w-0 max-w-xs">
                            <Link
                              to={`/properties/${prop.slug}`}
                              target="_blank"
                              className="font-bold text-slate-900 hover:text-amber-600 truncate block"
                            >
                              {prop.title}
                            </Link>
                            <span className="text-[11px] text-slate-400">
                              {formatArea(prop.area_value, prop.area_unit)} • {prop.bedrooms} Bed
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-amber-700">
                        {prop.property_code}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            prop.purpose === 'Sale'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-sky-100 text-sky-900'
                          }`}
                        >
                          {prop.purpose}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">{prop.property_type}</p>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <p className="font-semibold text-slate-900">{prop.area}</p>
                        <p className="text-[11px] text-slate-400">{prop.city}</p>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                        {formatPricePKR(prop.price)}
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={prop.status}
                          onChange={(e) =>
                            handleStatusChange(prop.id, e.target.value as PropertyStatus)
                          }
                          className="px-2 py-1 rounded-lg text-xs font-semibold border border-slate-200 bg-white"
                        >
                          <option value="Available">Available</option>
                          <option value="Under Offer">Under Offer</option>
                          <option value="Sold">Sold</option>
                          <option value="Rented">Rented</option>
                          <option value="Archived">Archived</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleFeatured(prop.id, prop.is_featured)}
                          className={`p-1.5 rounded-lg transition ${
                            prop.is_featured
                              ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                              : 'text-slate-300 hover:text-slate-500'
                          }`}
                          title={prop.is_featured ? 'Remove featured' : 'Make featured'}
                        >
                          <Sparkles className="w-4 h-4 fill-current" />
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleTogglePublished(prop.id, prop.is_published)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            prop.is_published
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {prop.is_published ? 'Published' : 'Draft'}
                        </button>
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/admin/properties/${prop.id}/edit`}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
                            title="Edit Property"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => handleDuplicate(prop.id)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
                            title="Duplicate Listing"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setPropertyToDelete(prop)}
                            disabled={isDeleting && propertyToDelete?.id === prop.id}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:opacity-50"
                            title="Delete Listing"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {propertyToDelete && (
          <Modal
            isOpen={Boolean(propertyToDelete)}
            onClose={() => {
              if (!isDeleting) setPropertyToDelete(null);
            }}
            title="Confirm Property Deletion"
            maxWidth="md"
          >
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-900 leading-relaxed">
                  <p className="font-bold">Are you sure you want to permanently delete this property?</p>
                  <p className="mt-1 text-rose-700">
                    This action directly deletes the record from the Supabase database. It will immediately disappear from the public website, search results, and admin console.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Property Code:</span>
                  <span className="font-mono font-bold text-slate-900">{propertyToDelete.property_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Title:</span>
                  <span className="font-semibold text-slate-900 truncate max-w-xs">{propertyToDelete.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location:</span>
                  <span className="text-slate-700">{propertyToDelete.address || propertyToDelete.area}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Asking Price:</span>
                  <span className="font-bold text-[#173C32]">{formatPricePKR(propertyToDelete.price)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setPropertyToDelete(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Deleting from Database...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Permanently Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};
