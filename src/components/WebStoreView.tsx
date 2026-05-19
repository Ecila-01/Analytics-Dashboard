import { useState } from 'react';
import { mockStores } from '../mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ShoppingBag, ShoppingCart, DollarSign, Percent, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import InsightBanner from './InsightBanner';

export default function WebStoreView() {
  const [selectedStore, setSelectedStore] = useState<string>('all');

  const chartData = mockStores[0].metrics.map((m, idx) => {
    if (selectedStore === 'all') {
      const totalUnits = mockStores.reduce((sum, st) => sum + st.metrics[idx].unitsSold, 0);
      const totalRev = mockStores.reduce((sum, st) => sum + st.metrics[idx].revenue, 0);
      const avgConv = mockStores.reduce((sum, st) => sum + st.metrics[idx].conversionRate, 0) / mockStores.length;
      return { month: m.month, unitsSold: totalUnits, revenue: totalRev, conversionRate: parseFloat(avgConv.toFixed(2)) };
    } else {
      const st = mockStores.find(s => s.id === selectedStore);
      return { month: m.month, unitsSold: st?.metrics[idx].unitsSold || 0, revenue: st?.metrics[idx].revenue || 0, conversionRate: st?.metrics[idx].conversionRate || 0 };
    }
  });

  const currentMonth = chartData[chartData.length - 1];
  const prevMonth = chartData[chartData.length - 2];

  const calculateTrend = (current: number, prev: number) => {
    if (!prev) return 0;
    return Number((((current - prev) / prev) * 100).toFixed(1));
  };

  const unitsTrend = calculateTrend(currentMonth.unitsSold, prevMonth.unitsSold);
  const revTrend = calculateTrend(currentMonth.revenue, prevMonth.revenue);
  const convTrend = Number((currentMonth.conversionRate - prevMonth.conversionRate).toFixed(2));

  const totalUnits = chartData.reduce((sum, d) => sum + d.unitsSold, 0);
  const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
  const avgConversion = parseFloat((chartData.reduce((sum, d) => sum + d.conversionRate, 0) / chartData.length).toFixed(2));

  const generateInsightText = () => {
    if (revTrend < 0 && convTrend > 0) return `Revenue dropped by ${Math.abs(revTrend)}%, but conversion rate actually improved by ${convTrend}%. This indicates a drop in top-of-funnel traffic, not product desirability.`;
    if (revTrend < 0 && convTrend < 0) return `Alert: Both revenue (${revTrend}%) and conversions (${convTrend}%) are down. Review recent UI changes or out-of-stock items immediately.`;
    return `Storefront is healthy. Revenue increased by ${revTrend}% MoM, with a conversion rate shift of ${convTrend > 0 ? '+' : ''}${convTrend}%.`;
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
            <ShoppingBag className="text-indigo-500 w-7 h-7" /> Web Store Metrics
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track purchase conversions and merchandise storefronts.</p>
        </div>
        <select
          value={selectedStore}
          onChange={(e) => setSelectedStore(e.target.value)}
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer font-medium transition-all"
        >
          <option value="all">All Stores Combined</option>
          {mockStores.map(st => (
            <option key={st.id} value={st.id}>{st.name}</option>
          ))}
        </select>
      </div>
      
      {/* Insight Banner */}
      <InsightBanner 
        title="Storefront Analysis" 
        insightText={generateInsightText()} 
        theme="indigo" 
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-500"><ShoppingCart className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Units Sold</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalUnits.toLocaleString()}</p>
            </div>
          </div>
          <div className={`flex flex-col items-end text-sm font-bold ${unitsTrend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {unitsTrend >= 0 ? <TrendingUp className="w-4 h-4"/> : <TrendingDown className="w-4 h-4"/>}
            {unitsTrend}%
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-500"><DollarSign className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Store Revenue</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
          <div className={`flex flex-col items-end text-sm font-bold ${revTrend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {revTrend >= 0 ? <TrendingUp className="w-4 h-4"/> : <TrendingDown className="w-4 h-4"/>}
            {revTrend}%
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-500"><Percent className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg. Conversion</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{avgConversion}%</p>
            </div>
          </div>
           <div className={`flex flex-col items-end text-sm font-bold ${convTrend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {convTrend >= 0 ? <TrendingUp className="w-4 h-4"/> : <TrendingDown className="w-4 h-4"/>}
            {convTrend}%
          </div>
        </div>
      </div>

      {/* Charts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Revenue & Units Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.2} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  formatter={(value, name) => [name === 'revenue' ? `$${Number(value).toLocaleString()}` : value, name === 'revenue' ? 'Revenue' : 'Units Sold']} 
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} name="revenue" />
                <Bar dataKey="unitsSold" fill="#94a3b8" radius={[6, 6, 0, 0]} name="unitsSold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Conversion Rate Timeline (%)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.2} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  formatter={(value) => [`${value}%`, 'Conversion Rate']} 
                />
                <Line type="monotone" dataKey="conversionRate" stroke="#f59e0b" strokeWidth={3} dot={{ r: 5, fill: '#f59e0b', strokeWidth: 0 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
}