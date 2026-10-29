import React, { useState } from 'react';
import {
  X,
  Plus,
  Building2,
  Wallet,
  CheckCircle,
  CreditCard,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import { Account, AccountType } from '../types';
import { StorageService } from '../services/storage';
import { formatINR } from '../services/currency';
import { Language } from '../services/translations';

interface BankAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onAccountAdded?: () => void;
}

const COMMON_INDIAN_BANKS = [
  'State Bank of India (SBI)',
  'HDFC Bank',
  'ICICI Bank',
  'Punjab National Bank (PNB)',
  'Bank of Baroda (BoB)',
  'Axis Bank',
  'Canara Bank',
  'Union Bank of India',
  'Kotak Mahindra Bank',
  'Indian Bank',
  'Odisha Gramya Bank',
  'Utkal Grameen Bank',
  'Other / Co-operative Bank',
];

export const BankAccountsModal: React.FC<BankAccountsModalProps> = ({
  isOpen,
  onClose,
  language,
  onAccountAdded,
}) => {
  const [accounts, setAccounts] = useState<Account[]>(() => StorageService.loadAccounts());
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New account form state
  const [name, setName] = useState('');
  const [bankName, setBankName] = useState(COMMON_INDIAN_BANKS[0]);
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [branch, setBranch] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('bank');
  const [openingBalanceRupees, setOpeningBalanceRupees] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(language === 'or' ? 'ଦୟାକରି ଖାତାର ନାମ ଦିଅନ୍ତୁ' : 'Please provide an account name');
      return;
    }

    const rupees = parseFloat(openingBalanceRupees) || 0;
    const paise = Math.round(rupees * 100);

    const formattedAccNum = accountNumber.trim()
      ? accountNumber.trim().length > 4
        ? `**** ${accountNumber.trim().slice(-4)}`
        : accountNumber.trim()
      : undefined;

    const newAccount: Account = {
      id: `acc-${Date.now()}`,
      household_id: 'hh-default',
      name: name.trim(),
      bank_name: accountType === 'cash' ? undefined : bankName,
      account_number: accountType === 'cash' ? undefined : formattedAccNum,
      ifsc_code: accountType === 'cash' ? undefined : ifscCode.trim().toUpperCase() || undefined,
      branch: accountType === 'cash' ? undefined : branch.trim() || undefined,
      account_type: accountType,
      opening_balance_paise: paise,
      currency_code: 'INR',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [...accounts, newAccount];
    setAccounts(updated);
    StorageService.saveAccounts(updated);

    // Reset form
    setName('');
    setAccountNumber('');
    setIfscCode('');
    setBranch('');
    setOpeningBalanceRupees('');
    setIsAddingNew(false);
    setError(null);
    onAccountAdded?.();
  };

  const handleDeleteAccount = (accId: string) => {
    if (accounts.length <= 1) {
      setError(
        language === 'or'
          ? 'ଅତିକମରେ ଗୋଟିଏ ଖାତା ରହିବା ଆବଶ୍ୟକ'
          : 'You must have at least one account'
      );
      return;
    }
    const updated = accounts.filter((a) => a.id !== accId);
    setAccounts(updated);
    StorageService.saveAccounts(updated);
    onAccountAdded?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <Building2 className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {language === 'or' ? 'ବ୍ୟାଙ୍କ ଓ ନଗଦ ଖାତା ପରିଚାଳନା' : 'Bank & Cash Accounts'}
              </h2>
              <p className="text-xs text-blue-200">
                {language === 'or'
                  ? 'ଖାତା ନମ୍ବର ସହିତ ବ୍ୟାଙ୍କ ଖାତା ଯୋଡ଼ନ୍ତୁ ଏବଂ ପରିଚାଳନା କରନ୍ତୁ'
                  : 'Manage your Bank Accounts & Cash in Hand'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Existing Accounts List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {language === 'or' ? 'ଉପଲବ୍ଧ ଖାତାଗୁଡ଼ିକ' : 'Configured Accounts'}
              </span>
              <button
                type="button"
                onClick={() => setIsAddingNew(!isAddingNew)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>
                  {isAddingNew
                    ? language === 'or'
                      ? 'ବାତିଲ କରନ୍ତୁ'
                      : 'Cancel'
                    : language === 'or'
                    ? '+ ନୂଆ ବ୍ୟାଙ୍କ ଯୋଡ଼ନ୍ତୁ'
                    : '+ Add Bank Account'}
                </span>
              </button>
            </div>

            {accounts.map((acc) => {
              const isCash = acc.account_type === 'cash';
              return (
                <div
                  key={acc.id}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between transition-all hover:border-blue-300 dark:hover:border-blue-700"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isCash
                          ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600'
                          : 'bg-blue-100 dark:bg-blue-950/50 text-blue-600'
                      }`}
                    >
                      {isCash ? (
                        <Wallet className="w-5 h-5" />
                      ) : (
                        <Building2 className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {acc.name}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isCash
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                          }`}
                        >
                          {isCash ? 'CASH' : 'BANK'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                        {acc.account_number && (
                          <span className="font-mono bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 rounded text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                            A/C: {acc.account_number}
                          </span>
                        )}
                        {acc.bank_name && !acc.name.includes(acc.bank_name) && (
                          <span>{acc.bank_name}</span>
                        )}
                        {acc.branch && <span>• {acc.branch}</span>}
                        {acc.ifsc_code && <span>• IFSC: {acc.ifsc_code}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">
                        {language === 'or' ? 'ପ୍ରାରମ୍ଭିକ ବଳକା' : 'Opening'}
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                        {formatINR(acc.opening_balance_paise)}
                      </div>
                    </div>

                    {accounts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAccount(acc.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add New Bank Account Form */}
          {isAddingNew && (
            <form
              onSubmit={handleCreateAccount}
              className="p-4 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-2xl space-y-3 animate-fade-in"
            >
              <div className="flex items-center space-x-2 text-blue-900 dark:text-blue-300 font-bold text-sm">
                <CreditCard className="w-4 h-4" />
                <span>
                  {language === 'or' ? 'ନୂଆ ବ୍ୟାଙ୍କ ଖାତା ଯୋଡ଼ନ୍ତୁ' : 'Add Bank or Cash Account'}
                </span>
              </div>

              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setAccountType('bank')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                    accountType === 'bank'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{language === 'or' ? 'ବ୍ୟାଙ୍କ ଖାତା' : 'Bank Account'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('cash')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                    accountType === 'cash'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>{language === 'or' ? 'ନଗଦ ଟଙ୍କା (Cash)' : 'Cash in Hand'}</span>
                </button>
              </div>

              {accountType === 'bank' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'or' ? 'ବ୍ୟାଙ୍କ ନାମ' : 'Bank Name'}
                    </label>
                    <select
                      value={bankName}
                      onChange={(e) => {
                        setBankName(e.target.value);
                        if (!name) setName(e.target.value.split(' ')[0] + ' Account');
                      }}
                      className="w-full text-xs font-semibold p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    >
                      {COMMON_INDIAN_BANKS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {language === 'or' ? 'ଖାତା ନମ୍ବର (Account No.)' : 'Account Number'}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 501004128923 or last 4 digits"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full text-xs font-mono p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {language === 'or' ? 'IFSC କୋଡ୍ (ଇଚ୍ଛାଧୀନ)' : 'IFSC Code (Optional)'}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. SBIN0001234"
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                        className="w-full text-xs font-mono uppercase p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'or' ? 'ବ୍ରାଞ୍ଚ (ଶାଖା)' : 'Branch Name (Optional)'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bhubaneswar Main / Saheed Nagar"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'or' ? 'ଡିସପ୍ଲେ ନାମ' : 'Account Display Name'} *
                </label>
                <input
                  type="text"
                  placeholder={
                    accountType === 'cash'
                      ? 'e.g. Cash in Hand / Wallet'
                      : 'e.g. SBI Salary Account'
                  }
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'or'
                    ? 'ପ୍ରାରମ୍ଭିକ ବଳକା (₹ ରେ)'
                    : 'Opening Balance in ₹ (Indian Rupees)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={openingBalanceRupees}
                    onChange={(e) => setOpeningBalanceRupees(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-blue-600/20"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{language === 'or' ? 'ଖାତା ସଂରକ୍ଷଣ କରନ୍ତୁ' : 'Save Account'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="py-2.5 px-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                >
                  {language === 'or' ? 'ବାତିଲ' : 'Cancel'}
                </button>
              </div>
            </form>
          )}

          {/* Privacy Note */}
          <div className="flex items-start space-x-2 p-3 bg-slate-100 dark:bg-slate-800/40 rounded-xl text-slate-500 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              {language === 'or'
                ? 'ଆପଣଙ୍କର ବ୍ୟାଙ୍କ ତଥ୍ୟ ସମ୍ପୂର୍ଣ୍ଣ ସୁରକ୍ଷିତ ଏବଂ କେବଳ ଆପଣଙ୍କ ମୋବାଇଲ ଫୋନରେ ସ୍ଥାନୀୟ ଭାବରେ ସଂରକ୍ଷିତ ରହିଥାଏ।'
                : '100% Offline & Private. Bank names and masked account numbers are stored strictly on your device for accurate expense tracking.'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl"
          >
            {language === 'or' ? 'ବନ୍ଦ କରନ୍ତୁ' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
