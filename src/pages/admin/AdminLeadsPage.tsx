import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Search,
  Phone,
  MessageCircle,
  FileText,
  ExternalLink,
  Plus,
  User,
  Clock,
  Send,
  MessageSquare,
  CheckCircle,
} from 'lucide-react';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { LeadStatusBadge } from '../../components/admin/LeadStatusBadge';
import { Modal } from '../../components/common/Modal';
import { SEOHead } from '../../components/common/SEOHead';
import { Inquiry, InquiryStatus } from '../../types';
import { getInquiries, updateInquiryStatus, addInquiryNote } from '../../services/store';
import { formatDate } from '../../lib/formatters';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const STATUS_LIST: InquiryStatus[] = [
  'New',
  'Contacted',
  'Qualified',
  'Viewing Scheduled',
  'Negotiation',
  'Closed',
  'Lost',
];

export const AdminLeadsPage: React.FC = () => {
  const { openMobileSidebar } = useOutletContext<{ openMobileSidebar: () => void }>();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sourceFilter, setSourceFilter] = useState<string>('All');

  // Notes Modal state
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [newNoteText, setNewNoteText] = useState('');

  const loadData = () => {
    setLoading(true);
    getInquiries()
      .then((data) => setInquiries(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (id: string, status: InquiryStatus) => {
    await updateInquiryStatus(id, status);
    showToast('Status Updated', `Lead status updated to ${status}.`, 'success');
    loadData();
    if (selectedInquiry && selectedInquiry.id === id) {
      setSelectedInquiry((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry || !newNoteText.trim()) return;

    const authorName = user?.full_name || 'Admin';
    await addInquiryNote(selectedInquiry.id, newNoteText.trim(), authorName);

    showToast('Note Added', 'Internal CRM note saved.', 'success');
    setNewNoteText('');
    loadData();

    // Update modal view
    setSelectedInquiry((prev) => {
      if (!prev) return null;
      const updatedNotes = [
        {
          id: `note-${Date.now()}`,
          inquiry_id: prev.id,
          author_name: authorName,
          note: newNoteText.trim(),
          created_at: new Date().toISOString(),
        },
        ...(prev.notes || []),
      ];
      return { ...prev, notes: updatedNotes };
    });
  };

  const filtered = inquiries.filter((inq) => {
    const q = search.toLowerCase();
    const matchesSearch =
      inq.name.toLowerCase().includes(q) ||
      inq.phone.includes(q) ||
      inq.email.toLowerCase().includes(q) ||
      (inq.property_code || '').toLowerCase().includes(q) ||
      (inq.agent_name || '').toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'All' || inq.status === statusFilter;
    const matchesSource = sourceFilter === 'All' || inq.source === sourceFilter;

    return matchesSearch && matchesStatus && matchesSource;
  });

  return (
    <div className="flex-1 pb-16">
      <SEOHead title="Lead Inquiries & CRM | Admin Portal" />

      <AdminHeader
        title="Lead Management & CRM"
        subtitle="Manage visitor inquiries, WhatsApp leads, schedule viewings, and record agent follow-up notes"
        onOpenMobileMenu={openMobileSidebar}
      />

      <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Filter Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search lead name, phone, code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              <option value="All">All Lead Statuses</option>
              {STATUS_LIST.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              <option value="All">All Sources</option>
              <option value="website">Website</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="phone">Phone Call</option>
              <option value="facebook">Facebook</option>
              <option value="google">Google</option>
            </select>

            <span className="text-xs text-slate-500 ml-auto font-semibold">
              {filtered.length} Leads Found
            </span>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">Lead Contact</th>
                  <th className="py-4 px-4">Property Ref</th>
                  <th className="py-4 px-4">Assigned Agent</th>
                  <th className="py-4 px-4">Source</th>
                  <th className="py-4 px-4">Current Status</th>
                  <th className="py-4 px-4">Received</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Loading inquiries...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No matching leads found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((inq) => {
                    const cleanPhone = inq.phone.replace(/[^0-9]/g, '');
                    return (
                      <tr key={inq.id} className="hover:bg-slate-50/70 transition">
                        {/* Contact details */}
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{inq.name}</p>
                            <p className="text-[11px] text-slate-600 font-mono">{inq.phone}</p>
                            <p className="text-[11px] text-slate-400">{inq.email}</p>
                          </div>
                        </td>

                        {/* Property code */}
                        <td className="py-4 px-4">
                          {inq.property_code ? (
                            <Link
                              to={`/properties/${inq.property_id}`}
                              target="_blank"
                              className="font-mono font-bold text-amber-700 hover:underline flex items-center gap-1"
                            >
                              <span>{inq.property_code}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </Link>
                          ) : (
                            <span className="text-slate-400">General</span>
                          )}
                          <p className="text-[11px] text-slate-500 truncate max-w-[180px]">
                            {inq.property_title}
                          </p>
                        </td>

                        {/* Agent */}
                        <td className="py-4 px-4 font-medium text-slate-700">
                          {inq.agent_name || 'General Desk'}
                        </td>

                        {/* Source */}
                        <td className="py-4 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold uppercase text-slate-600">
                            {inq.source}
                          </span>
                        </td>

                        {/* Status Dropdown */}
                        <td className="py-4 px-4">
                          <select
                            value={inq.status}
                            onChange={(e) =>
                              handleStatusChange(inq.id, e.target.value as InquiryStatus)
                            }
                            className="px-2 py-1 rounded-lg text-xs font-bold border border-slate-200 bg-white"
                          >
                            {STATUS_LIST.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Date */}
                        <td className="py-4 px-4 text-slate-400 text-[11px]">
                          {formatDate(inq.created_at)}
                        </td>

                        {/* Action buttons */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Call */}
                            <a
                              href={`tel:${cleanPhone}`}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
                              title={`Call ${inq.name}`}
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>

                            {/* WhatsApp */}
                            <a
                              href={`https://wa.me/${cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(
                                `Assalam-o-Alaikum ${inq.name}, thank you for inquiring about ${inq.property_code || 'our listings'}. How can we assist you today?`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition"
                              title={`Open WhatsApp Chat with ${inq.name}`}
                            >
                              <MessageCircle className="w-3.5 h-3.5 fill-current" />
                            </a>

                            {/* Notes Modal Button */}
                            <button
                              onClick={() => setSelectedInquiry(inq)}
                              className="p-1.5 rounded-lg bg-[#0B192C] text-amber-400 hover:bg-[#1E3E62] transition relative"
                              title="View & Add CRM Notes"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              {inq.notes && inq.notes.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-bold flex items-center justify-center">
                                  {inq.notes.length}
                                </span>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CRM Notes & Inquiry Detail Modal */}
      {selectedInquiry && (
        <Modal
          isOpen={Boolean(selectedInquiry)}
          onClose={() => setSelectedInquiry(null)}
          title={`Lead CRM Record: ${selectedInquiry.name}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Lead Brief */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-slate-900 text-sm">
                  {selectedInquiry.name}
                </span>
                <LeadStatusBadge status={selectedInquiry.status} />
              </div>
              <p className="text-slate-600">
                <strong>Contact:</strong> {selectedInquiry.phone} • {selectedInquiry.email}
              </p>
              <p className="text-slate-600">
                <strong>Inquired Property:</strong>{' '}
                <span className="font-mono font-bold text-amber-700">
                  {selectedInquiry.property_code || 'General'}
                </span>{' '}
                ({selectedInquiry.property_title})
              </p>
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700 italic">
                "{selectedInquiry.message}"
              </div>
            </div>

            {/* Quick WhatsApp / Call actions */}
            <div className="flex gap-2">
              <a
                href={`tel:${selectedInquiry.phone}`}
                className="flex-1 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold text-center flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Call Client</span>
              </a>
              <a
                href={`https://wa.me/${selectedInquiry.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold text-center flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>Open WhatsApp</span>
              </a>
            </div>

            {/* Add New Note Form */}
            <form onSubmit={handleAddNote} className="space-y-2 pt-2 border-t border-slate-200">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Add Agent Follow-up Note
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="e.g. Spoke with client. Arranging physical site tour for Saturday at 3 PM..."
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition"
                >
                  Save Note
                </button>
              </div>
            </form>

            {/* Existing Notes Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Activity & Follow-Up Log ({selectedInquiry.notes?.length || 0})
              </h4>

              {selectedInquiry.notes && selectedInquiry.notes.length > 0 ? (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedInquiry.notes.map((n) => (
                    <div
                      key={n.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <span className="font-bold text-slate-700">{n.author_name}</span>
                        <span>{formatDate(n.created_at)}</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed">{n.note}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No notes recorded yet for this lead.
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
