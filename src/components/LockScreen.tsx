import React, { useState } from 'react';
import { Lock, Fingerprint, Delete, ShieldAlert } from 'lucide-react';
import { translations, Language } from '../services/translations';

interface LockScreenProps {
  isOpen: boolean;
  onUnlockWithPin: (pin: string) => Promise<boolean>;
  onUnlockWithBiometrics: () => Promise<boolean>;
  language: Language;
}

export const LockScreen: React.FC<LockScreenProps> = ({
  isOpen,
  onUnlockWithPin,
  onUnlockWithBiometrics,
  language,
}) => {
  const t = translations[language];
  const [enteredPin, setEnteredPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleKeyPress = async (digit: string) => {
    if (isVerifying || enteredPin.length >= 4) return;
    const newPin = enteredPin + digit;
    setEnteredPin(newPin);
    setErrorMsg(null);

    if (newPin.length === 4) {
      setIsVerifying(true);
      const success = await onUnlockWithPin(newPin);
      setIsVerifying(false);
      if (!success) {
        setErrorMsg(language === 'or' ? 'ଭୁଲ୍ ପିନ୍ (Incorrect PIN)' : 'Incorrect PIN. Please try again.');
        setEnteredPin('');
      }
    }
  };

  const handleDelete = () => {
    if (enteredPin.length > 0) {
      setEnteredPin(enteredPin.slice(0, -1));
      setErrorMsg(null);
    }
  };

  const handleBiometricClick = async () => {
    setIsVerifying(true);
    const success = await onUnlockWithBiometrics();
    setIsVerifying(false);
    if (!success) {
      setErrorMsg(language === 'or' ? 'ବାୟୋମେଟ୍ରିକ୍ ବିଫଳ (Biometric failed)' : 'Biometric authentication failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-white select-none">
      {/* Lock Icon and App Branding */}
      <div className="text-center space-y-2 mb-8">
        <div className="relative inline-block mx-auto">
          <img
            src="/app-logo.png"
            alt="My Khata"
            className="w-16 h-16 rounded-2xl mx-auto shadow-2xl object-cover border border-white/20"
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-600 border-2 border-slate-950 flex items-center justify-center text-white">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>
        <h2 className="text-lg font-extrabold">{t.appName}</h2>
        <p className="text-xs text-slate-400">{t.enterPin}</p>
      </div>

      {/* 4 PIN Dots */}
      <div className="flex space-x-5 mb-8">
        {[0, 1, 2, 3].map((idx) => {
          const filled = enteredPin.length > idx;
          return (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                filled
                  ? 'bg-emerald-400 border-emerald-400 scale-125'
                  : 'border-slate-600 bg-transparent'
              }`}
            />
          );
        })}
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="mb-4 text-xs font-semibold text-rose-400 flex items-center space-x-1 animate-bounce">
          <ShieldAlert className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Numeric Keypad */}
      <div className="w-full max-w-xs grid grid-cols-3 gap-3 mb-6">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            onClick={() => handleKeyPress(digit)}
            disabled={isVerifying}
            className="h-16 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-2xl font-bold flex items-center justify-center transition-all focus:outline-none"
          >
            {digit}
          </button>
        ))}

        {/* Biometric Button */}
        <button
          onClick={handleBiometricClick}
          disabled={isVerifying}
          className="h-16 rounded-2xl bg-slate-800/50 hover:bg-slate-700 active:scale-95 text-emerald-400 flex items-center justify-center transition-all focus:outline-none"
          title="Unlock with Biometrics"
        >
          <Fingerprint className="w-7 h-7" />
        </button>

        {/* 0 */}
        <button
          onClick={() => handleKeyPress('0')}
          disabled={isVerifying}
          className="h-16 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-2xl font-bold flex items-center justify-center transition-all focus:outline-none"
        >
          0
        </button>

        {/* Backspace */}
        <button
          onClick={handleDelete}
          disabled={isVerifying}
          className="h-16 rounded-2xl bg-slate-800/50 hover:bg-slate-700 active:scale-95 text-slate-400 flex items-center justify-center transition-all focus:outline-none"
          title="Backspace"
        >
          <Delete className="w-6 h-6" />
        </button>
      </div>

      <p className="text-[11px] text-slate-500 text-center">
        Every Rupee Accounted For • Offline Secure Storage
      </p>
    </div>
  );
};
