import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  MinusCircle,
  ArrowRightLeft,
  RotateCcw,
  Calendar,
  Clock,
  Tag,
  CreditCard,
  User,
  Paperclip,
  Check,
  AlertCircle,
  Building2,
  Wallet,
} from 'lucide-react';
import {
  Transaction,
  Category,
  Account,
  HouseholdMember,
  PaymentMethod,
  TransactionType,
} from '../types';
import { parseINRToPaise } from '../services/currency';
import { translations, Language } from '../services/translations';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  accounts: Account[];
  members: HouseholdMember[];
  onSaveTransaction: (tx: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'version'>) => void;
  language: Language;
  defaultType?: TransactionType;
  editingTransaction?: Transaction | null;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  categories,
  accounts,
  members,
  onSaveTransaction,
  language,
  defaultType = 'expense',
  editingTransaction,
}) => {
  const t = translations[language];

  const todayStr = new Date().toISOString().substring(0, 10);
  const nowTime = new Date().toTimeString().substring(0, 5);

  const [txType, setTxType] = useState<TransactionType>(
    editingTransaction ? editingTransaction.transaction_type : defaultType
  );
  const [amountStr, setAmountStr] = useState<string>(
    editingTransaction ? (editingTransaction.amount_paise / 100).toString() : ''
  );
  const [date, setDate] = useState<string>(
    editingTransaction ? editingTransaction.transaction_date : todayStr
  );
  const [time, setTime] = useState<string>(
    editingTransaction?.transaction_time || nowTime
  );
  const [categoryId, setCategoryId] = useState<string>(
    editingTransaction?.category_id || ''
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    editingTransaction?.payment_method || 'upi'
  );
  const [accountId, setAccountId] = useState<string>(
    editingTransaction?.account_id || (accounts[0]?.id || '')
  );
  const [toAccountId, setToAccountId] = useState<string>(
    editingTransaction?.to_account_id || (accounts[1]?.id || '')
  );
  const [merchant, setMerchant] = useState<string>(
    editingTransaction?.merchant_or_source || ''
  );
  const [description, setDescription] = useState<string>(
    editingTransaction?.description || ''
  );
  const [notes, setNotes] = useState<string>(editingTransaction?.notes || '');
  const [familyMemberId, setFamilyMemberId] = useState<string>(
    editingTransaction?.family_member_id || (members[0]?.id || '')
  );
  const [hasReceipt, setHasReceipt] = useState<boolean>(
    Boolean(editingTransaction?.receipt_path)
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  // Filter categories by type
  const activeCategories = categories.filter((c) => {
    if (!c.is_active) return false;
    if (txType === 'expense' || txType === 'refund') return c.category_type === 'expense';
    if (txType === 'income') return c.category_type === 'income';
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate amount
    const parseResult = parseINRToPaise(amountStr);
    if (!parseResult.valid) {
      setErrorMessage(parseResult.error || t.errAmountRequired);
      return;
    }

    // Validate category (not strictly required for transfer)
    if (txType !== 'transfer' && !categoryId) {
      setErrorMessage(t.errCategoryRequired);
      return;
    }

    // Validate transfer accounts
    if (txType === 'transfer' && accountId === toAccountId) {
      setErrorMessage(t.errAccountMismatch);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      onSaveTransaction({
        household_id: 'hh-default',
        account_id: accountId || null,
        transaction_type: txType,
        amount_paise: parseResult.paise,
        transaction_date: date,
        transaction_time: time,
        category_id: txType === 'transfer' ? null : categoryId,
        payment_method: paymentMethod,
        merchant_or_source: merchant.trim(),
        description: description.trim() || merchant.trim() || (txType === 'transfer' ? 'Account Transfer' : 'Transaction'),
        notes: notes.trim(),
        family_member_id: familyMemberId || null,
        to_account_id: txType === 'transfer' ? toAccountId : null,
        receipt_path: hasReceipt ? 'receipt_' + Date.now() + '.jpg' : null,
        status: 'active',
        sync_status: 'pending',
        device_id: 'device-current',
      });

      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentMethods: { id: PaymentMethod; label: string }[] = [
    { id: 'upi', label: t.pmUpi },
    { id: 'cash', label: t.pmCash },
    { id: 'debit_card', label: t.pmDebitCard },
    { id: 'credit_card', label: t.pmCreditCard },
    { id: 'bank_transfer', label: t.pmBankTransfer },
    { id: 'other', label: t.pmOther },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {editingTransaction
              ? t.edit
              : txType === 'expense'
              ? t.addExpense
              : txType === 'income'
              ? t.addIncome
              : txType === 'transfer'
              ? t.addTransfer
              : t.recordRefund}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-5 py-4 space-y-4">
          {/* Transaction Type Segmented Switcher */}
          {!editingTransaction && (
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setTxType('expense');
                  setCategoryId('');
                }}
                className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1 transition-all ${
                  txType === 'expense'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <MinusCircle className="w-3.5 h-3.5" />
                <span>{t.typeExpense}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTxType('income');
                  setCategoryId('');
                }}
                className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1 transition-all ${
                  txType === 'income'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t.typeIncome}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTxType('transfer');
                  setCategoryId('');
                }}
                className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1 transition-all ${
                  txType === 'transfer'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>{t.typeTransfer}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTxType('refund');
                  setCategoryId('');
                }}
                className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1 transition-all ${
                  txType === 'refund'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.typeRefund}</span>
              </button>
            </div>
          )}

          {/* Amount in INR */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t.amountInINR} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                autoFocus
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => {
                  setAmountStr(e.target.value);
                  setErrorMessage(null);
                }}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 rounded-xl text-2xl font-extrabold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Bank Account / Cash Selector for Expense, Income, and Refund */}
          {txType !== 'transfer' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {txType === 'income'
                    ? language === 'or'
                      ? 'ଜମା ହେବା ଖାତା (ବ୍ୟାଙ୍କ କିମ୍ବା ନଗଦ)'
                      : 'Deposit To (Bank or Cash)'
                    : language === 'or'
                    ? 'ଖର୍ଚ୍ଚ ହୋଇଥିବା ଖାତା (ବ୍ୟାଙ୍କ କିମ୍ବା ନଗଦ)'
                    : 'Paid From (Bank or Cash)'}
                </label>
                <span className="text-[11px] font-medium text-slate-400">
                  {accounts.find((a) => a.id === accountId)?.account_number
                    ? `A/C: ${accounts.find((a) => a.id === accountId)?.account_number}`
                    : ''}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {accounts.map((acc) => {
                  const isSelected = accountId === acc.id;
                  const isCash = acc.account_type === 'cash';
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setAccountId(acc.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-start space-x-2 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 ring-1 ring-blue-500'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`p-1.5 rounded-lg shrink-0 ${
                          isCash
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60'
                        }`}
                      >
                        {isCash ? (
                          <Wallet className="w-4 h-4" />
                        ) : (
                          <Building2 className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {acc.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                          <span>
                            {isCash
                              ? language === 'or'
                                ? 'ନଗଦ'
                                : 'Cash'
                              : acc.bank_name || 'Bank'}
                          </span>
                          {acc.account_number && (
                            <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold truncate">
                              • {acc.account_number}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Bank Account Preview */}
              {(() => {
                const selectedAcc = accounts.find((a) => a.id === accountId);
                if (!selectedAcc || selectedAcc.account_type === 'cash') return null;
                return (
                  <div className="p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-xs space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-bold text-blue-900 dark:text-blue-200 flex items-center space-x-1">
                        <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{selectedAcc.bank_name || selectedAcc.name}</span>
                      </span>
                      <span className="font-mono font-bold text-blue-700 dark:text-blue-300">
                        A/C: {selectedAcc.account_number || '**** 8923'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                      <span>IFSC: {selectedAcc.ifsc_code || 'SBIN0001234'}</span>
                      <span className="truncate max-w-[160px]">{selectedAcc.branch || 'Main Branch'}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Transfer Accounts Row (if Transfer) */}
          {txType === 'transfer' && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800">
              <div>
                <label className="block text-xs font-bold text-purple-900 dark:text-purple-300 mb-1">
                  {t.fromAccount}
                </label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full text-xs font-medium p-2 bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} {acc.account_number ? `(${acc.account_number})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-900 dark:text-purple-300 mb-1">
                  {t.toAccount}
                </label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full text-xs font-medium p-2 bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} {acc.account_number ? `(${acc.account_number})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Category Chips (if not Transfer) */}
          {txType !== 'transfer' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.category} <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
                {activeCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategoryId(cat.id);
                      setErrorMessage(null);
                    }}
                    className={`px-2.5 py-1.5 text-xs rounded-lg font-medium transition-all ${
                      categoryId === cat.id
                        ? 'bg-emerald-600 text-white shadow-sm scale-105'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {language === 'or' ? cat.name_or : cat.name_en}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Payment Method Chips */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t.paymentMethod}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {paymentMethods.map((pm) => (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                    paymentMethod === pm.id
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {pm.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.transactionDate}
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.transactionTime}
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Description & Payee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {txType === 'income' ? t.sourceOfIncome : t.merchantOrPayee}
              </label>
              <input
                type="text"
                placeholder={txType === 'income' ? 'e.g. TCS / Freelance' : 'e.g. DMart, Petrol Pump'}
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.description}
              </label>
              <input
                type="text"
                placeholder="e.g. Dinner with family, vegetables"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Family Member Assignment & Receipt Attachment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.familyMember}
              </label>
              <select
                value={familyMemberId}
                onChange={(e) => setFamilyMemberId(e.target.value)}
                className="w-full text-xs font-medium p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.display_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.receiptPhoto}
              </label>
              <button
                type="button"
                onClick={() => setHasReceipt(!hasReceipt)}
                className={`w-full py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center space-x-1.5 transition-all ${
                  hasReceipt
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>{hasReceipt ? 'Receipt Attached ✓' : 'Attach Photo'}</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Footer Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{t.save}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
