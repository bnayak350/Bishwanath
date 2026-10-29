import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart as PieIcon,
  PlusCircle,
  MinusCircle,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Target,
  Sparkles,
  Building2,
  X,
  Copy,
  Check,
} from 'lucide-react';
import {
  Transaction,
  Category,
  Account,
  Budget,
  SavingsGoal,
  PeriodFinancials,
} from '../types';
import { formatINR } from '../services/currency';
import { translations, Language } from '../services/translations';
import { calculateBudgetPerformance } from '../services/financialEngine';

interface HomeDashboardProps {
  language: Language;
  privacyMode: boolean;
  financials: PeriodFinancials;
  todayFinancials: PeriodFinancials;
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  onOpenQuickAdd: (defaultType?: 'expense' | 'income') => void;
  onNavigateToTab: (tab: 'transactions' | 'reports' | 'settings') => void;
  selectedPeriod: 'today' | 'week' | 'month' | 'custom';
  onChangePeriod: (period: 'today' | 'week' | 'month' | 'custom') => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  language,
  privacyMode,
  financials,
  todayFinancials,
  transactions,
  categories,
  accounts = [],
  budgets,
  savingsGoals,
  onOpenQuickAdd,
  onNavigateToTab,
  selectedPeriod,
  onChangePeriod,
}) => {
  const t = translations[language];

  const [activeTxDetail, setActiveTxDetail] = useState<Transaction | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const accountMap = React.useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);

  const handleCopy = (text: string, field: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // fallback
    }
  };

  // Primary overall monthly budget
  const overallBudget = budgets.find((b) => !b.category_id && b.is_active) || budgets[0];
  const budgetPerf = overallBudget ? calculateBudgetPerformance(overallBudget, transactions) : null;

  // Primary savings goal
  const primaryGoal = savingsGoals[0];
  const goalProgress = primaryGoal
    ? Math.min(100, Math.round((primaryGoal.current_contribution_paise / primaryGoal.target_amount_paise) * 100))
    : 0;

  // Mask amount in privacy mode
  const displayAmount = (paise: number, compact = false) => {
    if (privacyMode) return '₹••••••';
    return formatINR(paise, { compact });
  };

  // Category map for quick lookups
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  // Recent transactions (top 5 active)
  const recentTransactions = transactions
    .filter((tx) => tx.status !== 'voided' && !tx.deleted_at)
    .slice(0, 5);

  // Generate smart insights from data
  const generateInsights = () => {
    const list: string[] = [];

    if (financials.categorySpending.length > 0) {
      const top = financials.categorySpending[0];
      const name = language === 'or' ? top.categoryNameOr : top.categoryNameEn;
      list.push(
        language === 'or'
          ? `ଆପଣଙ୍କର ସର୍ବାଧିକ ଖର୍ଚ୍ଚ '${name}' ରେ ହୋଇଛି (${top.percentage.toFixed(0)}%)।`
          : `'${name}' represents your largest spending category at ${top.percentage.toFixed(0)}% of total expenditure.`
      );
    }

    if (budgetPerf) {
      if (budgetPerf.isOverspent) {
        list.push(
          language === 'or'
            ? `ସତର୍କତା: ଆପଣଙ୍କ ମାସିକ ବଜେଟ୍ ${formatINR(Math.abs(budgetPerf.remainingBudgetPaise))} ରେ ଅତିକ୍ରମ କରିଛି!`
            : `Warning: You have exceeded your household budget by ${formatINR(Math.abs(budgetPerf.remainingBudgetPaise))}!`
        );
      } else if (budgetPerf.utilizationPercent >= 80) {
        list.push(
          language === 'or'
            ? `ଆପଣ ମାସିକ ବଜେଟର ${budgetPerf.utilizationPercent.toFixed(0)}% ବ୍ୟବହାର କରିସାରିଛନ୍ତି।`
            : `You have consumed ${budgetPerf.utilizationPercent.toFixed(0)}% of your monthly budget.`
        );
      }
    }

    if (financials.savingsRatePercent !== null) {
      if (financials.savingsRatePercent > 20) {
        list.push(
          language === 'or'
            ? `ଉତ୍କୃଷ୍ଟ! ଆପଣଙ୍କ ସଞ୍ଚୟ ହାର ବର୍ତ୍ତମାନ ${financials.savingsRatePercent.toFixed(1)}% ରହିଛି।`
            : `Great job! Your current savings rate is healthy at ${financials.savingsRatePercent.toFixed(1)}%.`
        );
      }
    }

    if (financials.averageDailyExpenditurePaise > 0) {
      list.push(
        language === 'or'
          ? `ଏହି ସମୟରେ ଆପଣଙ୍କ ଦୈନିକ ହାରାହାରି ଖର୍ଚ୍ଚ ${formatINR(financials.averageDailyExpenditurePaise)} ଅଟେ।`
          : `Your average daily expenditure for this period is ${formatINR(financials.averageDailyExpenditurePaise)}.`
      );
    }

    return list;
  };

  const smartInsights = generateInsights();

  return (
    <div className="space-y-4 pb-24">
      {/* Period Filter Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
        {(['today', 'week', 'month', 'custom'] as const).map((p) => {
          const labels = {
            today: t.today,
            week: t.thisWeek,
            month: t.thisMonth,
            custom: t.customRange,
          };
          return (
            <button
              key={p}
              onClick={() => onChangePeriod(p)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedPeriod === p
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {labels[p]}
            </button>
          );
        })}
      </div>

      {/* Primary Financial Overview Hero Card */}
      <div className="rounded-2xl p-5 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
              {t.netCashFlow} ({selectedPeriod === 'today' ? t.today : selectedPeriod === 'week' ? t.thisWeek : t.thisMonth})
            </span>
            <div className="text-3xl font-extrabold tracking-tight mt-0.5">
              {displayAmount(financials.netCashFlowPaise)}
            </div>
          </div>
          <span
            className={`flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${
              financials.netCashFlowPaise >= 0
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            {financials.netCashFlowPaise >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 mr-1" />
            )}
            {financials.savingsRatePercent !== null
              ? `${financials.savingsRatePercent.toFixed(1)}% ${t.savingsRate}`
              : t.netCashFlow}
          </span>
        </div>

        {/* 2-Column Split: Income & Expenditure */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700/60">
          <div className="bg-slate-800/40 rounded-xl p-2.5">
            <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-medium">
              <ArrowDownRight className="w-4 h-4 text-emerald-400" />
              <span>{t.totalIncome}</span>
            </div>
            <div className="text-lg font-bold text-slate-100 mt-1">
              {displayAmount(financials.totalIncomePaise, true)}
            </div>
          </div>

          <div className="bg-slate-800/40 rounded-xl p-2.5">
            <div className="flex items-center space-x-1.5 text-xs text-rose-400 font-medium">
              <ArrowUpRight className="w-4 h-4 text-rose-400" />
              <span>{t.netExpenditure}</span>
            </div>
            <div className="text-lg font-bold text-slate-100 mt-1">
              {displayAmount(financials.netExpenditurePaise, true)}
            </div>
          </div>
        </div>

        {/* Quick Action Add Buttons */}
        <div className="flex space-x-2.5 mt-4">
          <button
            onClick={() => onOpenQuickAdd('expense')}
            className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-semibold active:scale-95 transition-all shadow-md"
          >
            <MinusCircle className="w-4 h-4" />
            <span>{t.addExpense}</span>
          </button>
          <button
            onClick={() => onOpenQuickAdd('income')}
            className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-semibold active:scale-95 transition-all shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.addIncome}</span>
          </button>
        </div>
      </div>

      {/* 7 Core Requirement Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Today's Expenditure */}
        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            {t.todayExpenditure}
          </span>
          <div className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-0.5">
            {displayAmount(todayFinancials.netExpenditurePaise)}
          </div>
          <span className="text-[10px] text-slate-400">
            {todayFinancials.transactionCount} transactions today
          </span>
        </div>

        {/* Card 2: Today's Income */}
        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            {t.todayIncome}
          </span>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {displayAmount(todayFinancials.totalIncomePaise)}
          </div>
          <span className="text-[10px] text-slate-400">
            {todayFinancials.totalIncomePaise > 0 ? 'Received today' : 'No income today'}
          </span>
        </div>

        {/* Card 6: Budget Remaining */}
        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {t.budgetRemaining}
            </span>
            {budgetPerf?.isOverspent && (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            )}
          </div>
          <div
            className={`text-lg font-bold mt-0.5 ${
              budgetPerf?.isOverspent
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-900 dark:text-white'
            }`}
          >
            {budgetPerf ? displayAmount(budgetPerf.remainingBudgetPaise) : '₹0.00'}
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                budgetPerf?.isOverspent
                  ? 'bg-rose-500'
                  : budgetPerf && budgetPerf.utilizationPercent >= 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, budgetPerf?.utilizationPercent || 0)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {budgetPerf?.utilizationPercent.toFixed(0)}% {t.utilized}
          </span>
        </div>

        {/* Card 7: Savings Goal Progress */}
        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {t.savingsGoalProgress}
            </span>
            <Target className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            {primaryGoal ? displayAmount(primaryGoal.current_contribution_paise) : '₹0.00'}
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {goalProgress}% of {primaryGoal ? displayAmount(primaryGoal.target_amount_paise, true) : '₹0'}
          </span>
        </div>
      </div>

      {/* Smart Financial Insights Card */}
      {smartInsights.length > 0 && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-3.5">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t.smartInsights}</span>
          </div>
          <ul className="space-y-1.5">
            {smartInsights.slice(0, 2).map((insight, idx) => (
              <li
                key={idx}
                className="text-xs text-emerald-950 dark:text-emerald-100 flex items-start space-x-1.5"
              >
                <span className="text-emerald-500 font-bold">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Category-wise Expenditure Breakdown */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1">
            <PieIcon className="w-3.5 h-3.5" />
            <span>{t.categorySpending}</span>
          </h2>
          <button
            onClick={() => onNavigateToTab('reports')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center"
          >
            <span>{t.viewAll}</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        {financials.categorySpending.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            {t.noTransactions}
          </div>
        ) : (
          <div className="space-y-2.5">
            {financials.categorySpending.slice(0, 4).map((cat) => (
              <div key={cat.categoryId}>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {language === 'or' ? cat.categoryNameOr : cat.categoryNameEn}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {displayAmount(cat.totalPaise)} ({cat.percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${Math.min(100, cat.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.recentTransactions}
          </h2>
          <button
            onClick={() => onNavigateToTab('transactions')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center"
          >
            <span>{t.viewAll}</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-8">
            <Wallet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              {t.recordFirstTx}
            </p>
            <button
              onClick={() => onOpenQuickAdd('expense')}
              className="text-xs font-bold px-3 py-1.5 bg-emerald-600 text-white rounded-lg shadow-sm"
            >
              {t.addExpense}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {recentTransactions.map((tx) => {
              const cat = tx.category_id ? categoryMap.get(tx.category_id) : undefined;
              const isIncome = tx.transaction_type === 'income';
              const isRefund = tx.transaction_type === 'refund';
              const isTransfer = tx.transaction_type === 'transfer';
              const linkedAccount = tx.account_id ? accountMap.get(tx.account_id) : undefined;
              const isCash = linkedAccount?.account_type === 'cash';

              return (
                <div
                  key={tx.id}
                  onClick={() => setActiveTxDetail(tx)}
                  className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg px-1 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold ${
                        isIncome
                          ? 'bg-emerald-500'
                          : isRefund
                          ? 'bg-blue-500'
                          : isTransfer
                          ? 'bg-purple-500'
                          : 'bg-rose-500'
                      }`}
                    >
                      {isIncome ? '₹+' : isRefund ? '↺' : isTransfer ? '⇄' : '₹-'}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                        {tx.description || tx.merchant_or_source || (cat ? (language === 'or' ? cat.name_or : cat.name_en) : 'Transaction')}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{tx.transaction_date}</span>
                        <span>•</span>
                        {linkedAccount ? (
                          <span
                            className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold ${
                              isCash
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60'
                                : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60'
                            }`}
                          >
                            {isCash ? (
                              <Wallet className="w-2.5 h-2.5 shrink-0" />
                            ) : (
                              <Building2 className="w-2.5 h-2.5 shrink-0" />
                            )}
                            <span className="truncate max-w-[100px]">
                              {isCash ? (language === 'or' ? 'ନଗଦ' : 'Cash') : (linkedAccount.bank_name || linkedAccount.name)}
                            </span>
                            {linkedAccount.account_number && (
                              <span className="font-mono text-[9px] font-bold">
                                {linkedAccount.account_number}
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="uppercase font-medium">{tx.payment_method}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-xs font-bold ${
                        isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isRefund
                          ? 'text-blue-600 dark:text-blue-400'
                          : isTransfer
                          ? 'text-purple-600 dark:text-purple-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isIncome ? '+' : isRefund ? '+' : isTransfer ? '' : '-'}
                      {displayAmount(tx.amount_paise)}
                    </div>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {tx.transaction_type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transaction & Bank Details Modal */}
      {activeTxDetail && (() => {
        const detailAccount = activeTxDetail.account_id ? accountMap.get(activeTxDetail.account_id) : undefined;
        const isCashTx = detailAccount?.account_type === 'cash' || activeTxDetail.payment_method === 'cash';
        const isBankTx = !isCashTx;

        const bankName = detailAccount?.bank_name || detailAccount?.name || 'State Bank of India';
        const accNumber = detailAccount?.account_number || '**** 8923';
        const ifsc = detailAccount?.ifsc_code || 'SBIN0001234';
        const branch = detailAccount?.branch || 'Main Branch, Bhubaneswar';
        const accType = detailAccount?.account_type ? `${detailAccount.account_type.toUpperCase()} A/C` : 'SAVINGS A/C';

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3.5 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    {activeTxDetail.transaction_type === 'expense'
                      ? language === 'or' ? 'ଖର୍ଚ୍ଚ (Expenditure)' : 'Expenditure'
                      : activeTxDetail.transaction_type === 'income'
                      ? language === 'or' ? 'ଆୟ (Income)' : 'Income'
                      : activeTxDetail.transaction_type}
                  </span>
                  <div
                    className={`text-2xl font-black mt-0.5 ${
                      activeTxDetail.transaction_type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : activeTxDetail.transaction_type === 'refund'
                        ? 'text-blue-600 dark:text-blue-400'
                        : activeTxDetail.transaction_type === 'transfer'
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {activeTxDetail.transaction_type === 'income' ? '+' : activeTxDetail.transaction_type === 'refund' ? '+' : activeTxDetail.transaction_type === 'transfer' ? '' : '-'}
                    {displayAmount(activeTxDetail.amount_paise)}
                  </div>
                </div>
                <button
                  onClick={() => setActiveTxDetail(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dedicated Bank Details Card */}
              {isBankTx ? (
                <div className="rounded-xl p-3 bg-gradient-to-br from-blue-50/90 to-indigo-50/70 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800/60 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700 dark:text-blue-300">
                          {language === 'or' ? 'ବ୍ୟାଙ୍କ ବିବରଣୀ' : 'Bank Account Details'}
                        </span>
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">
                          {bankName}
                        </h4>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700">
                      {activeTxDetail.transaction_type === 'income'
                        ? language === 'or' ? 'ଜମା ହୋଇଛି ✓' : 'Credited ✓'
                        : language === 'or' ? 'ଡେବିଟ୍ ହୋଇଛି ✓' : 'Debited ✓'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-white/95 dark:bg-slate-900/90 p-2 rounded-lg border border-blue-100 dark:border-blue-900/60">
                      <span className="text-[10px] text-slate-500 block font-medium">
                        {language === 'or' ? 'ଖାତା ନମ୍ବର (Account No)' : 'Account Number'}
                      </span>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                          {accNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(accNumber, 'acc')}
                          title="Copy Account Number"
                          className="text-blue-600 hover:text-blue-700 p-0.5"
                        >
                          {copiedField === 'acc' ? (
                            <span className="text-[9px] font-bold text-emerald-600">Copied!</span>
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="bg-white/95 dark:bg-slate-900/90 p-2 rounded-lg border border-blue-100 dark:border-blue-900/60">
                      <span className="text-[10px] text-slate-500 block font-medium">
                        {language === 'or' ? 'ଆଇଏଫ୍ଏସ୍ସି କୋଡ୍' : 'IFSC Code'}
                      </span>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                          {ifsc}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(ifsc, 'ifsc')}
                          title="Copy IFSC Code"
                          className="text-blue-600 hover:text-blue-700 p-0.5"
                        >
                          {copiedField === 'ifsc' ? (
                            <span className="text-[9px] font-bold text-emerald-600">Copied!</span>
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-300 px-0.5 pt-0.5 border-t border-blue-100/60 dark:border-blue-900/40">
                    <span className="truncate max-w-[160px]">
                      📍 {branch}
                    </span>
                    <span className="font-semibold text-blue-700 dark:text-blue-300">
                      {accType} • {activeTxDetail.payment_method.toUpperCase()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl p-3 bg-gradient-to-br from-emerald-50/90 to-teal-50/70 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800/60 shadow-sm flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-300">
                        {language === 'or' ? 'ନଗଦ ଖାତା (Cash Account)' : 'Cash Account'}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {language === 'or' ? 'ନଗଦ ଟଙ୍କା (Cash in Hand)' : 'Cash in Hand'}
                      </h4>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300">
                    {activeTxDetail.transaction_type === 'income' ? 'Cash In' : 'Cash Out'}
                  </span>
                </div>
              )}

              {/* Details Rows */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">{t.description}:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {activeTxDetail.description || '—'}
                  </span>
                </div>
                {activeTxDetail.merchant_or_source && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payee / Source:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {activeTxDetail.merchant_or_source}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">{t.transactionDate}:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {activeTxDetail.transaction_date} {activeTxDetail.transaction_time || ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t.paymentMethod}:</span>
                  <span className="font-semibold text-slate-900 dark:text-white uppercase">
                    {activeTxDetail.payment_method}
                  </span>
                </div>
              </div>

              {/* View all button */}
              <button
                onClick={() => {
                  setActiveTxDetail(null);
                  onNavigateToTab('transactions');
                }}
                className="w-full py-2.5 text-xs font-bold rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 flex items-center justify-center space-x-1 transition-opacity"
              >
                <span>{language === 'or' ? 'ସମସ୍ତ ଲେନଦେନ ଦେଖନ୍ତୁ' : 'View in Full Transactions List'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
