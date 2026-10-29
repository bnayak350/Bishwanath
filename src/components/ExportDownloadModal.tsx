import React, { useState } from 'react';
import {
  X,
  Download,
  FileText,
  FileSpreadsheet,
  Database,
  Archive,
  Copy,
  Check,
  Printer,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import {
  Transaction,
  Category,
  Account,
  HouseholdMember,
  PeriodFinancials,
} from '../types';
import { formatINR } from '../services/currency';
import { translations, Language } from '../services/translations';
import { generatePDFReport, exportTransactionsToCSV } from '../services/exportService';
import { StorageService } from '../services/storage';
import { calculatePeriodFinancials } from '../services/financialEngine';

interface ExportDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  members: HouseholdMember[];
  language: Language;
}

export const ExportDownloadModal: React.FC<ExportDownloadModalProps> = ({
  isOpen,
  onClose,
  transactions,
  categories,
  accounts,
  members,
  language,
}) => {
  const t = translations[language];

  // Selected period preset
  const [selectedRange, setSelectedRange] = useState<'thisMonth' | 'lastMonth' | 'thisYear' | 'all'>('thisMonth');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  // Compute date range
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = now.getFullYear();

  let startDate = `${year}-01-01`;
  let endDate = `${year}-12-31`;
  let rangeTitle = 'All Transactions';

  if (selectedRange === 'thisMonth') {
    const month = pad(now.getMonth() + 1);
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    startDate = `${year}-${month}-01`;
    endDate = `${year}-${month}-${pad(lastDay)}`;
    rangeTitle = `Month of ${year}-${month}`;
  } else if (selectedRange === 'lastMonth') {
    const prevMonthDate = new Date(year, now.getMonth() - 1, 1);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonth = pad(prevMonthDate.getMonth() + 1);
    const lastDay = new Date(prevYear, prevMonthDate.getMonth() + 1, 0).getDate();
    startDate = `${prevYear}-${prevMonth}-01`;
    endDate = `${prevYear}-${prevMonth}-${pad(lastDay)}`;
    rangeTitle = `Previous Month (${prevYear}-${prevMonth})`;
  } else if (selectedRange === 'thisYear') {
    startDate = `${year}-01-01`;
    endDate = `${year}-12-31`;
    rangeTitle = `Year ${year}`;
  } else {
    startDate = '2000-01-01';
    endDate = '2099-12-31';
    rangeTitle = 'All Recorded History';
  }

  // Filter transactions within selected range
  const activeTransactions = transactions.filter((tx) => {
    if (tx.status === 'voided' || tx.deleted_at) return false;
    if (selectedRange === 'all') return true;
    return tx.transaction_date >= startDate && tx.transaction_date <= endDate;
  });

  const financials = calculatePeriodFinancials(
    transactions,
    categories,
    startDate,
    endDate,
    { useLinkedRefundPolicy: true }
  );

  const handleDownloadPDF = () => {
    try {
      generatePDFReport(
        rangeTitle,
        startDate,
        endDate,
        financials,
        activeTransactions,
        categories,
        language
      );
      setDownloadSuccess('PDF Report downloaded successfully!');
      setTimeout(() => setDownloadSuccess(null), 3500);
    } catch (e: any) {
      alert('Error generating PDF: ' + e.message);
    }
  };

  const handleDownloadCSV = () => {
    try {
      exportTransactionsToCSV(
        activeTransactions,
        categories,
        accounts,
        members,
        `My_Daily_Khata_${startDate}_to_${endDate}.csv`
      );
      setDownloadSuccess('CSV Spreadsheet file downloaded successfully!');
      setTimeout(() => setDownloadSuccess(null), 3500);
    } catch (e: any) {
      alert('Error generating CSV: ' + e.message);
    }
  };

  const handleCopyCSV = () => {
    try {
      const catMap = new Map(categories.map((c) => [c.id, c.name_en]));
      const accMap = new Map(accounts.map((a) => [a.id, a.name]));
      const memMap = new Map(members.map((m) => [m.id, m.display_name]));

      const headers = ['Date', 'Type', 'Category', 'Description', 'Amount INR', 'Payment Method', 'Family Member', 'Account'];
      const rows = activeTransactions.map((tx) => [
        tx.transaction_date,
        tx.transaction_type.toUpperCase(),
        tx.category_id ? catMap.get(tx.category_id) || '' : '',
        `"${(tx.description || '').replace(/"/g, '""')}"`,
        (tx.amount_paise / 100).toFixed(2),
        tx.payment_method,
        tx.family_member_id ? memMap.get(tx.family_member_id) || '' : '',
        tx.account_id ? accMap.get(tx.account_id) || '' : '',
      ]);

      const csvText = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      navigator.clipboard.writeText(csvText);
      setCopiedType('csv');
      setTimeout(() => setCopiedType(null), 2500);
    } catch {
      alert('Failed to copy to clipboard.');
    }
  };

  const handleDownloadJSON = () => {
    try {
      const jsonStr = StorageService.exportFullBackup();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `My_Daily_Khata_Backup_${new Date().toISOString().substring(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadSuccess('Full JSON Database backup downloaded successfully!');
      setTimeout(() => setDownloadSuccess(null), 3500);
    } catch (e: any) {
      alert('Error exporting JSON: ' + e.message);
    }
  };

  const handleCopyJSON = () => {
    try {
      const jsonStr = StorageService.exportFullBackup();
      navigator.clipboard.writeText(jsonStr);
      setCopiedType('json');
      setTimeout(() => setCopiedType(null), 2500);
    } catch {
      alert('Failed to copy JSON.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Export & Download Center
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Generate and download reports, spreadsheets, and data backups
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Success Banner */}
          {downloadSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{downloadSuccess}</span>
            </div>
          )}

          {/* Period Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Select Reporting Period for Export:</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
              {[
                { id: 'thisMonth', label: 'This Month' },
                { id: 'lastMonth', label: 'Last Month' },
                { id: 'thisYear', label: 'This Year' },
                { id: 'all', label: 'All Time' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedRange(p.id as any)}
                  className={`py-1.5 font-bold rounded-lg transition-all ${
                    selectedRange === p.id
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="text-[11px] text-slate-400 pl-1">
              Includes <strong>{activeTransactions.length} transactions</strong> ({rangeTitle})
            </div>
          </div>

          {/* Export Options Cards */}
          <div className="space-y-3 pt-1">
            {/* 1. PDF Financial Report */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    PDF Financial Statement
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Formatted in INR (₹) with category charts, summary, and itemized ledger.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownloadPDF}
                  className="w-full sm:w-auto px-3.5 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

            {/* 2. CSV Spreadsheet File */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    CSV Spreadsheet (Excel / Google Sheets)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    UTF-8 with BOM, formula-injection safe, clean itemized rows.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={handleCopyCSV}
                  title="Copy CSV to clipboard"
                  className="px-2.5 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all"
                >
                  {copiedType === 'csv' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'csv' ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownloadCSV}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>

            {/* 3. JSON Database Backup */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Full Database Backup (JSON)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Complete relational snapshot: transactions, categories, budgets, and settings.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={handleCopyJSON}
                  title="Copy JSON to clipboard"
                  className="px-2.5 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all"
                >
                  {copiedType === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'json' ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownloadJSON}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download JSON</span>
                </button>
              </div>
            </div>

            {/* 4. Android APK File (.apk) */}
            <div className="p-3.5 bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-2xl border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center flex-shrink-0 font-extrabold text-sm">
                  APK
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xs font-bold text-white">
                      Android Installable APK File (.apk)
                    </h3>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      1.61 MB
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Compiled Android package (<code>com.mydailykhata.app</code>) with v1/v2/v3 signatures.
                  </p>
                </div>
              </div>

              <a
                href="/My_Khata.apk"
                download="My_Khata.apk"
                className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 rounded-xl text-xs font-extrabold shadow-md shadow-emerald-500/30 flex items-center justify-center space-x-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Download My_Khata.apk</span>
              </a>
            </div>

            {/* 5. Complete Flutter Project Codebase (.ZIP) */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Archive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Android App & Flutter Codebase (.ZIP)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Full Flutter source files, Android build config, Drift SQLite, and build scripts.
                  </p>
                </div>
              </div>

              <a
                href="/My_Daily_Khata_Flutter_Project.zip"
                download="My_Daily_Khata_Flutter_Project.zip"
                className="w-full sm:w-auto px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center space-x-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .ZIP</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-900/50 rounded-b-3xl">
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
