import React from 'react';
import { ShieldCheck, Database, Smartphone, Globe, ArrowRight, Check } from 'lucide-react';
import { translations, Language } from '../services/translations';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  language,
  onSelectLanguage,
}) => {
  const t = translations[language];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 text-center animate-in zoom-in-95 duration-200">
        {/* App Icon Banner */}
        <div>
          <img
            src="/app-logo.png"
            alt="My Khata"
            className="w-20 h-20 rounded-2xl mx-auto shadow-2xl object-cover border-2 border-white/20"
          />
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-3">
            {t.appName}
          </h2>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {t.tagline}
          </p>
        </div>

        {/* Language Chooser Pill */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl max-w-xs mx-auto">
          <button
            onClick={() => onSelectLanguage('en')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              language === 'en'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500'
            }`}
          >
            English
          </button>
          <button
            onClick={() => onSelectLanguage('or')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              language === 'or'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500'
            }`}
          >
            ଓଡ଼ିଆ (Odia)
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <span className="font-extrabold text-xs">₹</span>
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              INR Fixed (₹)
            </div>
            <div className="text-[10px] text-slate-400">
              Strict Lakh & Crore format with paise precision.
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              Offline First
            </div>
            <div className="text-[10px] text-slate-400">
              No cloud login required. Works 100% offline.
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
            <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              PIN & Biometrics
            </div>
            <div className="text-[10px] text-slate-400">
              PBKDF2 salted encryption for household privacy.
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
            <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              Bilingual
            </div>
            <div className="text-[10px] text-slate-400">
              Instant toggle between English & ଓଡ଼ିଆ.
            </div>
          </div>
        </div>

        {/* CTA Get Started Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all"
        >
          <span>{language === 'or' ? 'ଆରମ୍ଭ କରନ୍ତୁ' : 'Get Started'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
