import React, { useState } from 'react';
import { X, Plus, Shield, AlertTriangle, Trash2 } from 'lucide-react';
import { Budget, Category } from '../types';
import { formatINR, parseINRToPaise } from '../services/currency';
import { translations, Language } from '../services/translations';

interface BudgetManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgets: Budget[];
  categories: Category[];
  onSaveBudget: (budget: Budget) => void;
  onDeleteBudget: (id: string) => void;
  language: Language;
}

export const BudgetManagerModal: React.FC<BudgetManagerModalProps> = ({
  isOpen,
  onClose,
  budgets,
  categories,
  onSaveBudget,
  onDeleteBudget,
  language,
}) => {
  const t = translations[language];
  const [showAddForm, setShowAddForm] = useState(false);
  const currentMonth = new Date().toISOString().substring(0, 7);

  const [selectedCategory, setSelectedCategory] = useState<string>('overall');
  const [amountStr, setAmountStr] = useState('');
  const [warningThreshold, setWarningThreshold] = useState(80);
  const [criticalThreshold, setCriticalThreshold] = useState(100);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const parseRes = parseINRToPaise(amountStr);
    if (!parseRes.valid) {
      setErrorMsg(parseRes.error || t.errAmountRequired);
      return;
    }

    const newBudget: Budget = {
      id: 'budget-' + Date.now(),
      household_id: 'hh-default',
      category_id: selectedCategory === 'overall' ? null : selectedCategory,
      period_type: 'monthly',
      month_str: currentMonth,
      start_date: `${currentMonth}-01`,
      end_date: `${currentMonth}-31`,
      amount_paise: parseRes.paise,
      warning_threshold_percent: warningThreshold,
      critical_threshold_percent: criticalThreshold,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSaveBudget(newBudget);
    setAmountStr('');
    setErrorMsg(null);
    setShowAddForm(false);
  };

  const expenseCategories = categories.filter((c) => c.category_type === 'expense' && c.is_active);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
              {t.budgetManagement}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Budgets List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {budgets.map((b) => {
            const cat = b.category_id ? categories.find((c) => c.id === b.category_id) : null;
            return (
              <div
                key={b.id}
                className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      {cat ? (language === 'or' ? cat.name_or : cat.name_en) : t.overallMonthlyBudget}
                    </h3>
                    <span className="text-[10px] text-slate-400">
                      {b.period_type} • Alerts at {b.warning_threshold_percent}% & {b.critical_threshold_percent}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatINR(b.amount_paise)}
                    </span>
                    <button
                      onClick={() => onDeleteBudget(b.id)}
                      className="p-1 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add form */}
          {showAddForm ? (
            <form onSubmit={handleCreate} className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-emerald-500 space-y-3 text-xs shadow-md">
              <span className="font-bold text-slate-900 dark:text-white block">
                {t.createBudget}
              </span>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Budget Target
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-700 border rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="overall">{t.overallMonthlyBudget}</option>
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {language === 'or' ? c.name_or : c.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  {t.budgetAmount}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 15000"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="w-full p-2 text-sm font-bold bg-slate-50 dark:bg-slate-700 border rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              {errorMsg && <p className="text-rose-500 text-[11px]">{errorMsg}</p>}

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-slate-500 font-semibold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded-lg"
                >
                  {t.save}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-2.5 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-emerald-500 flex items-center justify-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.createBudget}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
