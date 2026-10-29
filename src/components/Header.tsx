import React from 'react';
import { Eye, EyeOff, Lock, Globe, Smartphone, Monitor } from 'lucide-react';
import { translations, Language } from '../services/translations';

interface HeaderProps {
  language: Language;
  onToggleLanguage: () => void;
  privacyMode: boolean;
  onTogglePrivacy: () => void;
  hasPin: boolean;
  onLockApp: () => void;
  isFramed: boolean;
  onToggleFrame: () => void;
  onInstallClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onToggleLanguage,
  privacyMode,
  onTogglePrivacy,
  hasPin,
  onLockApp,
  isFramed,
  onToggleFrame,
  onInstallClick,
}) => {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 transition-colors">
      <div className="flex items-center justify-between">
        {/* App Title & Tagline */}
        <div className="flex items-center space-x-2.5">
          <img
            src="/app-logo.png"
            alt="My Khata"
            className="w-10 h-10 rounded-xl shadow-md object-cover border border-slate-200 dark:border-slate-700"
          />
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              {t.appName}
            </h1>
            <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Install on Android Phone */}
          {onInstallClick && (
            <button
              onClick={onInstallClick}
              title="Install on Android (PWA)"
              className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 transition-colors"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          )}

          {/* Mobile Frame / Desktop Toggle */}
          <button
            onClick={onToggleFrame}
            title={isFramed ? 'Switch to responsive view' : 'Switch to mobile phone frame'}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isFramed ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>

          {/* Privacy Toggle */}
          <button
            onClick={onTogglePrivacy}
            title={privacyMode ? 'Show amounts' : 'Hide amounts (Privacy Mode)'}
            className={`p-1.5 rounded-lg transition-colors ${
              privacyMode
                ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {privacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Lock App Now */}
          {hasPin && (
            <button
              onClick={onLockApp}
              title="Lock application now"
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Lock className="w-4 h-4" />
            </button>
          )}

          {/* Language Switcher Badge */}
          <button
            onClick={onToggleLanguage}
            title="Switch Language: English / ଓଡ଼ିଆ"
            className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'ଓଡ଼ିଆ' : 'EN'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
