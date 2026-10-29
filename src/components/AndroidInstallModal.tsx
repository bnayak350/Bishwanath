import React, { useState, useEffect } from 'react';
import { X, Smartphone, Download, Terminal, CheckCircle2, Shield, Info } from 'lucide-react';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFlutterDeliverables: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isOpen,
  onClose,
  onOpenFlutterDeliverables,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      alert(
        'To install directly on your Android phone:\n\n1. Open this website in Google Chrome on your phone.\n2. Tap the three dots (⋮) in the top-right corner.\n3. Tap "Install app" or "Add to Home screen".\n\nThe app will install directly to your app drawer and work 100% offline!'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Install on Android Phone
              </h2>
              <p className="text-[11px] text-slate-400">
                My Khata • Android Deployment Options
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Direct APK Download Card */}
        <div className="p-4 bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-2xl border border-emerald-500/40 shadow-lg space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[11px] font-extrabold flex items-center justify-center">
                ✓
              </span>
              <span className="text-xs font-bold text-white">
                Release APK Built & Ready
              </span>
            </div>
            <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
              1.61 MB • Android 5.0+
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Download the signed <strong>My_Khata.apk</strong> file and install it directly on your Android phone.
          </p>

          <a
            href="/My_Khata.apk"
            download="My_Khata.apk"
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 rounded-xl text-xs font-extrabold shadow-lg shadow-emerald-500/30 flex items-center justify-center space-x-2 transition-all"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Download My_Khata.apk</span>
          </a>

          <div className="text-[10px] text-slate-400 space-y-0.5 pt-0.5">
            <div>• Package: <code>com.mydailykhata.app</code></div>
            <div>• Signature: v1, v2, v3 Verified</div>
          </div>
        </div>

        {/* Option 2: Direct Android Phone Install (PWA Standalone) */}
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-2.5">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">
              2
            </span>
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
              Instant In-Browser PWA Install (No APK download needed)
            </span>
          </div>

          <p className="text-xs text-emerald-950 dark:text-emerald-100 leading-relaxed">
            Install <strong>My Daily Khata</strong> directly on your Android phone right now. It runs in standalone full-screen mode with its own home screen icon, offline database, and PIN protection.
          </p>

          <button
            onClick={handleInstallClick}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Install App on Phone</span>
          </button>
        </div>

        {/* Option 3: Flutter Source Code Archive */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-slate-700 text-white text-[11px] font-bold flex items-center justify-center">
              3
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Flutter Project Source (.ZIP)
            </span>
          </div>

          <div className="flex space-x-2 pt-1">
            <a
              href="/My_Daily_Khata_Flutter_Project.zip"
              download="My_Daily_Khata_Flutter_Project.zip"
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Project (.ZIP)</span>
            </a>
            <button
              onClick={() => {
                onClose();
                onOpenFlutterDeliverables();
              }}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>View Code</span>
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-start space-x-2 text-[11px] text-slate-400 pt-1">
          <Shield className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
          <span>
            Offline-first security: All monetary calculations in paise, no plaintext PIN storage.
          </span>
        </div>
      </div>
    </div>
  );
};
