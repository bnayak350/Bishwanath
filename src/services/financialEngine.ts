/**
 * My Daily Khata – Financial Calculation Engine
 * Pure, authoritative financial calculations using exact integer paise arithmetic.
 */

import { Transaction, Category, Account, PeriodFinancials, Budget } from '../types';

/**
 * Filter active (non-voided, non-deleted) transactions within a date range
 */
export function filterTransactionsByDate(
  transactions: Transaction[],
  startDate: string,
  endDate: string
): Transaction[] {
  return transactions.filter((tx) => {
    if (tx.status === 'voided' || tx.deleted_at) return false;
    return tx.transaction_date >= startDate && tx.transaction_date <= endDate;
  });
}

/**
 * Calculate financial totals and breakdowns for a given list of transactions in a date range
 */
export function calculatePeriodFinancials(
  transactions: Transaction[],
  categories: Category[],
  startDate: string,
  endDate: string,
  options?: {
    useLinkedRefundPolicy?: boolean;
    familyMemberId?: string | null;
  }
): PeriodFinancials {
  const categoryMap = new Map<string, Category>(categories.map((c) => [c.id, c]));

  // Filter relevant active transactions
  const filtered = transactions.filter((tx) => {
    if (tx.status === 'voided' || tx.deleted_at) return false;
    if (options?.familyMemberId && tx.family_member_id !== options.familyMemberId) return false;
    return tx.transaction_date >= startDate && tx.transaction_date <= endDate;
  });

  let totalIncomePaise = 0;
  let grossExpenditurePaise = 0;
  let eligibleRefundsPaise = 0;
  let highestExpenseTransaction: Transaction | undefined;

  const categorySpendingMap = new Map<string, { paise: number; count: number }>();
  const paymentMethodMap = new Map<string, { paise: number; count: number }>();

  for (const tx of filtered) {
    if (tx.transaction_type === 'income') {
      totalIncomePaise += tx.amount_paise;
    } else if (tx.transaction_type === 'expense') {
      grossExpenditurePaise += tx.amount_paise;

      if (!highestExpenseTransaction || tx.amount_paise > highestExpenseTransaction.amount_paise) {
        highestExpenseTransaction = tx;
      }

      // Aggregate category spending
      const catId = tx.category_id || 'uncategorized';
      const existingCat = categorySpendingMap.get(catId) || { paise: 0, count: 0 };
      categorySpendingMap.set(catId, {
        paise: existingCat.paise + tx.amount_paise,
        count: existingCat.count + 1,
      });

      // Aggregate payment method spending
      const pm = tx.payment_method || 'other';
      const existingPm = paymentMethodMap.get(pm) || { paise: 0, count: 0 };
      paymentMethodMap.set(pm, {
        paise: existingPm.paise + tx.amount_paise,
        count: existingPm.count + 1,
      });
    } else if (tx.transaction_type === 'refund') {
      eligibleRefundsPaise += tx.amount_paise;

      // In linked refund policy, adjust category spending if original expense category is known
      if (tx.category_id) {
        const existingCat = categorySpendingMap.get(tx.category_id);
        if (existingCat) {
          categorySpendingMap.set(tx.category_id, {
            paise: Math.max(0, existingCat.paise - tx.amount_paise),
            count: existingCat.count,
          });
        }
      }
    }
    // Note: 'transfer' transactions are deliberately excluded from income and expenditure!
  }

  // Net expenditure cannot drop below 0
  const netExpenditurePaise = Math.max(0, grossExpenditurePaise - eligibleRefundsPaise);
  const netCashFlowPaise = totalIncomePaise - netExpenditurePaise;

  // Savings rate = (Net Cash Flow / Total Income) * 100
  const savingsRatePercent =
    totalIncomePaise > 0 ? (netCashFlowPaise / totalIncomePaise) * 100 : null;

  // Calculate calendar days in period
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const daysInPeriod = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

  const averageDailyExpenditurePaise = Math.round(netExpenditurePaise / daysInPeriod);

  // Category breakdown list
  const categorySpending = Array.from(categorySpendingMap.entries())
    .map(([catId, data]) => {
      const cat = categoryMap.get(catId);
      const percentage =
        netExpenditurePaise > 0 ? (data.paise / netExpenditurePaise) * 100 : 0;
      return {
        categoryId: catId,
        categoryNameEn: cat ? cat.name_en : 'Other / Uncategorized',
        categoryNameOr: cat ? cat.name_or : 'ଅନ୍ୟାନ୍ୟ / ଅବର୍ଗୀକୃତ',
        iconKey: cat ? cat.icon_key : 'folder',
        totalPaise: data.paise,
        percentage,
        count: data.count,
      };
    })
    .sort((a, b) => b.totalPaise - a.totalPaise);

  // Payment method breakdown list
  const paymentMethodSpending = Array.from(paymentMethodMap.entries())
    .map(([method, data]) => {
      const percentage =
        netExpenditurePaise > 0 ? (data.paise / netExpenditurePaise) * 100 : 0;
      return {
        method: method as any,
        totalPaise: data.paise,
        percentage,
        count: data.count,
      };
    })
    .sort((a, b) => b.totalPaise - a.totalPaise);

  return {
    totalIncomePaise,
    grossExpenditurePaise,
    eligibleRefundsPaise,
    netExpenditurePaise,
    netCashFlowPaise,
    savingsRatePercent,
    averageDailyExpenditurePaise,
    transactionCount: filtered.length,
    highestExpenseTransaction,
    categorySpending,
    paymentMethodSpending,
  };
}

