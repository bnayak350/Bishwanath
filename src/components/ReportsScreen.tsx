import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Calendar,
  PieChart as PieIcon,
  CreditCard,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Filter,
} from 'lucide-react';
import {
  Transaction,
  Category,
  Account,
  HouseholdMember,
  Budget,
  PeriodFinancials,
} from '../types';
import { formatINR } from '../services/currency';
import { translations, Language } from '../services/translations';
import { calculatePeriodFinancials, calculateBudgetPerformance } from '../services/financialEngine';
import { generatePDFReport, exportTransactionsToCSV } from '../services/exportService';

interface ReportsScreenProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  members: HouseholdMember[];
  budgets: Budget[];
  language: Language;
  privacyMode: boolean;
  onOpenExportModal: () => void;
}

type ReportTab =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'category'
  | 'paymentMethod'
  | 'budget'
  | 'family'
  | 'custom';

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  transactions,
  categories,
  accounts,
  members,
  budgets,
  language,
  privacyMode,
  onOpenExportModal,
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<ReportTab>('monthly');

  // Custom date range state
  const today = new Date();
  const currentMonthStr = today.toISOString().substring(0, 7);
  const [customStart, setCustomStart] = useState<string>(`${currentMonthStr}-01`);
  const [customEnd, setCustomEnd] = useState<string>(today.toISOString().substring(0, 10));

  // Determine date bounds based on tab
  const dateRange = useMemo(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');

    if (activeTab === 'daily') {
      const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      return { start: todayStr, end: todayStr, title: `${t.dailyReport} (${todayStr})` };
    }

    if (activeTab === 'weekly') {
      const startD = new Date(now);
      startD.setDate(now.getDate() - 6);
      const startStr = `${startD.getFullYear()}-${pad(startD.getMonth() + 1)}-${pad(startD.getDate())}`;
      const endStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      return { start: startStr, end: endStr, title: `${t.weeklyReport} (Last 7 Days)` };
    }

    if (activeTab === 'yearly') {
      const year = now.getFullYear();
      return { start: `${year}-01-01`, end: `${year}-12-31`, title: `${t.yearlyReport} (${year})` };
    }

    if (activeTab === 'custom') {
      return { start: customStart, end: customEnd, title: `Custom (${customStart} to ${customEnd})` };
    }

    // Default: This Month
    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    return {
      start: `${year}-${month}-01`,
      end: `${year}-${month}-${pad(lastDay)}`,
      title: `${t.monthlyReport} (${year}-${month})`,
    };
  }, [activeTab, customStart, customEnd, t]);

  // Calculate financials for active date range
  const financials = useMemo(() => {
    return calculatePeriodFinancials(
      transactions,
      categories,
      dateRange.start,
      dateRange.end,
      { useLinkedRefundPolicy: true }
    );
  }, [transactions, categories, dateRange]);

  const displayAmount = (paise: number) => {
    if (privacyMode) return '₹••••••';
    return formatINR(paise);
  };

  const handleExportPDF = () => {
    generatePDFReport(
      dateRange.title,
      dateRange.start,
      dateRange.end,
      financials,
      transactions,
      categories,
      language
    );
  };

  const handleExportCSV = () => {
    exportTransactionsToCSV(
      transactions,
      categories,
      accounts,
      members,
      `my_daily_khata_${dateRange.start}_to_${dateRange.end}.csv`
    );
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Header & Export Actions */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              {t.reportsAndAnalytics}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {dateRange.title}
            </p>
          </div>

          <div className="flex space-x-1.5 sm:space-x-2">
            <button
              onClick={onOpenExportModal}
              title="Open Export & Download Center"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/30 active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export & Download</span>
            </button>
            <button
              onClick={handleExportPDF}
              title={t.exportPdf}
              className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
            <button
              onClick={handleExportCSV}
              title={t.exportCsv}
              className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
            >
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Report Sub-Tabs Horizontal Scroller */}
        <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'monthly', label: t.monthlyReport },
            { id: 'daily', label: t.dailyReport },
            { id: 'weekly', label: t.weeklyReport },
            { id: 'yearly', label: t.yearlyReport },
            { id: 'category', label: t.categoryReport },
            { id: 'paymentMethod', label: t.paymentMethodReport },
            { id: 'budget', label: t.budgetReport },
            { id: 'family', label: t.familyReport },
            { id: 'custom', label: t.customRange },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ReportTab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Custom Range Picker (if custom active) */}
        {activeTab === 'custom' && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block mb-1">Start Date</span>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full text-xs p-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block mb-1">End Date</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full text-xs p-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Financial Executive Summary 4-Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Income */}
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            {t.totalIncome}
          </span>
          <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {displayAmount(financials.totalIncomePaise)}
          </div>
        </div>

        {/* Gross Expenditure */}
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            {t.grossExpenditure}
          </span>
          <div className="text-base font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
            {displayAmount(financials.grossExpenditurePaise)}
          </div>
        </div>

        {/* Eligible Refunds */}
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            {t.eligibleRefunds}
          </span>
          <div className="text-base font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
            {displayAmount(financials.eligibleRefundsPaise)}
          </div>
        </div>

        {/* Net Cash Flow */}
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            {t.netCashFlow}
          </span>
          <div
            className={`text-base font-extrabold mt-0.5 ${
              financials.netCashFlowPaise >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {displayAmount(financials.netCashFlowPaise)}
          </div>
        </div>
      </div>

      {/* Secondary Metrics Bar */}
      <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between text-xs text-slate-600 dark:text-slate-300">
        <div>
          <span className="text-slate-400 block text-[10px]">{t.savingsRate}</span>
          <span className="font-bold text-emerald-600">
            {financials.savingsRatePercent !== null
              ? `${financials.savingsRatePercent.toFixed(1)}%`
              : t.notAvailable}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">{t.averageDaily}</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {displayAmount(financials.averageDailyExpenditurePaise)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">{t.txCount}</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {financials.transactionCount}
          </span>
        </div>
      </div>

      {/* Category Breakdown Table */}
      {(activeTab === 'category' || activeTab === 'monthly' || activeTab === 'weekly' || activeTab === 'custom') && (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
            <PieIcon className="w-4 h-4" />
            <span>{t.categoryReport}</span>
          </h3>

          {financials.categorySpending.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">{t.noTransactions}</p>
          ) : (
            <div className="space-y-2.5">
              {financials.categorySpending.map((cat) => (
                <div key={cat.categoryId} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {language === 'or' ? cat.categoryNameOr : cat.categoryNameEn}{' '}
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({cat.count} tx)
                      </span>
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {displayAmount(cat.totalPaise)} ({cat.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${Math.min(100, cat.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment Method Report View */}
      {activeTab === 'paymentMethod' && (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
            <CreditCard className="w-4 h-4" />
            <span>{t.paymentMethodReport}</span>
          </h3>

          <div className="space-y-2.5">
            {financials.paymentMethodSpending.map((pm) => (
              <div key={pm.method} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase">
                    {pm.method} <span className="text-[10px] text-slate-400 font-normal">({pm.count} tx)</span>
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {displayAmount(pm.totalPaise)} ({pm.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${Math.min(100, pm.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Report View */}
      {activeTab === 'budget' && (
        <div className="space-y-3">
          {budgets.map((b) => {
            const perf = calculateBudgetPerformance(b, transactions);
            return (
              <div
                key={b.id}
                className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {b.category_id
                        ? categories.find((c) => c.id === b.category_id)?.name_en
                        : t.overallMonthlyBudget}
                    </h4>
                    <span className="text-[10px] text-slate-400">{b.month_str}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      perf.isOverspent
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {perf.utilizationPercent.toFixed(0)}% {t.utilized}
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      perf.isOverspent
                        ? 'bg-rose-500'
                        : perf.utilizationPercent >= 80
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, perf.utilizationPercent)}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs pt-1">
                  <span className="text-slate-500">
                    Spent: <strong className="text-slate-900 dark:text-white">{displayAmount(perf.eligibleExpenditurePaise)}</strong>
                  </span>
                  <span className="text-slate-500">
                    Budget: <strong className="text-slate-900 dark:text-white">{displayAmount(b.amount_paise)}</strong>
                  </span>
                  <span className="text-slate-500">
                    {perf.isOverspent ? t.overspentBy : t.remaining}:{' '}
                    <strong className={perf.isOverspent ? 'text-rose-600' : 'text-emerald-600'}>
                      {displayAmount(Math.abs(perf.remainingBudgetPaise))}
                    </strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Family Member Report View */}
      {activeTab === 'family' && (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
            <Users className="w-4 h-4" />
            <span>{t.spendingByMember}</span>
          </h3>

          <div className="space-y-3">
            {members.map((m) => {
              const memberFin = calculatePeriodFinancials(
                transactions,
                categories,
                dateRange.start,
                dateRange.end,
                { familyMemberId: m.id }
              );

              return (
                <div key={m.id} className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {m.display_name}
                    </span>
                    <span className="font-extrabold text-rose-600 dark:text-rose-400">
                      {displayAmount(memberFin.netExpenditurePaise)}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    {memberFin.transactionCount} transactions in this period
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
