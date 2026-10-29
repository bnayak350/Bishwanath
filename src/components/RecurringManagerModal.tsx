import React, { useState } from 'react';
import { X, Plus, Repeat, Calendar, Check, Trash2 } from 'lucide-react';
import { RecurringRule, Category } from '../types';
import { formatINR, parseINRToPaise } from '../services/currency';
import { translations, Language } from '../services/translations';

interface RecurringManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  recurringRules: RecurringRule[];
  categories: Category[];
  onSaveRule: (rule: RecurringRule) => void;
  onDeleteRule: (id: string) => void;
  onRecordNow: (rule: RecurringRule) => void;
  language: Language;
}

export const RecurringManagerModal: React.FC<RecurringManagerModalProps> = ({
  isOpen,
  onClose,
  recurringRules,
  categories,
  onSaveRule,
  onDeleteRule,
  onRecordNow,
  language,
}) => {
  const t = translations[language];
  const [showAddForm, setShowAddForm] = useState(false);
  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [frequency, setFrequency] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [nextDue, setNextDue] = useState(new Date().toISOString().substring(0, 10));

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const parseRes = parseINRToPaise(amountStr);
    if (!parseRes.valid) return;

    const newRule: RecurringRule = {
      id: 'rec-' + Date.now(),
      household_id: 'hh-default',
      transaction_type: 'expense',
      amount_paise: parseRes.paise,
      category_id: categoryId,
      description: description.trim() || 'Recurring Bill',
      frequency,
      interval_count: 1,
      start_date: new Date().toISOString().substring(0, 10),
      next_due_date: nextDue,
      reminder_enabled: true,
      auto_record_enabled: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSaveRule(newRule);
    setDescription('');
    setAmountStr('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Repeat className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
              {t.recurringBills}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {recurringRules.map((rule) => {
            const cat = categories.find((c) => c.id === rule.category_id);
            return (
              <div
                key={rule.id}
                className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      {rule.description}
                    </h3>
                    <div className="text-[10px] text-slate-400 flex items-center space-x-1.5 mt-0.5">
                      <span className="capitalize">{rule.frequency}</span>
                      <span>•</span>
                      <span>Next due: {rule.next_due_date}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400 block">
                      {formatINR(rule.amount_paise)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <span className="text-[10px] text-slate-400">
                    {cat ? (language === 'or' ? cat.name_or : cat.name_en) : 'Expense'}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onRecordNow(rule)}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                    >
                      {t.recordNow}
                    </button>
                    <button
                      onClick={() => onDeleteRule(rule.id)}
                      className="p-1 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {showAddForm ? (
            <form onSubmit={handleCreate} className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-blue-500 space-y-3 text-xs shadow-md">
              <span className="font-bold text-slate-900 dark:text-white block">
                {t.addRecurring}
              </span>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jio WiFi, House Rent, Netflix"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-700 border rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Amount in ₹
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 799"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="w-full p-2 text-sm font-bold bg-slate-50 dark:bg-slate-700 border rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e: any) => setFrequency(e.target.value)}
                    className="w-full p-1.5 bg-slate-50 dark:bg-slate-700 border rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="monthly">{t.monthly}</option>
                    <option value="weekly">{t.weekly}</option>
                    <option value="yearly">{t.yearly}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Next Due Date
                  </label>
                  <input
                    type="date"
                    value={nextDue}
                    onChange={(e) => setNextDue(e.target.value)}
                    className="w-full p-1.5 bg-slate-50 dark:bg-slate-700 border rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

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
                  className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-lg"
                >
                  {t.save}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-2.5 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-blue-500 flex items-center justify-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addRecurring}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
