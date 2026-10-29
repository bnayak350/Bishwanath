/**
 * My Daily Khata – Automated Verification & QA Test Suite
 * Executes Section 13 test specifications with automated assertions and detailed log output.
 */

import { formatINR, parseINRToPaise } from './currency';
import { calculatePeriodFinancials, calculateBudgetPerformance } from './financialEngine';
import { Transaction, Category, Budget } from '../types';
import { DEFAULT_CATEGORIES } from './defaultCategories';

export interface TestCaseResult {
  id: string;
  section: string;
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  details?: string;
}

export interface TestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  results: TestCaseResult[];
  durationMs: number;
}

export function runAutomatedTests(): TestSuiteSummary {
  const startTime = performance.now();
  const results: TestCaseResult[] = [];

  function assert(
    id: string,
    section: string,
    name: string,
    condition: boolean,
    expected: string,
    actual: string,
    details?: string
  ) {
    results.push({
      id,
      section,
      name,
      passed: condition,
      expected,
      actual,
      details,
    });
  }

  // ==========================================
  // Section 13.1: Currency Tests
  // ==========================================
  assert(
    'curr-1000',
    '13.1 Currency',
    '₹1,000.00 formatting',
    formatINR(100000) === '₹1,000.00',
    '₹1,000.00',
    formatINR(100000)
  );

  assert(
    'curr-12500',
    '13.1 Currency',
    '₹12,500.00 formatting',
    formatINR(1250000) === '₹12,500.00',
    '₹12,500.00',
    formatINR(1250000)
  );

  assert(
    'curr-125000',
    '13.1 Currency',
    '₹1,25,000.00 formatting',
    formatINR(12500000) === '₹1,25,000.00',
    '₹1,25,000.00',
    formatINR(12500000)
  );

  assert(
    'curr-1234567',
    '13.1 Currency',
    '₹12,34,567.00 formatting',
    formatINR(123456700) === '₹12,34,567.00',
    '₹12,34,567.00',
    formatINR(123456700)
  );

  assert(
    'curr-123456789',
    '13.1 Currency',
    '₹12,34,56,789.00 formatting',
    formatINR(12345678900) === '₹12,34,56,789.00',
    '₹12,34,56,789.00',
    formatINR(12345678900)
  );

  assert(
    'curr-paise',
    '13.1 Currency',
    'Decimal paise preserved (₹12,500.50)',
    formatINR(1250050) === '₹12,500.50',
    '₹12,500.50',
    formatINR(1250050)
  );

  assert(
    'curr-negative',
    '13.1 Currency',
    'Negative cash flow labelled correctly (-₹5,000.00)',
    formatINR(-500000) === '-₹5,000.00',
    '-₹5,000.00',
    formatINR(-500000)
  );

  const sampleFormatted = formatINR(99999999);
  assert(
    'curr-no-foreign',
    '13.1 Currency',
    'No foreign currency symbols ($ or EUR)',
    !sampleFormatted.includes('$') && !sampleFormatted.includes('EUR') && !sampleFormatted.includes('USD'),
    'Contains only ₹ symbol',
    sampleFormatted
  );

  // Parse validation
  const parsedValid = parseINRToPaise('12500.50');
  assert(
    'curr-parse-valid',
    '13.1 Currency',
    'Parse valid Indian monetary input string',
    parsedValid.valid && parsedValid.paise === 1250050,
    '1250050 paise',
    `${parsedValid.paise} paise`
  );

  // ==========================================
  // Section 13.2: Financial Calculation Tests
  // ==========================================
  const mockCategories: Category[] = DEFAULT_CATEGORIES;

  const mockTxScenario: Transaction[] = [
    {
      id: 'tx-1',
      household_id: 'hh-1',
      transaction_type: 'income',
      amount_paise: 3000000, // ₹30,000
      transaction_date: '2026-10-10',
      category_id: 'cat-inc-salary',
      payment_method: 'bank_transfer',
      description: 'Monthly Salary',
      status: 'active',
      sync_status: 'synced',
      device_id: 'dev-1',
      version: 1,
      created_at: '2026-10-10T00:00:00Z',
      updated_at: '2026-10-10T00:00:00Z',
    },
    {
      id: 'tx-2',
      household_id: 'hh-1',
      transaction_type: 'expense',
      amount_paise: 250000, // ₹2,500
      transaction_date: '2026-10-12',
      category_id: 'cat-exp-food',
      payment_method: 'upi',
      description: 'Grocery shopping',
      status: 'active',
      sync_status: 'synced',
      device_id: 'dev-1',
      version: 1,
      created_at: '2026-10-12T00:00:00Z',
      updated_at: '2026-10-12T00:00:00Z',
    },
    {
      id: 'tx-3',
      household_id: 'hh-1',
      transaction_type: 'expense',
      amount_paise: 150000, // ₹1,500
      transaction_date: '2026-10-14',
      category_id: 'cat-exp-electricity',
      payment_method: 'upi',
      description: 'Electricity bill',
      status: 'active',
      sync_status: 'synced',
      device_id: 'dev-1',
      version: 1,
      created_at: '2026-10-14T00:00:00Z',
      updated_at: '2026-10-14T00:00:00Z',
    },
    {
      id: 'tx-4',
      household_id: 'hh-1',
      transaction_type: 'expense',
      amount_paise: 100000, // ₹1,000
      transaction_date: '2026-10-15',
      category_id: 'cat-exp-transport',
      payment_method: 'cash',
      description: 'Petrol fuel',
      status: 'active',
      sync_status: 'synced',
      device_id: 'dev-1',
      version: 1,
      created_at: '2026-10-15T00:00:00Z',
      updated_at: '2026-10-15T00:00:00Z',
    },
  ];

  const finStage1 = calculatePeriodFinancials(
    mockTxScenario,
    mockCategories,
    '2026-10-01',
    '2026-10-31'
  );

  assert(
    'calc-income',
    '13.2 Financial Calculation',
    'Total income = ₹30,000',
    finStage1.totalIncomePaise === 3000000,
    '₹30,000.00 (3000000 paise)',
    formatINR(finStage1.totalIncomePaise)
  );

  assert(
    'calc-gross-exp',
    '13.2 Financial Calculation',
    'Gross expenditure = ₹5,000',
    finStage1.grossExpenditurePaise === 500000,
    '₹5,000.00 (500000 paise)',
    formatINR(finStage1.grossExpenditurePaise)
  );

  assert(
    'calc-net-cashflow',
    '13.2 Financial Calculation',
    'Net cash flow = ₹25,000',
    finStage1.netCashFlowPaise === 2500000,
    '₹25,000.00 (2500000 paise)',
    formatINR(finStage1.netCashFlowPaise)
  );

  assert(
    'calc-savings-rate',
    '13.2 Financial Calculation',
    'Savings rate = approximately 83.33%',
    finStage1.savingsRatePercent !== null &&
      Math.abs(finStage1.savingsRatePercent - 83.333) < 0.05,
    '83.33%',
    `${finStage1.savingsRatePercent?.toFixed(2)}%`
  );

  // Add ₹500 linked refund to grocery
  const mockTxWithRefund: Transaction[] = [
    ...mockTxScenario,
    {
      id: 'tx-refund-1',
      household_id: 'hh-1',
      transaction_type: 'refund',
      amount_paise: 50000, // ₹500
      transaction_date: '2026-10-16',
      category_id: 'cat-exp-food',
      refund_of_transaction_id: 'tx-2',
      payment_method: 'upi',
      description: 'Grocery partial refund',
      status: 'active',
      sync_status: 'synced',
      device_id: 'dev-1',
      version: 1,
      created_at: '2026-10-16T00:00:00Z',
      updated_at: '2026-10-16T00:00:00Z',
    },
  ];

  const finStage2 = calculatePeriodFinancials(
    mockTxWithRefund,
    mockCategories,
    '2026-10-01',
    '2026-10-31',
    { useLinkedRefundPolicy: true }
  );

  assert(
    'calc-net-exp-refund',
    '13.2 Financial Calculation',
    'Net expenditure after ₹500 refund = ₹4,500',
    finStage2.netExpenditurePaise === 450000,
    '₹4,500.00 (450000 paise)',
    formatINR(finStage2.netExpenditurePaise)
  );

  assert(
    'calc-net-cashflow-refund',
    '13.2 Financial Calculation',
    'Net cash flow after ₹500 refund = ₹25,500',
    finStage2.netCashFlowPaise === 2550000,
    '₹25,500.00 (2550000 paise)',
    formatINR(finStage2.netCashFlowPaise)
  );

  assert(
    'calc-refund-not-income',
    '13.2 Financial Calculation',
    'Refund does NOT inflate Total Income (remains ₹30,000)',
    finStage2.totalIncomePaise === 3000000,
    '₹30,000.00',
    formatINR(finStage2.totalIncomePaise)
  );

  // ==========================================
  // Section 13.3: Budget Tests
  // ==========================================
  const mockBudget10k: Budget = {
    id: 'budget-1',
    household_id: 'hh-1',
    period_type: 'monthly',
    month_str: '2026-10',
    start_date: '2026-10-01',
    end_date: '2026-10-31',
    amount_paise: 1000000, // ₹10,000
    warning_threshold_percent: 80,
    critical_threshold_percent: 100,
    is_active: true,
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
  };

  // Test 80% utilization with ₹8,000 spend
  const tx8k: Transaction[] = [
    {
      id: 'tx-b-8k',
      household_id: 'hh-1',
      transaction_type: 'expense',
      amount_paise: 800000,
      transaction_date: '2026-10-05',
      payment_method: 'upi',
      description: 'Monthly expenses',
      status: 'active',
      sync_status: 'synced',
      device_id: 'dev-1',
      version: 1,
      created_at: '2026-10-05T00:00:00Z',
      updated_at: '2026-10-05T00:00:00Z',
    },
  ];
  const budgetPerf8k = calculateBudgetPerformance(mockBudget10k, tx8k);

  assert(
    'budget-80',
    '13.3 Budget Tests',
    '₹8,000 spend on ₹10,000 budget = 80% utilization',
    budgetPerf8k.utilizationPercent === 80 && budgetPerf8k.status === 'warning',
    '80% utilization (warning status)',
    `${budgetPerf8k.utilizationPercent}% (${budgetPerf8k.status})`
  );

  // Test 100% utilization with ₹10,000 spend
  const tx10k: Transaction[] = [
    {
      ...tx8k[0],
      amount_paise: 1000000,
    },
  ];
  const budgetPerf10k = calculateBudgetPerformance(mockBudget10k, tx10k);

  assert(
    'budget-100',
    '13.3 Budget Tests',
    '₹10,000 spend on ₹10,000 budget = 100% utilization',
    budgetPerf10k.utilizationPercent === 100 && budgetPerf10k.remainingBudgetPaise === 0,
    '100% utilization, remaining ₹0',
    `${budgetPerf10k.utilizationPercent}%, remaining ${formatINR(budgetPerf10k.remainingBudgetPaise)}`
  );

  // Test ₹12,000 spend -> ₹2,000 overspending
  const tx12k: Transaction[] = [
    {
      ...tx8k[0],
      amount_paise: 1200000,
    },
  ];
  const budgetPerf12k = calculateBudgetPerformance(mockBudget10k, tx12k);

  assert(
    'budget-overspent',
    '13.3 Budget Tests',
    '₹12,000 spend shows ₹2,000 overspending',
    budgetPerf12k.isOverspent && budgetPerf12k.remainingBudgetPaise === -200000,
    'Overspent by ₹2,000.00 (-200000 paise)',
    `Remaining: ${formatINR(budgetPerf12k.remainingBudgetPaise)}, isOverspent: ${budgetPerf12k.isOverspent}`
  );

  // Zero-value budget safety check
  const zeroBudget: Budget = {
    ...mockBudget10k,
    amount_paise: 0,
  };
  const budgetPerfZero = calculateBudgetPerformance(zeroBudget, tx8k);
  assert(
    'budget-zero-safe',
    '13.3 Budget Tests',
    'Zero-value budget does not throw division-by-zero error',
    !isNaN(budgetPerfZero.utilizationPercent) && isFinite(budgetPerfZero.utilizationPercent),
    'Safe finite number',
    `${budgetPerfZero.utilizationPercent}`
  );

  // ==========================================
  // Section 13.4: Transaction & Transfer Tests
  // ==========================================
  const transferTx: Transaction = {
    id: 'tx-trans-1',
    household_id: 'hh-1',
    transaction_type: 'transfer',
    amount_paise: 500000, // ₹5,000
    account_id: 'acc-bank',
    to_account_id: 'acc-cash',
    transaction_date: '2026-10-18',
    payment_method: 'bank_transfer',
    description: 'ATM Cash Withdrawal',
    status: 'active',
    sync_status: 'synced',
    device_id: 'dev-1',
    version: 1,
    created_at: '2026-10-18T00:00:00Z',
    updated_at: '2026-10-18T00:00:00Z',
  };

  const finWithTransfer = calculatePeriodFinancials(
    [...mockTxScenario, transferTx],
    mockCategories,
    '2026-10-01',
    '2026-10-31'
  );

  assert(
    'tx-transfer-excluded',
    '13.4 Transactions',
    'Transfers do not inflate income or expenditure',
    finWithTransfer.totalIncomePaise === 3000000 &&
      finWithTransfer.grossExpenditurePaise === 500000,
    'Income ₹30,000, Expense ₹5,000 unchanged',
    `Income ${formatINR(finWithTransfer.totalIncomePaise)}, Expense ${formatINR(finWithTransfer.grossExpenditurePaise)}`
  );

  // Voided transaction check
  const voidedExpense: Transaction = {
    id: 'tx-void-1',
    household_id: 'hh-1',
    transaction_type: 'expense',
    amount_paise: 99900,
    transaction_date: '2026-10-20',
    payment_method: 'cash',
    description: 'Accidental voided entry',
    status: 'voided', // VOIDED
    sync_status: 'synced',
    device_id: 'dev-1',
    version: 1,
    created_at: '2026-10-20T00:00:00Z',
    updated_at: '2026-10-20T00:00:00Z',
  };

  const finWithVoided = calculatePeriodFinancials(
    [...mockTxScenario, voidedExpense],
    mockCategories,
    '2026-10-01',
    '2026-10-31'
  );

  assert(
    'tx-voided-excluded',
    '13.4 Transactions',
    'Voided transactions are excluded from active totals',
    finWithVoided.grossExpenditurePaise === 500000,
    'Gross expenditure remains ₹5,000.00',
    formatINR(finWithVoided.grossExpenditurePaise)
  );

  const endTime = performance.now();
  const passed = results.filter((r) => r.passed).length;

  return {
    total: results.length,
    passed,
    failed: results.length - passed,
    results,
    durationMs: Math.round(endTime - startTime),
  };
}
