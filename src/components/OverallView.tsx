import { useState } from 'react';
import InsightBanner from './InsightBanner';
import { mockChannels, mockStores } from '../mockData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { Layers, TrendingUp, TrendingDown } from 'lucide-react';

export default function OverallView() {
  const chartData = mockChannels[0].metrics.map((m, idx) => {
    const ytRev = mockChannels.reduce((sum, ch) => sum + ch.metrics[idx].revenue, 0);
    const storeRev = mockStores.reduce((sum, st) => sum + st.metrics[idx].revenue, 0);
    return {
      month: m.month,
      YouTube: ytRev,
      WebStore: storeRev,
      Total: ytRev + storeRev
    };
  });

  const availableMonths = chartData.map(d => d.month);
  
  const [selectedPieMonth, setSelectedPieMonth] = useState<string>(availableMonths[availableMonths.length - 1]);

  const currentMonth = chartData[chartData.length - 1];
  const prevMonth = chartData[chartData.length - 2];

  const calculateTrend = (current: number, prev: number) => {
    if (!prev) return 0;
    return Number((((current - prev) / prev) * 100).toFixed(1));
  };

  const totalYT = chartData.reduce((sum, d) => sum + d.YouTube, 0);
  const totalStore = chartData.reduce((sum, d) => sum + d.WebStore, 0);
  const grandTotal = totalYT + totalStore;
  
  const overallTrend = calculateTrend(currentMonth.Total, prevMonth.Total);

  const generateInsightText = () => {
    const ytTrend = calculateTrend(currentMonth.YouTube, prevMonth.YouTube);
    const storeTrend = calculateTrend(currentMonth.WebStore, prevMonth.WebStore);
    
    let text = `System Analysis for ${currentMonth.month}: Ecosystem revenue shifted by ${overallTrend > 0 ? '+' : ''}${overallTrend}% compared to last month. `;
    
    if (ytTrend < 0 && storeTrend > 0) {
      text += `YouTube AdSense experienced a contraction (${ytTrend}%), but this was offset by strong Web Store performance (${storeTrend}%). Recommend investigating content drop-off.`;
    } else if (ytTrend > 0 && storeTrend < 0) {
      text += `Media attention grew (${ytTrend}%), but Web Store conversions failed to capture the audience (${storeTrend}%). Check inventory or funnel friction.`;
    } else if (ytTrend < 0 && storeTrend < 0) {
      text += `CRITICAL: Both media and merchandise streams are trending downwards. Immediate strategy review required.`;
    } else {
      text += `Both media and merchandise streams show positive compounding growth. Current operational strategies are highly effective.`;
    }
    return text;
  };

  const activePieDataRaw = chartData.find(d => d.month === selectedPieMonth) || chartData[0];
  const pieData = [
    { name: 'YouTube', value: activePieDataRaw.YouTube, color: '#ef4444' }, 
    { name: 'WebStore', value: activePieDataRaw.WebStore, color: '#6366f1' } 
  ];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
          <Layers className="text-violet-500 w-7 h-7" /> Combined Ecosystem Overview
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Cross-platform synthesis mapping media attention directly to monetary return.</p>
      </div>

      <InsightBanner 
        title="Automated Insight" 
        insightText={generateInsightText()} 
        theme="violet" 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-6 rounded-2xl shadow-md text-white hover:shadow-lg transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20"><Layers className="w-24 h-24" /></div>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Gross Ecosystem Revenue</p>
          <p className="text-4xl font-extrabold mt-2 tracking-tight">${grandTotal.toLocaleString()}</p>
          <div className="mt-4 flex items-center gap-1 text-sm font-medium">
            {overallTrend >= 0 ? <TrendingUp className="w-4 h-4"/> : <TrendingDown className="w-4 h-4"/>}
            {Math.abs(overallTrend)}% MoM
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-center transition-colors">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">YouTube Contribution</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">${totalYT.toLocaleString()}</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-4">
            <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(totalYT/grandTotal)*100}%` }}></div>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-right">{((totalYT/grandTotal)*100).toFixed(1)}% of total</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-center transition-colors">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Web Store Contribution</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">${totalStore.toLocaleString()}</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-4">
            <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${(totalStore/grandTotal)*100}%` }}></div>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-right">{((totalStore/grandTotal)*100).toFixed(1)}% of total</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Stacked Streams Timeline ($)</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.2} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} formatter={(value) => [`$${Number(value).toLocaleString()}`]} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                {/* FAST ANIMATIONS ADDED HERE */}
                <Area type="monotone" dataKey="YouTube" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} animationDuration={400} />
                <Area type="monotone" dataKey="WebStore" stackId="1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} animationDuration={400} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Revenue Split</h3>
            <select
              value={selectedPieMonth}
              onChange={(e) => setSelectedPieMonth(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer font-medium text-sm transition-all"
            >
              {availableMonths.map(m => (
                <option key={m} value={m}>{m}</option> 
              ))}
            </select>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  animationDuration={300}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} 
                />
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}