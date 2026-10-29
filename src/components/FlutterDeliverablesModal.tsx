import React, { useState } from 'react';
import { X, Copy, Check, Code, FileText, Download, Layers } from 'lucide-react';
import { FLUTTER_DELIVERABLES, CodeDeliverable } from '../services/flutterCodeDeliverables';

interface FlutterDeliverablesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FlutterDeliverablesModal: React.FC<FlutterDeliverablesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFile, setSelectedFile] = useState<CodeDeliverable>(FLUTTER_DELIVERABLES[0]);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCurrent = () => {
    const blob = new Blob([selectedFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.filename.split('/').pop() || 'deliverable.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Flutter & Supabase Code Deliverables
              </h2>
              <p className="text-[11px] text-slate-400">
                Dart source code, Drift SQLite migrations, Supabase RLS, and build scripts
              </p>
            </div>
          </div>
            <div className="flex items-center space-x-2">
              <a
                href="/My_Daily_Khata_Flutter_Project.zip"
                download="My_Daily_Khata_Flutter_Project.zip"
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Project (.ZIP)</span>
              </a>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
        </div>

        {/* 2-Column Split: File Navigator & Code Viewer */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* File Sidebar */}
          <div className="w-full md:w-60 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 p-2 overflow-y-auto space-y-1 bg-slate-50/50 dark:bg-slate-900/50">
            {FLUTTER_DELIVERABLES.map((file) => (
              <button
                key={file.filename}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-medium transition-all flex flex-col ${
                  selectedFile.filename === file.filename
                    ? 'bg-emerald-600 text-white font-bold shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="font-mono text-[11px] truncate">{file.filename}</span>
                <span
                  className={`text-[9px] uppercase tracking-wider ${
                    selectedFile.filename === file.filename ? 'text-emerald-100' : 'text-slate-400'
                  }`}
                >
                  {file.category}
                </span>
              </button>
            ))}
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col min-h-0 bg-slate-950 text-slate-100">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/70 text-xs">
              <span className="font-mono text-emerald-400 text-[11px]">
                {selectedFile.filename}
              </span>
              <div className="flex space-x-1.5">
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold flex items-center space-x-1 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownloadCurrent}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold flex items-center space-x-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-auto font-mono text-[11px] leading-relaxed select-text">
              <pre>{selectedFile.code}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
