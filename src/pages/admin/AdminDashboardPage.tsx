import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Building,
  CheckCircle,
  Inbox,
  Users,
  TrendingUp,
  ArrowUpRight,
  ExternalLink,
  Database,
  ShieldCheck,
} from 'lucide-react';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { StatCard } from '../../components/admin/StatCard';
import { LeadStatusBadge } from '../../components/admin/LeadStatusBadge';
import { SEOHead } from '../../components/common/SEOHead';
import { Property, Inquiry, Agent, InquiryStatus } from '../../types';
import { ADMIN_AUTHORIZED_EMAIL } from '../../lib/supabase';
import {
  getProperties,
  getInquiries,
  getAgents,
  getMonthlyPerformanceData,
  getAnalyticsSummary,
  calculateMoMTrend,
  MonthlyPerformanceRecord,
} from '../../services/store';
import { formatPricePKR, formatDate } from '../../lib/formatters';

const STATUS_PIPELINE_LIST: { label: InquiryStatus; color: string }[] = [
  { label: 'New', color: 'bg-blue-500' },
  { label: 'Contacted', color: 'bg-purple-500' },
  { label: 'Qualified', color: 'bg-amber-500' },
  { label: 'Viewing Scheduled', color: 'bg-indigo-500' },
  { label: 'Negotiation', color: 'bg-orange-500' },
  { label: 'Closed', color: 'bg-emerald-500' },
  { label: 'Lost', color: 'bg-slate-400' },
];

const DashboardPropertyThumbnail: React.FC<{ prop: Property }> = ({ prop }) => {
  const [failed, setFailed] = useState(false);
  const imgUrl =
    prop.images?.find((i) => i.is_primary && !i.public_url.startsWith('blob:'))?.public_url ||
    prop.images?.[0]?.public_url ||
    prop.cover_image;

  if (!imgUrl || failed || imgUrl.startsWith('blob:')) {
    return (
      <div className="w-12 h-12 rounded-xl bg-[#173C32]/10 border border-[#E4E6E1] flex items-center justify-center shrink-0 text-[#173C32]">
        <Building className="w-5 h-5 text-[#173C32]" />
      </div>
    );
  }

  return (
    <img
      src={imgUrl}
      alt=""
      onError={() => setFailed(true)}
      className="w-12 h-12 rounded-xl object-cover shrink-0 bg-black/5 border border-slate-200"
    />
  );
};

