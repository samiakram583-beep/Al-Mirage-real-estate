import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  BarChart3,
  Eye,
  MessageCircle,
  Phone,
  Heart,
  TrendingUp,
  MapPin,
  Inbox,
} from 'lucide-react';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { StatCard } from '../../components/admin/StatCard';
import { SEOHead } from '../../components/common/SEOHead';
import {
  getAnalyticsSummary,
  AnalyticsSummaryResult,
} from '../../services/store';

export const AdminAnalyticsPage: React.FC = () => {
  const { openMobileSidebar } = useOutletContext<{ openMobileSidebar: () => void }>();

  const [summary, setSummary] = useState<AnalyticsSummaryResult>({
    totalViews: 0,
    viewsTrend: null,
    totalInquiries: 0,
    inquiriesTrend: null,
    whatsappClicks: 0,
    whatsappTrend: null,
    phoneClicks: 0,
    favoriteSaves: 0,
    topSocieties: [],
    sourceBreakdown: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalyticsSummary()
      .then((res) => {
        setSummary(res);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 pb-16">
      <SEOHead title="Real Estate Analytics & Telemetry | Admin Portal" />

      <AdminHeader
        title="Real Estate Analytics & Telemetry"
        subtitle="Visitor interest, engagement conversions, WhatsApp click triggers, and regional activity"
        onOpenMobileMenu={openMobileSidebar}
      />

      <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
        {/* KPI Metrics - 100% Calculated from Real Database Events */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Property Views"
            value={summary.totalViews.toLocaleString()}
            icon={<Eye className="w-5 h-5 text-amber-500" />}
            trend={summary.viewsTrend}
            noHistoryText="— No previous-period data"
          />

          <StatCard
            title="Inquiry Leads"
            value={summary.totalInquiries}
            icon={<BarChart3 className="w-5 h-5 text-blue-500" />}
            trend={summary.inquiriesTrend}
            noHistoryText="— No previous-period data"
          />

          <StatCard
            title="WhatsApp Clicks"
            value={summary.whatsappClicks.toLocaleString()}
            icon={<MessageCircle className="w-5 h-5 text-emerald-500" />}
            trend={summary.whatsappTrend}
            noHistoryText="— No previous-period data"
          />

          <StatCard
            title="Call Dials"
            value={summary.phoneClicks.toLocaleString()}
            icon={<Phone className="w-5 h-5 text-purple-500" />}
            trend={null}
            noHistoryText="Live click telemetry"
          />

          <StatCard
            title="Saved Favorites"
            value={summary.favoriteSaves.toLocaleString()}
            icon={<Heart className="w-5 h-5 text-rose-500" />}
            trend={null}
            noHistoryText="User saved properties"
          />
        </div>

        {/* Breakdown Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Top Viewed Societies */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Top Demanded Societies by Visitor Traffic
              </h3>
              <p className="text-xs text-slate-500">Calculated directly from real property view events</p>
            </div>

            {summary.topSocieties.length > 0 ? (
              <div className="space-y-4">
                {summary.topSocieties.map((soc) => (
                  <div key={soc.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800">{soc.name}</span>
                      <span className="text-slate-500">
                        {soc.views.toLocaleString()} view{soc.views === 1 ? '' : 's'} ({soc.share})
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0B192C] rounded-full"
                        style={{ width: soc.share }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <MapPin className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-700">No property traffic data available yet.</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Visitor impressions grouped by housing societies will display here as visitors browse properties.
                </p>
              </div>
            )}
          </div>

          {/* Lead Source Breakdown */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Lead Inflow Channels</h3>
              <p className="text-xs text-slate-500">Calculated from actual submitted inquiries</p>
            </div>

            {summary.sourceBreakdown.length > 0 ? (
              <div className="space-y-4">
                {summary.sourceBreakdown.map((src) => (
                  <div
                    key={src.source}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-3 h-3 rounded-full ${src.color}`} />
                      <span className="text-xs font-bold text-slate-800">{src.source}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-900">{src.percent}%</span>
                      <span className="text-[10px] text-slate-400 block font-normal">
                        ({src.count} lead{src.count === 1 ? '' : 's'})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <Inbox className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-700">No lead source data available yet.</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Distribution of leads by channel (website, WhatsApp, phone, etc.) will populate as inquiries arrive.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
