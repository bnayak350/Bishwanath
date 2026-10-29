import React from 'react';
import { Home, Receipt, Plus, BarChart3, Settings } from 'lucide-react';
import { translations, Language } from '../services/translations';

interface NavigationProps {
  currentTab: 'home' | 'transactions' | 'reports' | 'settings';
  onSelectTab: (tab: 'home' | 'transactions' | 'reports' | 'settings') => void;
  onOpenQuickAdd: () => void;
  language: Language;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  onOpenQuickAdd,
  language,
}) => {
  const t = translations[language];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-40 transition-colors shadow-lg">
      <div className="flex items-center justify-around h-16 px-2">
        {/* Home */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            currentTab === 'home'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Home className={`w-5 h-5 transition-transform ${currentTab === 'home' ? 'scale-110' : ''}`} />
          <span className="text-[11px] mt-1 tracking-tight">{t.navHome}</span>
        </button>

        {/* Transactions */}
        <button
          onClick={() => onSelectTab('transactions')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            currentTab === 'transactions'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Receipt className={`w-5 h-5 transition-transform ${currentTab === 'transactions' ? 'scale-110' : ''}`} />
          <span className="text-[11px] mt-1 tracking-tight">{t.navTransactions}</span>
        </button>

        {/* Floating Quick Add (+) Button */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            onClick={onOpenQuickAdd}
            aria-label="Add Transaction"
            className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-xl shadow-emerald-600/30 flex items-center justify-center transition-all focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        {/* Reports */}
        <button
          onClick={() => onSelectTab('reports')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            currentTab === 'reports'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className={`w-5 h-5 transition-transform ${currentTab === 'reports' ? 'scale-110' : ''}`} />
          <span className="text-[11px] mt-1 tracking-tight">{t.navReports}</span>
        </button>

        {/* Settings */}
        <button
          onClick={() => onSelectTab('settings')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            currentTab === 'settings'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Settings className={`w-5 h-5 transition-transform ${currentTab === 'settings' ? 'scale-110' : ''}`} />
          <span className="text-[11px] mt-1 tracking-tight">{t.navSettings}</span>
        </button>
      </div>
    </nav>
  );
};
