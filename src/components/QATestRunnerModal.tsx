import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, Play, ShieldCheck, Terminal } from 'lucide-react';
import { runAutomatedTests, TestSuiteSummary } from '../services/testRunner';
import confetti from 'canvas-confetti';

interface QATestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QATestRunnerModal: React.FC<QATestRunnerModalProps> = ({ isOpen, onClose }) => {
  const [summary, setSummary] = useState<TestSuiteSummary | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const executeTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runAutomatedTests();
      setSummary(res);
      setIsRunning(false);
      if (res.failed === 0) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    }, 200);
  };

  useEffect(() => {
    if (isOpen) {
      executeTests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Automated Verification Suite (Section 13)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Summary Box */}
          {summary && (
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Total Test Assertions
                </div>
                <div className="text-xl font-black text-slate-900 dark:text-white">
                  {summary.passed} / {summary.total} Passed
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1 ${
                    summary.failed === 0
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  {summary.failed === 0 ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      <span>100% PASS</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      <span>{summary.failed} Failed</span>
                    </>
                  )}
                </span>
                <button
                  onClick={executeTests}
                  disabled={isRunning}
                  className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 active:scale-95 transition-all"
                  title="Rerun Tests"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Test Case Results */}
          <div className="space-y-2">
            {summary?.results.map((r) => (
              <div
                key={r.id}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white">
                    {r.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    )}
                    <span>{r.name}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {r.section}
                  </span>
                </div>

                <div className="pl-6 text-[11px] text-slate-500 dark:text-slate-400 grid grid-cols-2 gap-2 pt-0.5">
                  <div>
                    <span className="font-semibold text-slate-400">Expected:</span>{' '}
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">
                      {r.expected}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400">Actual:</span>{' '}
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {r.actual}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
