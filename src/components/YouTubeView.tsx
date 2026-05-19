import { useState } from 'react';
import { mockChannels, calcTrend } from '../mockData';
import { useRange } from '../App';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Eye, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { FaYoutube } from 'react-icons/fa6';
import InsightBanner from './InsightBanner';

// ── helpers ──────────────────────────────────────────────────────────────────

function sliceByRange(metrics: { month: string }[], range: string) {
  if (range === '3mo') return metrics.slice(-3);
  if (range === '6mo') return metrics.slice(-6);
  return metrics;
}

// ── component ─────────────────────────────────────────────────────────────────

export default function YouTubeView() {
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const { range } = useRange();

  // Build chart data respecting both the channel filter AND the date range
  const baseMetrics = sliceByRange(mockChannels[0].metrics, range);

  const chartData = baseMetrics.map((m, idx) => {
    const absoluteIdx = mockChannels[0].metrics.length - baseMetrics.length + idx;
    if (selectedChannel === 'all') {
      return {
        month: m.month,
        views: mockChannels.reduce((sum, ch) => sum + ch.metrics[absoluteIdx].views, 0),
        revenue: mockChannels.reduce((sum, ch) => sum + ch.metrics[absoluteIdx].revenue, 0),
      };
    }
    const ch = mockChannels.find((c) => c.id === selectedChannel)!;
    return {
      month: m.month,
      views: ch.metrics[absoluteIdx].views,
      revenue: ch.metrics[absoluteIdx].revenue,
    };
  });

  const totalViews   = chartData.reduce((sum, d) => sum + d.views, 0);
  const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);

  const currentMonth = chartData[chartData.length - 1];
  const prevMonth    = chartData[chartData.length - 2];

  const viewsTrend = calcTrend(currentMonth.views,   prevMonth.views);
  const revTrend   = calcTrend(currentMonth.revenue, prevMonth.revenue);

  // Per-channel summary for the latest month (always shows all channels)
  const latestIdx = mockChannels[0].metrics.length - 1;
  const channelRows = mockChannels.map((ch) => ({
    name:       ch.name,
    subscribers: ch.subscribers,
    views:      ch.metrics[latestIdx].views,
    revenue:    ch.metrics[latestIdx].revenue,
    viewsTrend: calcTrend(ch.metrics[latestIdx].views,   ch.metrics[latestIdx - 1].views),
    revTrend:   calcTrend(ch.metrics[latestIdx].revenue, ch.metrics[latestIdx - 1].revenue),
  }));

  const generateInsightText = () => {
    if (viewsTrend > 0 && revTrend < 0)
      return `Audience reach grew by ${viewsTrend}%, but AdSense dropped by ${Math.abs(revTrend)}%. This divergence suggests a drop in average view duration or lower RPMs. Consider optimising mid-roll ad placements.`;
    if (viewsTrend < 0 && revTrend > 0)
      return `Viewership dipped by ${Math.abs(viewsTrend)}%, yet revenue increased by ${revTrend}%. You are successfully monetising a smaller but highly engaged core audience.`;
    if (viewsTrend < 0 && revTrend < 0)
      return `Alert: Both audience reach (${viewsTrend}%) and ad revenue (${revTrend}%) have contracted. A strategic review of recent upload thumbnails and retention graphs is highly recommended.`;
    return `Channel momentum is strong. Both viewership and AdSense revenue are scaling positively. Keep executing the current content strategy.`;
  };

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
            <FaYoutube className="text-red-500 w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" /> YouTube Performance
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Analyse channel growth and AdSense earnings.
          </p>
        </div>
        <select
          value={selectedChannel}
          onChange={(e) => setSelectedChannel(e.target.value)}
          className="w-full sm:w-auto bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer font-medium transition-all"
        >
          <option value="all">All Channels Blended</option>
          {mockChannels.map((ch) => (
            <option key={ch.id} value={ch.id}>{ch.name}</option>
          ))}
        </select>
      </div>

      {/* ── Insight banner ─────────────────────────────────────────────── */}
      <InsightBanner title="Audience Analysis" insightText={generateInsightText()} theme="red" />

      {/* ── KPI cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <KpiCard
          icon={<Eye className="w-7 h-7" />}
          iconBg="bg-red-50 dark:bg-red-500/10 text-red-500"
          label="Total Views"
          value={totalViews.toLocaleString()}
          trend={viewsTrend}
        />
        <KpiCard
          icon={<DollarSign className="w-7 h-7" />}
          iconBg="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500"
          label="Estimated Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          trend={revTrend}
        />
      </div>

      {/* ── Charts ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Audience bar chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Audience Growth</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.2} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  formatter={(value) => [Number(value).toLocaleString(), 'Views']}
                />
                <Bar dataKey="views" fill="#ef4444" radius={[6, 6, 0, 0]} animationDuration={400} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue area chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Revenue Timeline</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevYT" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.2} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  formatter={(value) => [`$${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevYT)" animationDuration={400} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Per-channel breakdown table ─────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Channel Breakdown — Latest Month</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50">
                <th className="px-6 py-3">Channel</th>
                <th className="px-6 py-3">Subscribers</th>
                <th className="px-6 py-3">Views</th>
                <th className="px-6 py-3">MoM</th>
                <th className="px-6 py-3">Revenue</th>
                <th className="px-6 py-3">MoM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {channelRows.map((row) => (
                <tr key={row.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                    <FaYoutube className="text-red-500 w-4 h-4" />
                    {row.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{row.subscribers.toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{row.views.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <TrendBadge value={row.viewsTrend} />
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">${row.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <TrendBadge value={row.revTrend} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({
  icon, iconBg, label, value, trend,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  trend: number;
}) {
  const up = trend >= 0;
  return (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between transition-colors hover:shadow-md gap-3">
      <div className="flex items-center gap-3 sm:gap-5 min-w-0">
        <div className={`p-3 sm:p-4 rounded-xl flex-shrink-0 ${iconBg}`}>{icon}</div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white tracking-tight truncate">{value}</p>
        </div>
      </div>
      <div className={`flex flex-col items-end flex-shrink-0 ${up ? 'text-emerald-500' : 'text-red-500'}`}>
        <div className="flex items-center gap-1 font-bold">
          {up ? <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />}
          <span className="text-sm sm:text-base">{Math.abs(trend)}%</span>
        </div>
        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">vs last month</span>
      </div>
    </div>
  );
}

function TrendBadge({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
      up ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
         : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
    }`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {Math.abs(value)}%
    </span>
  );
}