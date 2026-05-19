import { useState } from 'react';
import { mockStores, calcTrend } from '../mockData';
import { useRange } from '../App';
import {
  Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, ComposedChart,
} from 'recharts';
import { ShoppingBag, ShoppingCart, DollarSign, Percent, TrendingUp, TrendingDown } from 'lucide-react';
import InsightBanner from './InsightBanner';

// ── helpers ───────────────────────────────────────────────────────────────────

function sliceByRange(metrics: { month: string }[], range: string) {
  if (range === '3mo') return metrics.slice(-3);
  if (range === '6mo') return metrics.slice(-6);
  return metrics;
}

// ── component ─────────────────────────────────────────────────────────────────

export default function WebStoreView() {
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const { range } = useRange();

  const baseMetrics = sliceByRange(mockStores[0].metrics, range);

  const chartData = baseMetrics.map((m, idx) => {
    const absoluteIdx = mockStores[0].metrics.length - baseMetrics.length + idx;
    if (selectedStore === 'all') {
      const totalUnits = mockStores.reduce((sum, st) => sum + st.metrics[absoluteIdx].unitsSold, 0);
      const totalRev   = mockStores.reduce((sum, st) => sum + st.metrics[absoluteIdx].revenue, 0);
      const avgConv    = mockStores.reduce((sum, st) => sum + st.metrics[absoluteIdx].conversionRate, 0) / mockStores.length;
      return { month: m.month, unitsSold: totalUnits, revenue: totalRev, conversionRate: parseFloat(avgConv.toFixed(2)) };
    }
    const st = mockStores.find((s) => s.id === selectedStore)!;
    return {
      month: m.month,
      unitsSold: st.metrics[absoluteIdx].unitsSold,
      revenue:   st.metrics[absoluteIdx].revenue,
      conversionRate: st.metrics[absoluteIdx].conversionRate,
    };
  });

  const currentMonth = chartData[chartData.length - 1];
  const prevMonth    = chartData[chartData.length - 2];

  const unitsTrend = calcTrend(currentMonth.unitsSold, prevMonth.unitsSold);
  const revTrend   = calcTrend(currentMonth.revenue,   prevMonth.revenue);
  // Conversion rate delta is expressed in percentage points (pp), not relative %
  const convDelta  = parseFloat((currentMonth.conversionRate - prevMonth.conversionRate).toFixed(2));

  const totalUnits    = chartData.reduce((sum, d) => sum + d.unitsSold, 0);
  const totalRevenue  = chartData.reduce((sum, d) => sum + d.revenue, 0);
  const avgConversion = parseFloat(
    (chartData.reduce((sum, d) => sum + d.conversionRate, 0) / chartData.length).toFixed(2),
  );

  // Per-store summary for the latest month
  const latestIdx = mockStores[0].metrics.length - 1;
  const storeRows = mockStores.map((st) => ({
    name:       st.name,
    units:      st.metrics[latestIdx].unitsSold,
    revenue:    st.metrics[latestIdx].revenue,
    conv:       st.metrics[latestIdx].conversionRate,
    unitsTrend: calcTrend(st.metrics[latestIdx].unitsSold,      st.metrics[latestIdx - 1].unitsSold),
    revTrend:   calcTrend(st.metrics[latestIdx].revenue,        st.metrics[latestIdx - 1].revenue),
    convDelta:  parseFloat((st.metrics[latestIdx].conversionRate - st.metrics[latestIdx - 1].conversionRate).toFixed(2)),
  }));

  const generateInsightText = () => {
    if (revTrend < 0 && convDelta > 0)
      return `Revenue dropped by ${Math.abs(revTrend)}%, but conversion rate actually improved by ${convDelta}pp. This indicates a drop in top-of-funnel traffic, not product desirability.`;
    if (revTrend < 0 && convDelta < 0)
      return `Alert: Both revenue (${revTrend}%) and conversions (${convDelta}pp) are down. Review recent UI changes or out-of-stock items immediately.`;
    return `Storefront is healthy. Revenue increased by ${revTrend}% MoM, with a conversion rate shift of ${convDelta > 0 ? '+' : ''}${convDelta}pp.`;
  };

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
            <ShoppingBag className="text-indigo-500 w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" /> Web Store Metrics
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track purchase conversions and merchandise storefronts.
          </p>
        </div>
        <select
          value={selectedStore}
          onChange={(e) => setSelectedStore(e.target.value)}
          className="w-full sm:w-auto bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer font-medium transition-all"
        >
          <option value="all">All Stores Combined</option>
          {mockStores.map((st) => (
            <option key={st.id} value={st.id}>{st.name}</option>
          ))}
        </select>
      </div>

      {/* ── Insight banner ─────────────────────────────────────────────── */}
      <InsightBanner title="Storefront Analysis" insightText={generateInsightText()} theme="indigo" />

      {/* ── KPI cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard
          icon={<ShoppingCart className="w-6 h-6" />}
          iconBg="bg-blue-50 dark:bg-blue-500/10 text-blue-500"
          label="Units Sold"
          value={totalUnits.toLocaleString()}
          trend={unitsTrend}
          trendSuffix="%"
        />
        <KpiCard
          icon={<DollarSign className="w-6 h-6" />}
          iconBg="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500"
          label="Store Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          trend={revTrend}
          trendSuffix="%"
        />
        <KpiCard
          icon={<Percent className="w-6 h-6" />}
          iconBg="bg-amber-50 dark:bg-amber-500/10 text-amber-500"
          label="Avg. Conversion"
          value={`${avgConversion}%`}
          trend={convDelta}
          trendSuffix="pp"
          trendLabel="pp vs last month"
        />
      </div>

      {/* ── Charts ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Revenue + Units — dual Y-axis */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Revenue & Units Overview</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-5">Left axis: Revenue ($) · Right axis: Units sold</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.2} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  yAxisId="rev"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v / 1000}k`}
                />
                <YAxis
                  yAxisId="units"
                  orientation="right"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  formatter={(value, name) =>
                    name === 'revenue'
                      ? [`$${Number(value).toLocaleString()}`, 'Revenue']
                      : [Number(value).toLocaleString(), 'Units Sold']
                  }
                />
                <Bar yAxisId="rev"   dataKey="revenue"   fill="#6366f1" radius={[6, 6, 0, 0]} name="revenue"   animationDuration={400} />
                <Bar yAxisId="units" dataKey="unitsSold" fill="#94a3b8" radius={[6, 6, 0, 0]} name="unitsSold" animationDuration={400} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion rate line chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Conversion Rate Timeline</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-5">Percentage of visitors who made a purchase (%)</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.2} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  formatter={(value) => [`${value}%`, 'Conversion Rate']}
                />
                <Line
                  type="monotone"
                  dataKey="conversionRate"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#f59e0b', strokeWidth: 0 }}
                  activeDot={{ r: 7 }}
                  animationDuration={400}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Per-store breakdown table ───────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Store Breakdown — Latest Month</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50">
                <th className="px-6 py-3">Store</th>
                <th className="px-6 py-3">Units Sold</th>
                <th className="px-6 py-3">MoM</th>
                <th className="px-6 py-3">Revenue</th>
                <th className="px-6 py-3">MoM</th>
                <th className="px-6 py-3">Conv. Rate</th>
                <th className="px-6 py-3">Δ (pp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {storeRows.map((row) => (
                <tr key={row.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                    <ShoppingBag className="text-indigo-400 w-4 h-4" />
                    {row.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{row.units.toLocaleString()}</td>
                  <td className="px-6 py-4"><TrendBadge value={row.unitsTrend} suffix="%" /></td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">${row.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4"><TrendBadge value={row.revTrend} suffix="%" /></td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{row.conv}%</td>
                  <td className="px-6 py-4"><TrendBadge value={row.convDelta} suffix="pp" /></td>
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
  icon, iconBg, label, value, trend, trendSuffix = '%', trendLabel,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  trend: number;
  trendSuffix?: string;
  trendLabel?: string;
}) {
  const up = trend >= 0;
  return (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between transition-colors gap-3">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <div className={`p-2.5 sm:p-3 rounded-xl flex-shrink-0 ${iconBg}`}>{icon}</div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white truncate">{value}</p>
        </div>
      </div>
      <div className={`flex flex-col items-end flex-shrink-0 text-sm font-bold ${up ? 'text-emerald-500' : 'text-red-500'}`}>
        {up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        <span>{up ? '+' : ''}{trend}{trendSuffix}</span>
        <span className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
          {trendLabel ?? 'vs last month'}
        </span>
      </div>
    </div>
  );
}

function TrendBadge({ value, suffix = '%' }: { value: number; suffix?: string }) {
  const up = value >= 0;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
      up ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
         : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
    }`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {up ? '+' : ''}{Math.abs(value)}{suffix}
    </span>
  );
}