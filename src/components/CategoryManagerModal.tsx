import React, { useState } from 'react';
import { X, Plus, Archive, Check, Sparkles } from 'lucide-react';
import { Category } from '../types';
import { translations, Language } from '../services/translations';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSaveCategory: (cat: Category) => void;
  onToggleArchive: (catId: string) => void;
  language: Language;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSaveCategory,
  onToggleArchive,
  language,
}) => {
  const t = translations[language];
  const [tab, setTab] = useState<'expense' | 'income'>('expense');
  const [showAddForm, setShowAddForm] = useState(false);
  const [nameEn, setNameEn] = useState('');
  const [nameOr, setNameOr] = useState('');
  const [color, setColor] = useState('#10B981');

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.category_type === tab);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim()) return;

    const newCat: Category = {
      id: 'cat-custom-' + Date.now(),
      category_type: tab,
      name_en: nameEn.trim(),
      name_or: nameOr.trim() || nameEn.trim(),
      icon_key: 'tag',
      color,
      is_system: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSaveCategory(newCat);
    setNameEn('');
    setNameOr('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Category Management ({tab === 'expense' ? 'Expenses' : 'Income'})
          </h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex p-2 bg-slate-100 dark:bg-slate-800/80 gap-1 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setTab('expense')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              tab === 'expense'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Expense Categories
          </button>
          <button
            onClick={() => setTab('income')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              tab === 'income'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Income Categories
          </button>
        </div>

        {/* Body list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredCategories.map((c) => (
            <div
              key={c.id}
              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                c.is_active
                  ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 text-slate-400 line-through'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <div
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: c.color || '#10B981' }}
                />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {c.name_en}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {c.name_or}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                {c.is_system && (
                  <span className="text-[9px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                    System
                  </span>
                )}
                {!c.is_system && (
                  <button
                    onClick={() => onToggleArchive(c.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-600"
                    title={c.is_active ? 'Archive category' : 'Restore category'}
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add custom category form */}
          {showAddForm ? (
            <form onSubmit={handleCreate} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2 border">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Create Custom Category
              </span>
              <input
                type="text"
                placeholder="Name in English (e.g. Pet Care)"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                required
                className="w-full text-xs p-2 bg-white dark:bg-slate-700 border rounded-lg text-slate-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Name in Odia (e.g. ଗୃହପାଳିତ ପଶୁ ଯତ୍ନ)"
                value={nameOr}
                onChange={(e) => setNameOr(e.target.value)}
                className="w-full text-xs p-2 bg-white dark:bg-slate-700 border rounded-lg text-slate-900 dark:text-white"
              />
              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1 text-xs text-slate-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs font-bold bg-emerald-600 text-white rounded-lg"
                >
                  Create
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-emerald-500 flex items-center justify-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Category</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
