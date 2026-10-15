import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit,
  UserCheck,
  UserX,
  Phone,
  MessageCircle,
  Mail,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { Modal } from '../../components/common/Modal';
import { SEOHead } from '../../components/common/SEOHead';
import { Agent } from '../../types';
import { getAgents, saveAgent } from '../../services/store';
import { useToast } from '../../context/ToastContext';

export const AdminAgentsPage: React.FC = () => {
  const { openMobileSidebar } = useOutletContext<{ openMobileSidebar: () => void }>();
  const { showToast } = useToast();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Agent Modal State (Create / Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState(5);
  const [areasInput, setAreasInput] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  const loadAgents = () => {
    setLoading(true);
    getAgents().then((data) => {
      setAgents(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const openCreateModal = () => {
    setEditingAgent(null);
    setName('');
    setEmail('');
    setPhone('+92 300 1234567');
    setWhatsapp('+92 300 1234567');
    setAvatarUrl('https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80');
    setTitle('Senior Property Consultant');
    setBio('Experienced real estate advisor specializing in luxury residential properties.');
    setExperienceYears(6);
    setAreasInput('DHA Lahore, Bahria Town, Gulberg');
    setLicenseNumber('PRA-LHR-' + Math.floor(1000 + Math.random() * 9000));
    setModalOpen(true);
  };

  const openEditModal = (ag: Agent) => {
    setEditingAgent(ag);
    setName(ag.name);
    setEmail(ag.email);
    setPhone(ag.phone);
    setWhatsapp(ag.whatsapp);
    setAvatarUrl(ag.avatar_url);
    setTitle(ag.title);
    setBio(ag.bio);
    setExperienceYears(ag.experience_years);
    setAreasInput(ag.areas_served.join(', '));
    setLicenseNumber(ag.license_number || '');
    setModalOpen(true);
  };

  const handleToggleActive = async (agent: Agent) => {
    await saveAgent({ id: agent.id, is_active: !agent.is_active });
    showToast(
      !agent.is_active ? 'Agent Activated' : 'Agent Deactivated',
      `${agent.name} is now ${!agent.is_active ? 'active' : 'inactive'}.`,
      'info'
    );
    loadAgents();
  };

  const handleSaveAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const areas = areasInput
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    await saveAgent({
      id: editingAgent?.id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || phone.trim(),
      avatar_url: avatarUrl.trim(),
      title: title.trim(),
      bio: bio.trim(),
      experience_years: Number(experienceYears),
      areas_served: areas,
      license_number: licenseNumber.trim(),
      is_active: editingAgent ? editingAgent.is_active : true,
    });

    showToast(
      editingAgent ? 'Agent Updated' : 'Agent Created',
      `${name} profile successfully updated.`,
      'success'
    );
    setModalOpen(false);
    loadAgents();
  };

  const filtered = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.phone.includes(search) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.areas_served.some((area) => area.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex-1 pb-16">
      <SEOHead title="Agent Management | Admin Portal" />

      <AdminHeader
        title="Agent Directory & Permissions"
        subtitle="Manage licensed property consultants, contact information, and territorial assignments"
        onOpenMobileMenu={openMobileSidebar}
        actionButton={
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B192C] hover:bg-[#1E3E62] text-amber-400 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Agent</span>
          </button>
        }
      />

      <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Search */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search agent name, phone, area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <span className="text-xs text-slate-500 font-semibold">
            {filtered.length} Registered Consultants
          </span>
        </div>

        {/* Agents Grid Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p className="col-span-3 text-center py-12 text-slate-400">Loading agents...</p>
          ) : (
            filtered.map((ag) => (
              <div
                key={ag.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                    <img
                      src={ag.avatar_url}
                      alt={ag.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 text-sm truncate">{ag.name}</h3>
                        <button
                          onClick={() => handleToggleActive(ag)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ag.is_active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {ag.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                      <p className="text-xs text-amber-600 font-semibold truncate">{ag.title}</p>
                      <p className="text-[10px] text-slate-400">{ag.experience_years}+ Years Experience</p>
                    </div>
                  </div>

                  <div className="space-y-2 py-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{ag.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{ag.whatsapp}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{ag.email}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Territories Served:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {ag.areas_served.map((area) => (
                        <span
                          key={area}
                          className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-700"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    to={`/agents/${ag.id}`}
                    target="_blank"
                    className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
                  >
                    View Public Page →
                  </Link>

                  <button
                    onClick={() => openEditModal(ag)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add / Edit Agent Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingAgent ? `Edit Consultant: ${editingAgent.name}` : 'Register New Agent'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveAgent} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Name *
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
                Designation / Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Experience (Years)
              </label>
              <input
                type="number"
                min="1"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Telephone *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                WhatsApp Desk *
              </label>
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                License / Registration
              </label>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Avatar Image URL
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Areas Served (Comma separated)
            </label>
            <input
              type="text"
              value={areasInput}
              onChange={(e) => setAreasInput(e.target.value)}
              placeholder="e.g. DHA Phase 5, Phase 6, Bahria Town..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Biography & Credentials
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

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
              className="px-5 py-2 bg-[#0B192C] text-amber-400 font-bold text-xs rounded-xl shadow-xs hover:bg-[#1E3E62]"
            >
              Save Consultant Profile
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
