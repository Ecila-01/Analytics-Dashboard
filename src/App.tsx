import { useState, useEffect, createContext, useContext } from 'react';
import OverallView from './components/OverallView';
import YouTubeView from './components/YouTubeView';
import WebStoreView from './components/WebStoreView';
import { Layers, ShoppingBag, TrendingUp, Moon, Sun } from 'lucide-react';
import { FaYoutube } from 'react-icons/fa6';
import { motion, AnimatePresence } from 'framer-motion';
import { mockChannels } from './mockData';

// ── Date-range context (shared across all views) ────────────────────────────
export type RangeOption = '3mo' | '6mo' | 'all';
interface RangeCtx { range: RangeOption; setRange: (r: RangeOption) => void }
export const RangeContext = createContext<RangeCtx>({ range: 'all', setRange: () => {} });
export const useRange = () => useContext(RangeContext);

type TabType = 'combined' | 'youtube' | 'webstore';

const TABS: { id: TabType; label: string; shortLabel: string; icon: React.ReactNode; active: string }[] = [
  {
    id: 'combined',
    label: 'Overall Overview',
    shortLabel: 'Overview',
    icon: <Layers className="w-4 h-4" />,
    active: 'from-violet-600 to-indigo-600 shadow-violet-500/30',
  },
  {
    id: 'youtube',
    label: 'YouTube Channel',
    shortLabel: 'YouTube',
    icon: <FaYoutube className="w-4 h-4" />,
    active: 'from-red-600 to-rose-500 shadow-red-500/30',
  },
  {
    id: 'webstore',
    label: 'Web Store',
    shortLabel: 'Store',
    icon: <ShoppingBag className="w-4 h-4" />,
    active: 'from-indigo-600 to-blue-500 shadow-indigo-500/30',
  },
];

const RANGE_LABELS: Record<RangeOption, string> = { '3mo': '3 Months', '6mo': '6 Months', all: 'All Time' };
const RANGE_SHORT:  Record<RangeOption, string> = { '3mo': '3M',       '6mo': '6M',       all: 'All'      };
const totalMonths = mockChannels[0].metrics.length;

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('youtube');
  const [isDark, setIsDark] = useState(true);
  const [range, setRange] = useState<RangeOption>(totalMonths >= 6 ? '6mo' : 'all');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <RangeContext.Provider value={{ range, setRange }}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300 flex flex-col">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

            {/* Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 shadow-sm">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold tracking-tight leading-none text-base sm:text-lg">
                  GardenFlow Analytics
                </h1>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
                  Cross-Platform Dashboard
                </span>
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Date range selector */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 gap-0.5">
                {(Object.keys(RANGE_LABELS) as RangeOption[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`text-xs font-semibold px-2 sm:px-2.5 py-1.5 rounded-md transition-all ${
                      range === r
                        ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    <span className="hidden sm:inline">{RANGE_LABELS[r]}</span>
                    <span className="sm:hidden">{RANGE_SHORT[r]}</span>
                  </button>
                ))}
              </div>

              {/* Dark mode toggle */}
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </header>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col lg:flex-row gap-6 lg:gap-10 pb-24 lg:pb-8">

          {/* Desktop sidebar */}
          <nav className="hidden lg:block lg:w-56 flex-shrink-0 space-y-1.5">
            <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 px-3 mb-4">
              Metrics Context
            </p>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.active} text-white shadow-lg`
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              >
                {activeTab === 'combined'  && <OverallView />}
                {activeTab === 'youtube'   && <YouTubeView />}
                {activeTab === 'webstore'  && <WebStoreView />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* ── Mobile bottom nav ──────────────────────────────────────────── */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-around h-16 px-2">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'text-violet-600 dark:text-violet-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {tab.icon}
                  <span className="text-[10px] font-semibold">{tab.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </nav>

      </div>
    </RangeContext.Provider>
  );
}