export const AdminDashboardPage: React.FC = () => {
  const { openMobileSidebar } = useOutletContext<{ openMobileSidebar: () => void }>();

  const [properties, setProperties] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [monthlyRecords, setMonthlyRecords] = useState<MonthlyPerformanceRecord[]>([]);
  const [hasChartData, setHasChartData] = useState(false);
  const [totalViewsCount, setTotalViewsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProperties({ limit: 1000 }),
      getInquiries(),
      getAgents(),
      getMonthlyPerformanceData(),
      getAnalyticsSummary(),
    ]).then(([propsRes, inqRes, agentsRes, monthlyRes, analyticsRes]) => {
      setProperties(propsRes.properties);
      setInquiries(inqRes);
      setAgents(agentsRes);
      setMonthlyRecords(monthlyRes.data);
      setHasChartData(monthlyRes.hasAnyData);
      setTotalViewsCount(analyticsRes.totalViews);
      setLoading(false);
    });
  }, []);

  const totalProperties = properties.length;
  const activeProperties = properties.filter((p) => p.status === 'Available' || p.status === 'Published').length;
  const soldProperties = properties.filter((p) => p.status === 'Sold').length;
  const rentedProperties = properties.filter((p) => p.status === 'Rented').length;

  const totalLeads = inquiries.length;
  const newLeads = inquiries.filter((i) => i.status === 'New').length;
  const activeAgents = agents.filter((a) => a.is_active).length;

  // Real MoM calculation for properties
  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;

  const propsCurr30 = properties.filter((p) => {
    const t = new Date(p.created_at).getTime();
    return !isNaN(t) && now - t <= thirtyDaysMs;
  }).length;
  const propsPrev30 = properties.filter((p) => {
    const t = new Date(p.created_at).getTime();
    return !isNaN(t) && now - t > thirtyDaysMs && now - t <= sixtyDaysMs;
  }).length;
  const propertiesTrend = calculateMoMTrend(propsCurr30, propsPrev30);

  // Real MoM calculation for leads
  const inqsCurr30 = inquiries.filter((i) => {
    const t = new Date(i.created_at).getTime();
    return !isNaN(t) && now - t <= thirtyDaysMs;
  }).length;
  const inqsPrev30 = inquiries.filter((i) => {
    const t = new Date(i.created_at).getTime();
    return !isNaN(t) && now - t > thirtyDaysMs && now - t <= sixtyDaysMs;
  }).length;
  const leadsTrend = calculateMoMTrend(inqsCurr30, inqsPrev30);

  // Lead status pipeline counts calculated directly from real inquiries
  const leadStatuses = STATUS_PIPELINE_LIST.map((st) => ({
    label: st.label,
    count: inquiries.filter((i) => i.status === st.label).length,
    color: st.color,
  }));

  // Max value in chart for bar scaling
  const maxBarValue = Math.max(
    ...monthlyRecords.map((m) => Math.max(m.inquiries, m.listings)),
    1
  );

  const formatTrend = (trend: number | null): { value: string; positive: boolean } | null => {
    if (trend === null) return null;
    return {
      value: `${Math.abs(trend)}%`,
      positive: trend >= 0,
    };
  };

  return (
    <div className="flex-1 pb-16">
      <SEOHead title="Agency Dashboard | Admin Portal" />

      <AdminHeader
        title="Agency Executive Dashboard"
        subtitle="Pakistan Real Estate Operational KPIs, Listing Pipeline & Leads CRM"
        onOpenMobileMenu={openMobileSidebar}
      />

      <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Supabase Live Synchronization Status Bar */}
        <div className="bg-white rounded-2xl border border-[#E4E6E1] p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#173C32]/8 text-[#173C32] flex items-center justify-center font-bold shrink-0">
              <Database className="w-5 h-5 text-[#173C32]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#171A18]">
                  Supabase Live Database Connected
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-[11px] text-[#66706A]">
                Authorized Administrator: <strong className="text-[#171A18] font-mono">{ADMIN_AUTHORIZED_EMAIL}</strong> • Project: <span className="font-mono text-[#171A18]">lsbfglbtcywwpsqetfzx</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/settings"
              className="px-3 py-1.5 rounded-xl border border-[#E4E6E1] hover:bg-black/5 text-[#171A18] text-xs font-bold transition flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#B89B5E]" />
              <span>Database & Schema Settings</span>
            </Link>
          </div>
        </div>

        {/* Top Stat Cards - 100% Real Supabase Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Total Properties"
            value={totalProperties}
            subtitle={`${activeProperties} active listings`}
            icon={<Building className="w-5 h-5 text-amber-500" />}
            trend={formatTrend(propertiesTrend)}
            noHistoryText="— No previous-period data"
          />

          <StatCard
            title="Total Leads"
            value={totalLeads}
            subtitle={`${newLeads} pending responses`}
            icon={<Inbox className="w-5 h-5 text-blue-500" />}
            trend={formatTrend(leadsTrend)}
            noHistoryText="— No previous-period data"
          />

          <StatCard
            title="Completed Deals"
            value={soldProperties + rentedProperties}
            subtitle={`${soldProperties} Sold · ${rentedProperties} Rented`}
            icon={<CheckCircle className="w-5 h-5 text-emerald-500" />}
            trend={null}
          />

          <StatCard
            title="Active Agents"
            value={activeAgents}
            subtitle={activeAgents > 0 ? `${activeAgents} verified consultant${activeAgents === 1 ? '' : 's'}` : 'No consultants added yet'}
            icon={<Users className="w-5 h-5 text-purple-500" />}
            trend={null}
          />
        </div>

        {/* Charts & Lead Pipeline Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Monthly Activity Chart (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-[#E4E6E1] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4E6E1] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#171A18]">
                  Monthly Performance Trends (Past 6 Months)
                </h3>
                <p className="text-xs text-[#66706A]">Inquiries, New Listings, and Portal Views</p>
              </div>

              {hasChartData && (
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-[#66706A]">
                    <span className="w-3 h-3 rounded bg-[#B89B5E]" />
                    Inquiries
                  </span>
                  <span className="flex items-center gap-1.5 text-[#66706A]">
                    <span className="w-3 h-3 rounded bg-[#173C32]" />
                    New Listings
                  </span>
                </div>
              )}
            </div>

            {/* Visual Bar Chart or Clean Empty State */}
            {hasChartData ? (
              <div className="h-64 flex items-end justify-between gap-4 pt-4 px-2">
                {monthlyRecords.map((d) => (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1.5 h-full">
                      {/* Inquiries bar */}
                      <div
                        style={{ height: `${d.inquiries > 0 ? (d.inquiries / maxBarValue) * 100 : 4}%` }}
                        className={`w-1/2 max-w-[28px] rounded-t-lg transition-all relative group/bar ${
                          d.inquiries > 0 ? 'bg-[#B89B5E] hover:bg-[#9f834a]' : 'bg-black/5'
                        }`}
                      >
                        {d.inquiries > 0 && (
                          <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#171A18] text-white text-[10px] font-bold rounded shadow-xs pointer-events-none transition whitespace-nowrap z-20">
                            {d.inquiries} inquiries
                          </div>
                        )}
                      </div>

                      {/* Listings bar */}
                      <div
                        style={{ height: `${d.listings > 0 ? (d.listings / maxBarValue) * 100 : 4}%` }}
                        className={`w-1/2 max-w-[28px] rounded-t-lg transition-all relative group/bar2 ${
                          d.listings > 0 ? 'bg-[#173C32] hover:bg-[#0F2D25]' : 'bg-black/5'
                        }`}
                      >
                        {d.listings > 0 && (
                          <div className="opacity-0 group-hover/bar2:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#171A18] text-white text-[10px] font-bold rounded shadow-xs pointer-events-none transition whitespace-nowrap z-20">
                            {d.listings} listings
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="text-xs font-bold text-[#66706A]">{d.month}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-dashed border-[#E4E6E1]">
                <TrendingUp className="w-8 h-8 text-[#66706A] mb-2" />
                <p className="text-sm font-bold text-[#171A18]">No performance data available yet.</p>
                <p className="text-xs text-[#66706A] mt-1 max-w-sm">
                  Monthly inquiry, listing, and view performance charts will generate automatically as portal traffic and inquiries occur.
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#E4E6E1] text-center">
              <div>
                <p className="text-[11px] text-[#66706A] uppercase font-semibold">Total Inquiries</p>
                <p className="text-lg font-black text-[#171A18]">{totalLeads}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#66706A] uppercase font-semibold">Total Listings</p>
                <p className="text-lg font-black text-[#171A18]">{totalProperties}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#66706A] uppercase font-semibold">Total Views</p>
                <p className="text-lg font-black text-[#171A18]">{totalViewsCount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Lead Status Breakdown (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-[#E4E6E1] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-[#E4E6E1] pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#171A18]">Lead Status Pipeline</h3>
                <p className="text-xs text-[#66706A]">Current inquiry stage distribution</p>
              </div>
              <Link to="/admin/leads" className="text-xs font-bold text-[#173C32] hover:underline">
                View CRM →
              </Link>
            </div>

            <div className="space-y-4">
              {leadStatuses.map((st) => (
                <div key={st.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#171A18]">{st.label}</span>
                    <span className="text-[#171A18] font-bold">{st.count}</span>
                  </div>
                  <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${st.color}`}
                      style={{
                        width: `${totalLeads > 0 ? (st.count / totalLeads) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#E4E6E1]">
              <Link
                to="/admin/leads"
                className="w-full py-2.5 px-4 rounded-xl bg-transparent hover:bg-[#173C32] hover:text-white text-[#173C32] text-xs font-bold transition flex items-center justify-center gap-1.5 border border-[#173C32]"
              >
                <span>Manage All {totalLeads} Inquiries</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Inquiries & Recent Properties */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Inquiries */}
          <div className="bg-white rounded-3xl border border-[#E4E6E1] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E6E1]">
              <h3 className="text-base font-bold text-[#171A18] flex items-center gap-2">
                <Inbox className="w-4 h-4 text-[#173C32]" />
                <span>Recent Lead Inquiries</span>
              </h3>
              <Link to="/admin/leads" className="text-xs font-bold text-[#173C32] hover:underline">
                See All ({inquiries.length})
              </Link>
            </div>

            {inquiries.length > 0 ? (
              <div className="divide-y divide-[#E4E6E1]">
                {inquiries.slice(0, 5).map((inq) => (
                  <div key={inq.id} className="py-3 flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#171A18]">{inq.name}</span>
                        <LeadStatusBadge status={inq.status} size="sm" />
                      </div>
                      <p className="text-[11px] text-[#66706A] truncate">
                        {inq.property_code ? (
                          <>Ref: <strong className="text-[#173C32]">{inq.property_code}</strong> • </>
                        ) : null}
                        {inq.phone}
                      </p>
                      <p className="text-xs text-[#66706A] line-clamp-1 italic">
                        "{inq.message}"
                      </p>
                    </div>
                    <span className="text-[10px] text-[#66706A] shrink-0">
                      {formatDate(inq.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-xs text-[#66706A]">
                No inquiries received yet.
              </div>
            )}
          </div>

          {/* Recent Property Listings */}
          <div className="bg-white rounded-3xl border border-[#E4E6E1] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E6E1]">
              <h3 className="text-base font-bold text-[#171A18] flex items-center gap-2">
                <Building className="w-4 h-4 text-[#173C32]" />
                <span>Latest Property Listings</span>
              </h3>
              <Link to="/admin/properties" className="text-xs font-bold text-[#173C32] hover:underline">
                Manage All ({properties.length})
              </Link>
            </div>

            {properties.length > 0 ? (
              <div className="divide-y divide-[#E4E6E1]">
                {properties.slice(0, 5).map((prop) => (
                  <div key={prop.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <DashboardPropertyThumbnail prop={prop} />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#171A18] truncate">{prop.title}</p>
                        <p className="text-[11px] text-[#66706A]">
                          {prop.property_code} • {prop.city} •{' '}
                          <strong className="text-[#173C32]">{formatPricePKR(prop.price)}</strong>
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/admin/properties/${prop.id}/edit`}
                      className="px-3 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 text-[#171A18] text-[11px] font-bold shrink-0 transition"
                    >
                      Edit
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-xs text-[#66706A]">
                No properties listed yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