/**
 * Calculate Available Account Balance
 * Formula: Opening Balance + Credits - Debits
 */
export function calculateAccountBalance(
  account: Account,
  transactions: Transaction[]
): {
  openingBalancePaise: number;
  totalCreditsPaise: number;
  totalDebitsPaise: number;
  availableBalancePaise: number;
} {
  const activeTx = transactions.filter((tx) => tx.status !== 'voided' && !tx.deleted_at);

  let totalCreditsPaise = 0;
  let totalDebitsPaise = 0;

  for (const tx of activeTx) {
    // Direct income into this account
    if (tx.account_id === account.id && (tx.transaction_type === 'income' || tx.transaction_type === 'refund')) {
      totalCreditsPaise += tx.amount_paise;
    }
    // Direct expense from this account
    else if (tx.account_id === account.id && tx.transaction_type === 'expense') {
      totalDebitsPaise += tx.amount_paise;
    }
    // Transfer from this account (debit)
    else if (tx.transaction_type === 'transfer' && tx.account_id === account.id) {
      totalDebitsPaise += tx.amount_paise;
    }
    // Transfer into this account (credit)
    else if (tx.transaction_type === 'transfer' && tx.to_account_id === account.id) {
      totalCreditsPaise += tx.amount_paise;
    }
  }

  const availableBalancePaise =
    account.opening_balance_paise + totalCreditsPaise - totalDebitsPaise;

  return {
    openingBalancePaise: account.opening_balance_paise,
    totalCreditsPaise,
    totalDebitsPaise,
    availableBalancePaise,
  };
}

/**
 * Calculate Budget Performance
 * Formula: Remaining = Budget - Eligible Expenditure
 * Utilization % = (Expenditure / Budget) * 100
 */
export function calculateBudgetPerformance(
  budget: Budget,
  transactions: Transaction[]
): {
  budgetAmountPaise: number;
  eligibleExpenditurePaise: number;
  remainingBudgetPaise: number;
  utilizationPercent: number;
  isOverspent: boolean;
  status: 'normal' | 'warning' | 'critical' | 'exceeded';
} {
  const activeTx = transactions.filter((tx) => {
    if (tx.status === 'voided' || tx.deleted_at) return false;
    if (tx.transaction_date < budget.start_date || tx.transaction_date > budget.end_date)
      return false;
    if (budget.category_id && tx.category_id !== budget.category_id) return false;
    if (budget.family_member_id && tx.family_member_id !== budget.family_member_id) return false;
    return true;
  });

  let expensePaise = 0;
  let refundPaise = 0;

  for (const tx of activeTx) {
    if (tx.transaction_type === 'expense') {
      expensePaise += tx.amount_paise;
    } else if (tx.transaction_type === 'refund') {
      refundPaise += tx.amount_paise;
    }
  }

  const eligibleExpenditurePaise = Math.max(0, expensePaise - refundPaise);
  const remainingBudgetPaise = budget.amount_paise - eligibleExpenditurePaise;
  const isOverspent = remainingBudgetPaise < 0;

  const utilizationPercent =
    budget.amount_paise > 0
      ? (eligibleExpenditurePaise / budget.amount_paise) * 100
      : 0;

  let status: 'normal' | 'warning' | 'critical' | 'exceeded' = 'normal';
  if (utilizationPercent > 100) {
    status = 'exceeded';
  } else if (utilizationPercent >= budget.critical_threshold_percent) {
    status = 'critical';
  } else if (utilizationPercent >= budget.warning_threshold_percent) {
    status = 'warning';
  }

  return {
    budgetAmountPaise: budget.amount_paise,
    eligibleExpenditurePaise,
    remainingBudgetPaise,
    utilizationPercent,
    isOverspent,
    status,
  };
}

/**
 * Month-over-Month change formula
 * ((Current - Previous) / Previous) * 100
 */
export function calculateMoMChange(
  currentPaise: number,
  previousPaise: number
): {
  percentChange: number | null;
  differencePaise: number;
  isIncrease: boolean;
} {
  const differencePaise = currentPaise - previousPaise;
  if (previousPaise <= 0) {
    return {
      percentChange: null,
      differencePaise,
      isIncrease: differencePaise > 0,
    };
  }

  const percentChange = ((currentPaise - previousPaise) / previousPaise) * 100;
  return {
    percentChange,
    differencePaise,
    isIncrease: differencePaise > 0,
  };
}
