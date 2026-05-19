import { Sparkles } from 'lucide-react';

interface InsightBannerProps {
  title: string;
  insightText: string;
  theme: 'violet' | 'red' | 'indigo';
}

export default function InsightBanner({ title, insightText, theme }: InsightBannerProps) {
  const themeStyles = {
    violet: {
      wrapperBg: 'from-violet-50 to-white border-violet-100 dark:from-slate-900 dark:to-slate-800 dark:border-slate-700',
      iconBg: 'bg-violet-100 dark:bg-violet-500/20',
      iconColor: 'text-violet-600 dark:text-violet-400',
      titleColor: 'text-violet-700 dark:text-violet-300',
    },
    red: {
      wrapperBg: 'from-red-50 to-white border-red-100 dark:from-slate-900 dark:to-slate-800 dark:border-slate-700',
      iconBg: 'bg-red-100 dark:bg-red-500/20',
      iconColor: 'text-red-600 dark:text-red-400',
      titleColor: 'text-red-700 dark:text-red-300',
    },
    indigo: {
      wrapperBg: 'from-indigo-50 to-white border-indigo-100 dark:from-slate-900 dark:to-slate-800 dark:border-slate-700',
      iconBg: 'bg-indigo-100 dark:bg-indigo-500/20',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      titleColor: 'text-indigo-700 dark:text-indigo-300',
    },
  };

  const activeTheme = themeStyles[theme];

  return (
    <div className={`bg-gradient-to-r p-5 rounded-2xl shadow-sm border flex items-start gap-4 transition-colors duration-300 ${activeTheme.wrapperBg}`}>
      <div className={`p-2 rounded-lg mt-0.5 ${activeTheme.iconBg} ${activeTheme.iconColor}`}>
        <Sparkles className="w-5 h-5" />
      </div>
      <div>
        <h4 className={`text-sm font-bold uppercase tracking-wider mb-1 ${activeTheme.titleColor}`}>
          {title}
        </h4>
        <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed transition-colors">
          {insightText}
        </p>
      </div>
    </div>
  );
}