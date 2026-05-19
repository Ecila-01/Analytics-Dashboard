import { useState } from 'react';
import { mockChannels } from '../mockData';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { FaYoutube } from 'react-icons/fa6';
import InsightBanner from './InsightBanner';

export default function YouTubeView() {
  const [selectedChannel, setSelectedChannel] = useState<string>('all');

  const chartData = mockChannels[0].metrics.map((m, idx) => {
    if (selectedChannel === 'all') {
      const totalViews = mockChannels.reduce((sum, ch) => sum + ch.metrics[idx].views, 0);
      const totalRev = mockChannels.reduce((sum, ch) => sum + ch.metrics[idx].revenue, 0);
      return { month: m.month, views: totalViews, revenue: totalRev };
    } else {
      const ch = mockChannels.find(c => c.id === selectedChannel);
      return { month: m.month, views: ch?.metrics[idx].views || 0, revenue: ch?.metrics[idx].revenue || 0 };
    }
  });

  const totalViews = chartData.reduce((sum, d) => sum + d.views, 0);
  const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);

  
  const currentMonth = chartData[chartData.length - 1];
  const prevMonth = chartData[chartData.length - 2];

  const calculateTrend = (current: number, prev: number) => {
    if (!prev) return 0;
    return (((current - prev) / prev) * 100).toFixed(1);
  };

  const viewsTrend = Number(calculateTrend(currentMonth.views, prevMonth.views));
  const revTrend = Number(calculateTrend(currentMonth.revenue, prevMonth.revenue));

  // --- YouTube Specific Insight Generator ---
  const generateInsightText = () => {
    if (viewsTrend > 0 && revTrend < 0) {
      return `Audience reach grew by ${viewsTrend}%, but AdSense dropped by ${Math.abs(revTrend)}%. This divergence suggests a drop in average view duration or lower RPMs. Consider optimizing mid-roll ad placements.`;
    }
    if (viewsTrend < 0 && revTrend > 0) {
      return `Viewership dipped by ${Math.abs(viewsTrend)}%, yet revenue increased by ${revTrend}%. You are successfully monetizing a smaller, but highly engaged core audience.`;
    }
    if (viewsTrend < 0 && revTrend < 0) {
      return `Alert: Both audience reach (${viewsTrend}%) and ad revenue (${revTrend}%) have contracted. A strategic review of recent upload thumbnails and retention graphs is highly recommended.`;
    }
    return `Channel momentum is strong. Both viewership and AdSense revenue are scaling positively. Keep executing the current content strategy.`;
  };

  return (
    <div className="space-y-6">
      
      {/* Header Context */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
            <FaYoutube className="text-red-500 w-7 h-7" /> YouTube Performance
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Analyze channel growth and AdSense earnings.</p>
        </div>
        <select
          value={selectedChannel}
          onChange={(e) => setSelectedChannel(e.target.value)}
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer font-medium transition-all"
        >
          <option value="all">All Channels Blended</option>
          {mockChannels.map(ch => (
            <option key={ch.id} value={ch.id}>{ch.name}</option>
          ))}
        </select>
      </div>

      {/* AI Insight Banner Component */}
      <InsightBanner 
        title="Audience Analysis" 
        insightText={generateInsightText()} 
        theme="red" 
      />

      {/* KPI Highlight Cards with Analytics Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between transition-colors hover:shadow-md">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-xl text-red-500"><Eye className="w-7 h-7" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Views</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{totalViews.toLocaleString()}</p>
            </div>
          </div>
          {/* Trend Indicator */}
          <div className={`flex flex-col items-end ${viewsTrend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            <div className="flex items-center gap-1 font-bold">
              {viewsTrend >= 0 ? <TrendingUp className="w-5 h-5"/> : <TrendingDown className="w-5 h-5"/>}
              {Math.abs(viewsTrend)}%
            </div>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">vs last month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between transition-colors hover:shadow-md">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-500"><DollarSign className="w-7 h-7" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Estimated Revenue</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
          {/* Trend Indicator */}
          <div className={`flex flex-col items-end ${revTrend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            <div className="flex items-center gap-1 font-bold">
              {revTrend >= 0 ? <TrendingUp className="w-5 h-5"/> : <TrendingDown className="w-5 h-5"/>}
              {Math.abs(revTrend)}%
            </div>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">vs last month</span>
          </div>
        </div>
      </div>

      {/* Upgraded Charts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Views Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Audience Growth</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.2} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  formatter={(value) => [Number(value).toLocaleString(), 'Views']} 
                />
                <Bar dataKey="views" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Area Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Revenue Timeline</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.2} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  formatter={(value) => [`$${value}`, 'Revenue']} 
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}