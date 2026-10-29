import React, { useState } from 'react';
import { X, Plus, Users, User, Shield } from 'lucide-react';
import { HouseholdMember } from '../types';
import { translations, Language } from '../services/translations';

interface FamilyManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: HouseholdMember[];
  onAddMember: (member: HouseholdMember) => void;
  language: Language;
}

export const FamilyManagerModal: React.FC<FamilyManagerModalProps> = ({
  isOpen,
  onClose,
  members,
  onAddMember,
  language,
}) => {
  const t = translations[language];
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'owner' | 'member' | 'viewer'>('member');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMember: HouseholdMember = {
      id: 'mem-' + Date.now(),
      household_id: 'hh-default',
      display_name: name.trim(),
      role,
      created_at: new Date().toISOString(),
    };

    onAddMember(newMember);
    setName('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-purple-600" />
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
              {t.familyManagement}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {members.map((m) => (
            <div
              key={m.id}
              className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold">
                  {m.display_name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {m.display_name}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize">
                    Role: {m.role}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {showAddForm ? (
            <form onSubmit={handleCreate} className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-purple-500 space-y-3 text-xs shadow-md">
              <span className="font-bold text-slate-900 dark:text-white block">
                {t.addFamilyMember}
              </span>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  {t.memberName}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Papa, Maa, Rahul, Priya"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-700 border rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  {t.role}
                </label>
                <select
                  value={role}
                  onChange={(e: any) => setRole(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-700 border rounded-lg text-slate-900 dark:text-white capitalize"
                >
                  <option value="owner">Owner</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
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
                  className="px-4 py-1.5 bg-purple-600 text-white font-bold rounded-lg"
                >
                  {t.save}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-2.5 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-purple-500 flex items-center justify-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addFamilyMember}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
