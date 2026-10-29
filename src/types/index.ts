/**
 * My Daily Khata – Expense Tracker
 * Domain Types and Relational Schema Definitions
 */

export type TransactionType = 'income' | 'expense' | 'transfer' | 'refund';

export type PaymentMethod = 
  | 'cash' 
  | 'upi' 
  | 'debit_card' 
  | 'credit_card' 
  | 'bank_transfer' 
  | 'other';

export type AccountType = 'cash' | 'bank' | 'savings' | 'credit_card' | 'other';

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type SyncStatus = 'synced' | 'pending' | 'failed';

export interface User {
  id: string;
  display_name: string;
  preferred_language: 'en' | 'or';
  created_at: string;
  updated_at: string;
}

export interface Household {
  id: string;
  name: string;
  owner_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface HouseholdMember {
  id: string;
  household_id: string;
  user_id?: string | null;
  display_name: string;
  role: 'owner' | 'member' | 'viewer';
  created_at: string;
  archived_at?: string | null;
}

export interface Account {
  id: string;
  household_id: string;
  name: string;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  branch?: string;
  account_type: AccountType;
  opening_balance_paise: number; // Integer paise
  currency_code: 'INR';
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
}

export interface Category {
  id: string;
  household_id?: string | null;
  category_type: 'income' | 'expense';
  name_en: string;
  name_or: string;
  icon_key: string;
  is_system: boolean;
  is_active: boolean;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  household_id: string;
  account_id?: string | null;
  transaction_type: TransactionType;
  amount_paise: number; // Positive integer paise
  transaction_date: string; // ISO date YYYY-MM-DD
  transaction_time?: string; // HH:mm
  created_at: string;
  updated_at: string;
  category_id?: string | null;
  payment_method: PaymentMethod;
  merchant_or_source?: string;
  description: string;
  notes?: string;
  family_member_id?: string | null;
  transfer_group_id?: string | null;
  to_account_id?: string | null; // For transfers
  refund_of_transaction_id?: string | null;
  receipt_path?: string | null;
  recurring_rule_id?: string | null;
  status: 'active' | 'voided';
  deleted_at?: string | null;
  sync_status: SyncStatus;
  device_id: string;
  version: number;
}

export interface Budget {
  id: string;
  household_id: string;
  category_id?: string | null; // null for overall household budget
  family_member_id?: string | null;
  period_type: 'monthly' | 'weekly';
  month_str: string; // YYYY-MM
  start_date: string;
  end_date: string;
  amount_paise: number; // Positive integer paise
  warning_threshold_percent: number; // Default 80
  critical_threshold_percent: number; // Default 100
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecurringRule {
  id: string;
  household_id: string;
  transaction_type: TransactionType;
  amount_paise: number;
  category_id: string;
  account_id?: string | null;
  description: string;
  frequency: Frequency;
  interval_count: number;
  start_date: string;
  end_date?: string | null;
  next_due_date: string;
  reminder_enabled: boolean;
  auto_record_enabled: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavingsGoal {
  id: string;
  household_id: string;
  title: string;
  target_amount_paise: number;
  target_date?: string | null;
  current_contribution_paise: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Attachment {
  id: string;
  transaction_id: string;
  local_path: string;
  mime_type: string;
  file_size: number;
  created_at: string;
  upload_status: 'local' | 'synced';
}

export interface AppSettings {
  id: string;
  user_id: string;
  language: 'en' | 'or';
  theme: 'light' | 'dark' | 'system';
  biometric_enabled: boolean;
  pin_hash?: string | null;
  pin_salt?: string | null;
  auto_lock_timeout_minutes: number; // 0 for immediate, 1, 5, 15, or -1 for never
  notification_preferences: {
    budget_alerts: boolean;
    recurring_reminders: boolean;
    daily_summary: boolean;
  };
  cloud_backup_enabled: boolean;
  supabase_url?: string;
  supabase_anon_key?: string;
  last_backup_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SyncQueueItem {
  id: string;
  record_id: string;
  operation_type: 'insert' | 'update' | 'delete';
  entity_type: string;
  payload: string;
  local_version: number;
  server_version?: number;
  retry_count: number;
  last_error?: string | null;
  created_at: string;
}

export interface PeriodFinancials {
  totalIncomePaise: number;
  grossExpenditurePaise: number;
  eligibleRefundsPaise: number;
  netExpenditurePaise: number;
  netCashFlowPaise: number;
  savingsRatePercent: number | null; // null if income is 0
  averageDailyExpenditurePaise: number;
  transactionCount: number;
  highestExpenseTransaction?: Transaction;
  categorySpending: {
    categoryId: string;
    categoryNameEn: string;
    categoryNameOr: string;
    iconKey: string;
    totalPaise: number;
    percentage: number;
    count: number;
  }[];
  paymentMethodSpending: {
    method: PaymentMethod;
    totalPaise: number;
    percentage: number;
    count: number;
  }[];
}
