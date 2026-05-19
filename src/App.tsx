import { useState, useEffect } from 'react';
import OverallView from './components/OverallView';
import YouTubeView from './components/YouTubeView';
import WebStoreView from './components/WebStoreView';
import { Layers, ShoppingBag, TrendingUp, Moon, Sun } from 'lucide-react';
import { FaYoutube } from 'react-icons/fa6';
import { motion, AnimatePresence } from 'framer-motion'; 

type TabType = 'combined' | 'youtube' | 'webstore';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('youtube');
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300 flex flex-col overflow-hidden">
      
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
        <div className="w-full max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-950 dark:bg-emerald-500/10 rounded-xl text-emerald-400 shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold tracking-tight leading-none text-lg">Ecosystem Command</h1>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Cross-Platform Analytics</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700">
              v1.0.0-trial
            </div>
          </div>
        </div>
      </header>

      {/* Layout Container */}
      <div className="w-full max-w-[1600px] mx-auto px-6 py-8 flex-1 flex flex-col lg:flex-row gap-10">
        
        {/* Sidebar Navigation */}
        <nav className="lg:w-64 flex-shrink-0 space-y-2">
          <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 px-3 mb-4">Metrics Context</p>
          
          <button
            onClick={() => setActiveTab('combined')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 relative overflow-hidden ${
              activeTab === 'combined'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-4 h-4 z-10" /> <span className="z-10">Overall Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('youtube')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 relative overflow-hidden ${
              activeTab === 'youtube'
                ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-lg shadow-red-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            <FaYoutube className="w-4 h-4 z-10" /> <span className="z-10">YouTube Channel</span>
          </button>

          <button
            onClick={() => setActiveTab('webstore')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 relative overflow-hidden ${
              activeTab === 'webstore'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-lg shadow-indigo-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            <ShoppingBag className="w-4 h-4 z-10" /> <span className="z-10">Web Store</span>
          </button>
        </nav>

        {/* Motion Viewport Wrapper */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}   
              transition={{ duration: 0.15, ease: "easeOut" }} 
            >
              {activeTab === 'combined' && <OverallView />}
              {activeTab === 'youtube' && <YouTubeView />}
              {activeTab === 'webstore' && <WebStoreView />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}