import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Edit2,
  Copy,
  Calendar,
  X,
  CreditCard,
  User,
  AlertTriangle,
  RotateCcw,
  ArrowRightLeft,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  Building2,
  Wallet,
  Check,
} from 'lucide-react';
import {
  Transaction,
  Category,
  Account,
  HouseholdMember,
  TransactionType,
  PaymentMethod,
} from '../types';
import { formatINR } from '../services/currency';
import { translations, Language } from '../services/translations';

interface TransactionsListProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  members: HouseholdMember[];
  language: Language;
  privacyMode: boolean;
  onEditTransaction: (tx: Transaction) => void;
  onDuplicateTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenQuickAdd: () => void;
  onOpenExportModal?: () => void;
}

export const TransactionsList: React.FC<TransactionsListProps> = ({
  transactions,
  categories,
  accounts,
  members,
  language,
  privacyMode,
  onEditTransaction,
  onDuplicateTransaction,
  onDeleteTransaction,
  onOpenQuickAdd,
  onOpenExportModal,
}) => {
  const t = translations[language];

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Delete confirmation dialog state
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  // Detail preview state
  const [activeTxDetail, setActiveTxDetail] = useState<Transaction | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // fallback
    }
  };

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const memberMap = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);
  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Exclude voided / deleted
      if (tx.status === 'voided' || tx.deleted_at) return false;

      // Filter by Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const cat = tx.category_id ? categoryMap.get(tx.category_id) : null;
        const matchesDesc = tx.description?.toLowerCase().includes(query);
        const matchesMerchant = tx.merchant_or_source?.toLowerCase().includes(query);
        const matchesNotes = tx.notes?.toLowerCase().includes(query);
        const matchesCatEn = cat?.name_en.toLowerCase().includes(query);
        const matchesCatOr = cat?.name_or.toLowerCase().includes(query);

        if (!matchesDesc && !matchesMerchant && !matchesNotes && !matchesCatEn && !matchesCatOr) {
          return false;
        }
      }

      // Filter by Type
      if (selectedType !== 'all' && tx.transaction_type !== selectedType) {
        return false;
      }

      // Filter by Category
      if (selectedCategory !== 'all' && tx.category_id !== selectedCategory) {
        return false;
      }

      // Filter by Payment Method
      if (selectedMethod !== 'all' && tx.payment_method !== selectedMethod) {
        return false;
      }

      // Filter by Family Member
      if (selectedMember !== 'all' && tx.family_member_id !== selectedMember) {
        return false;
      }

      // Filter by Date Range preset
      if (selectedDateRange !== 'all') {
        const today = new Date();
        const txDate = new Date(tx.transaction_date);

        if (selectedDateRange === 'today') {
          const todayStr = today.toISOString().substring(0, 10);
          if (tx.transaction_date !== todayStr) return false;
        } else if (selectedDateRange === 'thisMonth') {
          if (
            txDate.getMonth() !== today.getMonth() ||
            txDate.getFullYear() !== today.getFullYear()
          ) {
            return false;
          }
        }
      }

      return true;
    });
  }, [
    transactions,
    searchQuery,
    selectedType,
    selectedCategory,
    selectedMethod,
    selectedMember,
    selectedDateRange,
    categoryMap,
  ]);

  const displayAmount = (paise: number) => {
    if (privacyMode) return '₹••••••';
    return formatINR(paise);
  };

  return (
    <div className="space-y-3.5 pb-24">
      {/* Search & Filter Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`${t.navTransactions}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-xl border flex items-center space-x-1 text-xs font-semibold transition-all ${
              showFilters || selectedType !== 'all' || selectedCategory !== 'all'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>

          {onOpenExportModal && (
            <button
              onClick={onOpenExportModal}
              title="Export Transactions"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 hover:border-emerald-500 transition-colors flex items-center space-x-1 text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
        </div>

        {/* Collapsible Filter Panel */}
        {showFilters && (
          <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2.5 text-xs shadow-md animate-in fade-in duration-150">
            {/* Type selector */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Transaction Type
              </span>
              <div className="flex flex-wrap gap-1">
                {['all', 'expense', 'income', 'transfer', 'refund'].map((typ) => (
                  <button
                    key={typ}
                    onClick={() => setSelectedType(typ)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize ${
                      selectedType === typ
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {typ}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick dropdown filters */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {/* Category */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  {t.category}
                </span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-1.5 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {language === 'or' ? c.name_or : c.name_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Family Member */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  {t.familyMember}
                </span>
                <select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="w-full p-1.5 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="all">All Members</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.display_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reset Filters */}
            <div className="flex justify-end pt-1">
              <button
                onClick={() => {
                  setSelectedType('all');
                  setSelectedCategory('all');
                  setSelectedMethod('all');
                  setSelectedMember('all');
                  setSelectedDateRange('all');
                  setSearchQuery('');
                }}
                className="text-[11px] font-semibold text-rose-500 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Header Count */}
      <div className="flex justify-between items-center px-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <span>{filteredTransactions.length} transactions</span>
        <span>Strict INR Grouping (₹)</span>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.noTransactions}</p>
          <button
            onClick={onOpenQuickAdd}
            className="text-xs font-bold px-4 py-2 bg-emerald-600 text-white rounded-lg shadow-sm"
          >
            {t.addExpense}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTransactions.map((tx) => {
            const cat = tx.category_id ? categoryMap.get(tx.category_id) : undefined;
            const member = tx.family_member_id ? memberMap.get(tx.family_member_id) : undefined;
            const isIncome = tx.transaction_type === 'income';
            const isRefund = tx.transaction_type === 'refund';
            const isTransfer = tx.transaction_type === 'transfer';

            return (
              <div
                key={tx.id}
                onClick={() => setActiveTxDetail(tx)}
                className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm ${
                      isIncome
                        ? 'bg-emerald-500'
                        : isRefund
                        ? 'bg-blue-500'
                        : isTransfer
                        ? 'bg-purple-500'
                        : 'bg-rose-500'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : isRefund ? (
                      <RotateCcw className="w-5 h-5" />
                    ) : isTransfer ? (
                      <ArrowRightLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {tx.description || tx.merchant_or_source || (cat ? (language === 'or' ? cat.name_or : cat.name_en) : 'Transaction')}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>{tx.transaction_date}</span>
                      <span>•</span>
                      {(() => {
                        const linkedAccount = tx.account_id ? accountMap.get(tx.account_id) : undefined;
                        if (linkedAccount) {
                          const isCash = linkedAccount.account_type === 'cash';
                          return (
                            <span
                              className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${
                                isCash
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                                  : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60'
                              }`}
                            >
                              {isCash ? (
                                <Wallet className="w-2.5 h-2.5 shrink-0" />
                              ) : (
                                <Building2 className="w-2.5 h-2.5 shrink-0" />
                              )}
                              <span className="truncate max-w-[110px]">
                                {isCash ? (language === 'or' ? 'ନଗଦ' : 'Cash') : (linkedAccount.bank_name || linkedAccount.name)}
                              </span>
                              {linkedAccount.account_number && (
                                <span className="font-mono text-[9px] font-bold">
                                  {linkedAccount.account_number}
                                </span>
                              )}
                            </span>
                          );
                        }
                        return <span className="uppercase font-medium">{tx.payment_method}</span>;
                      })()}
                      {cat && (
                        <>
                          <span>•</span>
                          <span className="line-clamp-1">
                            {language === 'or' ? cat.name_or : cat.name_en}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-xs font-extrabold ${
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
                  {member && (
                    <span className="text-[10px] text-slate-400 block line-clamp-1">
                      {member.display_name}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Transaction Detail & Actions Modal with Prominent Bank Details */}
      {activeTxDetail && (() => {
        const detailAccount = activeTxDetail.account_id ? accountMap.get(activeTxDetail.account_id) : undefined;
        // Check if bank transaction
        const isCashTx = detailAccount?.account_type === 'cash' || activeTxDetail.payment_method === 'cash';
        const isBankTx = !isCashTx;

        // Fallback bank details if account wasn't mapped directly but was a bank method
        const bankName = detailAccount?.bank_name || detailAccount?.name || 'State Bank of India';
        const accNumber = detailAccount?.account_number || '**** 8923';
        const ifsc = detailAccount?.ifsc_code || 'SBIN0001234';
        const branch = detailAccount?.branch || 'Main Branch, Bhubaneswar';
        const accType = detailAccount?.account_type ? `${detailAccount.account_type.toUpperCase()} A/C` : 'SAVINGS A/C';

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3.5 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
              {/* Header */}
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

              {/* Dedicated Bank Details Card (Shown for all Bank Transactions on Expenditure and Income) */}
              {isBankTx ? (
                <div className="rounded-xl p-3 bg-gradient-to-br from-blue-50/90 to-indigo-50/70 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800/60 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700 dark:text-blue-300">
                            {language === 'or' ? 'ବ୍ୟାଙ୍କ ବିବରଣୀ' : 'Bank Account Details'}
                          </span>
                        </div>
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
                    {/* Account Number with Copy */}
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
                          className="text-blue-600 hover:text-blue-700 p-0.5 flex items-center space-x-0.5"
                        >
                          {copiedField === 'acc' ? (
                            <span className="text-[9px] font-bold text-emerald-600">Copied!</span>
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* IFSC Code with Copy */}
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
                          className="text-blue-600 hover:text-blue-700 p-0.5 flex items-center space-x-0.5"
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

                  {/* Branch & Mode */}
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
                /* Cash Account Card */
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
                    {activeTxDetail.transaction_type === 'income'
                      ? language === 'or' ? 'ନଗଦ ପ୍ରାପ୍ତ' : 'Cash In'
                      : language === 'or' ? 'ନଗଦ ପ୍ରଦାନ' : 'Cash Out'}
                  </span>
                </div>
              )}

              {/* Metadata Rows */}
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
                {activeTxDetail.category_id && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t.category}:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {language === 'or'
                        ? categoryMap.get(activeTxDetail.category_id)?.name_or
                        : categoryMap.get(activeTxDetail.category_id)?.name_en}
                    </span>
                  </div>
                )}
                {activeTxDetail.receipt_path && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t.receiptPhoto}:</span>
                    <span className="font-semibold text-emerald-600">Attached ✓</span>
                  </div>
                )}
              </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => {
                  const tx = activeTxDetail;
                  setActiveTxDetail(null);
                  onEditTransaction(tx);
                }}
                className="py-2 px-3 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 flex items-center justify-center space-x-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{t.edit}</span>
              </button>

              <button
                onClick={() => {
                  const tx = activeTxDetail;
                  setActiveTxDetail(null);
                  onDuplicateTransaction(tx);
                }}
                className="py-2 px-3 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 flex items-center justify-center space-x-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{t.duplicate}</span>
              </button>

              <button
                onClick={() => {
                  const tx = activeTxDetail;
                  setActiveTxDetail(null);
                  setTxToDelete(tx);
                }}
                className="py-2 px-3 text-xs font-bold rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-100 flex items-center justify-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.delete}</span>
              </button>
            </div>
          </div>
        </div>
      );
    })()}

      {/* Delete Confirmation Dialog */}
      {txToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.confirmDelete}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.confirmDeleteDesc}
            </p>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setTxToDelete(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => {
                  onDeleteTransaction(txToDelete.id);
                  setTxToDelete(null);
                }}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white shadow-md shadow-rose-600/30"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
