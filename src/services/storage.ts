/**
 * My Daily Khata – Offline-First Relational Local Storage Service
 * Handles state persistence, schema migrations, demo seeding, backup & restore, and cloud sync queue.
 */

import {
  Transaction,
  Category,
  Account,
  HouseholdMember,
  Budget,
  RecurringRule,
  SavingsGoal,
  AppSettings,
  SyncQueueItem,
} from '../types';
import { DEFAULT_CATEGORIES } from './defaultCategories';

const STORAGE_KEYS = {
  TRANSACTIONS: 'mdk_transactions_v1',
  CATEGORIES: 'mdk_categories_v1',
  ACCOUNTS: 'mdk_accounts_v1',
  MEMBERS: 'mdk_members_v1',
  BUDGETS: 'mdk_budgets_v1',
  RECURRING: 'mdk_recurring_v1',
  GOALS: 'mdk_goals_v1',
  SETTINGS: 'mdk_settings_v1',
  SYNC_QUEUE: 'mdk_sync_queue_v1',
  INITIALIZED: 'mdk_initialized_v1',
};

export const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: 'acc-cash',
    household_id: 'hh-default',
    name: 'Cash in Hand (ନଗଦ ଟଙ୍କା)',
    account_type: 'cash',
    opening_balance_paise: 500000, // ₹5,000 opening cash
    currency_code: 'INR',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'acc-bank-sbi',
    household_id: 'hh-default',
    name: 'State Bank of India (SBI)',
    bank_name: 'State Bank of India',
    account_number: '**** 8923',
    ifsc_code: 'SBIN0001234',
    branch: 'Main Branch, Bhubaneswar',
    account_type: 'bank',
    opening_balance_paise: 2500000, // ₹25,000 opening balance
    currency_code: 'INR',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'acc-bank-hdfc',
    household_id: 'hh-default',
    name: 'HDFC Bank',
    bank_name: 'HDFC Bank Ltd',
    account_number: '**** 4102',
    ifsc_code: 'HDFC0000456',
    branch: 'Saheed Nagar, Bhubaneswar',
    account_type: 'bank',
    opening_balance_paise: 1500000, // ₹15,000 opening balance
    currency_code: 'INR',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'acc-savings',
    household_id: 'hh-default',
    name: 'Emergency Savings (ICICI)',
    bank_name: 'ICICI Bank',
    account_number: '**** 6711',
    ifsc_code: 'ICIC0000789',
    branch: 'Janpath Branch',
    account_type: 'savings',
    opening_balance_paise: 5000000, // ₹50,000 savings
    currency_code: 'INR',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const DEFAULT_MEMBERS: HouseholdMember[] = [
  {
    id: 'mem-self',
    household_id: 'hh-default',
    display_name: 'Self (ନିଜେ)',
    role: 'owner',
    created_at: new Date().toISOString(),
  },
  {
    id: 'mem-spouse',
    household_id: 'hh-default',
    display_name: 'Spouse (ସ୍ତ୍ରୀ/ସ୍ୱାମୀ)',
    role: 'member',
    created_at: new Date().toISOString(),
  },
  {
    id: 'mem-parents',
    household_id: 'hh-default',
    display_name: 'Parents (ବାପା-ମାଆ)',
    role: 'member',
    created_at: new Date().toISOString(),
  },
  {
    id: 'mem-kids',
    household_id: 'hh-default',
    display_name: 'Kids (ପିଲାମାନେ)',
    role: 'member',
    created_at: new Date().toISOString(),
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  id: 'settings-1',
  user_id: 'user-default',
  language: 'en',
  theme: 'light',
  biometric_enabled: false,
  pin_hash: null,
  pin_salt: null,
  auto_lock_timeout_minutes: 5,
  notification_preferences: {
    budget_alerts: true,
    recurring_reminders: true,
    daily_summary: false,
  },
  cloud_backup_enabled: false,
  supabase_url: '',
  supabase_anon_key: '',
  last_backup_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

/**
 * Demo transactions reflecting typical Indian household scenarios
 */
export function getDemoTransactions(): Transaction[] {
  return [];
}

export const StorageService = {
  loadTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (!data) {
        this.saveTransactions([]);
        return [];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  clearAllTransactions(): void {
    this.saveTransactions([]);
  },

  saveTransactions(txs: Transaction[]): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
  },

  loadCategories(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!data) {
        this.saveCategories(DEFAULT_CATEGORIES);
        return DEFAULT_CATEGORIES;
      }
      const loaded: Category[] = JSON.parse(data);
      // Merge system categories if missing
      const existingIds = new Set(loaded.map((c) => c.id));
      const missing = DEFAULT_CATEGORIES.filter((c) => !existingIds.has(c.id));
      if (missing.length > 0) {
        const merged = [...loaded, ...missing];
        this.saveCategories(merged);
        return merged;
      }
      return loaded;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },

  saveCategories(cats: Category[]): void {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(cats));
  },

  loadAccounts(): Account[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (!data) {
        this.saveAccounts(DEFAULT_ACCOUNTS);
        return DEFAULT_ACCOUNTS;
      }
      const parsed: Account[] = JSON.parse(data);
      // Migrate existing accounts if account_number is missing
      const migrated = parsed.map((acc) => {
        if (acc.account_type === 'cash') {
          return { ...acc, name: acc.name.includes('Cash') ? acc.name : 'Cash in Hand (ନଗଦ ଟଙ୍କା)' };
        }
        if (!acc.account_number) {
          if (acc.name.includes('SBI')) {
            return { ...acc, bank_name: 'State Bank of India', account_number: '**** 8923', branch: 'Bhubaneswar' };
          } else if (acc.name.includes('HDFC')) {
            return { ...acc, bank_name: 'HDFC Bank Ltd', account_number: '**** 4102', branch: 'Bhubaneswar' };
          } else {
            return { ...acc, bank_name: acc.name, account_number: '**** 6711' };
          }
        }
        return acc;
      });
      return migrated;
    } catch {
      return DEFAULT_ACCOUNTS;
    }
  },

  saveAccounts(accounts: Account[]): void {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  },

  loadMembers(): HouseholdMember[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      if (!data) {
        this.saveMembers(DEFAULT_MEMBERS);
        return DEFAULT_MEMBERS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_MEMBERS;
    }
  },

  saveMembers(members: HouseholdMember[]): void {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  },

  loadBudgets(): Budget[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      if (!data) {
        const currentMonth = new Date().toISOString().substring(0, 7);
        const defaultBudgets: Budget[] = [
          {
            id: 'budget-overall',
            household_id: 'hh-default',
            period_type: 'monthly',
            month_str: currentMonth,
            start_date: `${currentMonth}-01`,
            end_date: `${currentMonth}-31`,
            amount_paise: 4000000, // ₹40,000 monthly household budget
            warning_threshold_percent: 80,
            critical_threshold_percent: 100,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'budget-food',
            household_id: 'hh-default',
            category_id: 'cat-exp-food',
            period_type: 'monthly',
            month_str: currentMonth,
            start_date: `${currentMonth}-01`,
            end_date: `${currentMonth}-31`,
            amount_paise: 1000000, // ₹10,000 for food
            warning_threshold_percent: 80,
            critical_threshold_percent: 100,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
        this.saveBudgets(defaultBudgets);
        return defaultBudgets;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveBudgets(budgets: Budget[]): void {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  },

  loadRecurringRules(): RecurringRule[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECURRING);
      if (!data) {
        const nextMonthDate = new Date();
        nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
        nextMonthDate.setDate(1);
        const nextDue = nextMonthDate.toISOString().substring(0, 10);

        const defaults: RecurringRule[] = [
          {
            id: 'rec-rent',
            household_id: 'hh-default',
            transaction_type: 'expense',
            amount_paise: 1800000, // ₹18,000
            category_id: 'cat-exp-rent',
            account_id: 'acc-bank-upi',
            description: 'House Rent to Landlord',
            frequency: 'monthly',
            interval_count: 1,
            start_date: '2026-01-01',
            next_due_date: nextDue,
            reminder_enabled: true,
            auto_record_enabled: false,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'rec-mobile',
            household_id: 'hh-default',
            transaction_type: 'expense',
            amount_paise: 79900, // ₹799
            category_id: 'cat-exp-mobile',
            account_id: 'acc-bank-upi',
            description: 'Jio / Airtel Fiber WiFi',
            frequency: 'monthly',
            interval_count: 1,
            start_date: '2026-01-10',
            next_due_date: nextDue,
            reminder_enabled: true,
            auto_record_enabled: false,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
        this.saveRecurringRules(defaults);
        return defaults;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveRecurringRules(rules: RecurringRule[]): void {
    localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(rules));
  },

  loadSavingsGoals(): SavingsGoal[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (!data) {
        const defaults: SavingsGoal[] = [
          {
            id: 'goal-emergency',
            household_id: 'hh-default',
            title: 'Family Emergency Fund (ଆପତକାଳୀନ ପାଣ୍ଠି)',
            target_amount_paise: 10000000, // ₹1,00,000
            current_contribution_paise: 5000000, // ₹50,000
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
        this.saveSavingsGoals(defaults);
        return defaults;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveSavingsGoals(goals: SavingsGoal[]): void {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  },

  loadSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) {
        this.saveSettings(DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
      }
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  loadSyncQueue(): SyncQueueItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveSyncQueue(queue: SyncQueueItem[]): void {
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
  },

  queueSync(operation: 'insert' | 'update' | 'delete', entityType: string, recordId: string, payload: any) {
    const queue = this.loadSyncQueue();
    const item: SyncQueueItem = {
      id: 'sync-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      record_id: recordId,
      operation_type: operation,
      entity_type: entityType,
      payload: JSON.stringify(payload),
      local_version: 1,
      retry_count: 0,
      created_at: new Date().toISOString(),
    };
    queue.push(item);
    this.saveSyncQueue(queue);
  },

  exportFullBackup(): string {
    const backup = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      app: 'My Daily Khata',
      currency: 'INR',
      data: {
        transactions: this.loadTransactions(),
        categories: this.loadCategories(),
        accounts: this.loadAccounts(),
        members: this.loadMembers(),
        budgets: this.loadBudgets(),
        recurringRules: this.loadRecurringRules(),
        savingsGoals: this.loadSavingsGoals(),
        settings: this.loadSettings(),
      },
    };
    return JSON.stringify(backup, null, 2);
  },

  restoreFullBackup(jsonStr: string): { success: boolean; error?: string } {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.data || !Array.isArray(parsed.data.transactions)) {
        return { success: false, error: 'Invalid backup format. Transactions missing.' };
      }
      this.saveTransactions(parsed.data.transactions);
      if (Array.isArray(parsed.data.categories)) this.saveCategories(parsed.data.categories);
      if (Array.isArray(parsed.data.accounts)) this.saveAccounts(parsed.data.accounts);
      if (Array.isArray(parsed.data.members)) this.saveMembers(parsed.data.members);
      if (Array.isArray(parsed.data.budgets)) this.saveBudgets(parsed.data.budgets);
      if (Array.isArray(parsed.data.recurringRules)) this.saveRecurringRules(parsed.data.recurringRules);
      if (Array.isArray(parsed.data.savingsGoals)) this.saveSavingsGoals(parsed.data.savingsGoals);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Malformed JSON backup file' };
    }
  },

  resetAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.MEMBERS);
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    localStorage.removeItem(STORAGE_KEYS.RECURRING);
    localStorage.removeItem(STORAGE_KEYS.GOALS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE);
    localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
  },
};
