/**
 * My Daily Khata – English and Odia (ଓଡ଼ିଆ) Localization Dictionary
 * Complete, natural translations covering all UI screens, categories, reports, and alerts.
 */

export type Language = 'en' | 'or';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  // Navigation
  navHome: string;
  navTransactions: string;
  navAdd: string;
  navReports: string;
  navSettings: string;
  // Quick Add Menu
  addExpense: string;
  addIncome: string;
  addTransfer: string;
  recordRefund: string;
  // Dashboard Cards
  todayExpenditure: string;
  todayIncome: string;
  totalIncome: string;
  totalExpenditure: string;
  monthlyExpenditure: string;
  monthlyIncome: string;
  netCashFlow: string;
  budgetRemaining: string;
  savingsGoalProgress: string;
  recentTransactions: string;
  categorySpending: string;
  incomeVsExpense: string;
  dailySpendingTrend: string;
  highestCategory: string;
  budgetUtilization: string;
  smartInsights: string;
  quickActions: string;
  viewAll: string;
  noTransactions: string;
  recordFirstTx: string;
  // Periods
  today: string;
  yesterday: string;
  thisWeek: string;
  thisMonth: string;
  previousMonth: string;
  thisYear: string;
  customRange: string;
  // Transaction Fields
  amount: string;
  amountInINR: string;
  transactionDate: string;
  transactionTime: string;
  category: string;
  selectCategory: string;
  paymentMethod: string;
  selectPaymentMethod: string;
  account: string;
  fromAccount: string;
  toAccount: string;
  bankAccount: string;
  selectBankOrCash: string;
  cashInHand: string;
  accountNumber: string;
  bankName: string;
  addBankAccount: string;
  manageBankAccounts: string;
  merchantOrPayee: string;
  sourceOfIncome: string;
  description: string;
  notes: string;
  familyMember: string;
  selectFamilyMember: string;
  receiptPhoto: string;
  tags: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  duplicate: string;
  confirmDelete: string;
  confirmDeleteDesc: string;
  void: string;
  // Payment Methods
  pmCash: string;
  pmUpi: string;
  pmDebitCard: string;
  pmCreditCard: string;
  pmBankTransfer: string;
  pmOther: string;
  // Transaction Types
  typeIncome: string;
  typeExpense: string;
  typeTransfer: string;
  typeRefund: string;
  // Reports
  reportsAndAnalytics: string;
  dailyReport: string;
  weeklyReport: string;
  monthlyReport: string;
  yearlyReport: string;
  categoryReport: string;
  paymentMethodReport: string;
  budgetReport: string;
  familyReport: string;
  exportPdf: string;
  exportCsv: string;
  grossExpenditure: string;
  eligibleRefunds: string;
  netExpenditure: string;
  savingsRate: string;
  averageDaily: string;
  txCount: string;
  highestExpense: string;
  vsPrevPeriod: string;
  notAvailable: string;
  // Budgets
  budgetManagement: string;
  createBudget: string;
  editBudget: string;
  overallMonthlyBudget: string;
  categoryBudget: string;
  budgetAmount: string;
  utilized: string;
  remaining: string;
  overspentBy: string;
  alertAt80: string;
  alertAt100: string;
  // Recurring
  recurringBills: string;
  addRecurring: string;
  frequency: string;
  daily: string;
  weekly: string;
  monthly: string;
  yearly: string;
  nextDue: string;
  recordNow: string;
  // Family
  familyManagement: string;
  addFamilyMember: string;
  memberName: string;
  role: string;
  spendingByMember: string;
  // Settings & Security
  settings: string;
  appSecurity: string;
  pinLock: string;
  biometricUnlock: string;
  changePin: string;
  setPin: string;
  enterPin: string;
  confirmPin: string;
  pinMismatch: string;
  pinLengthNotice: string;
  autoLockTimeout: string;
  cloudBackup: string;
  cloudSyncStatus: string;
  syncNow: string;
  lastBackup: string;
  fullDataBackup: string;
  restoreData: string;
  exportAllData: string;
  deleteLocalData: string;
  theme: string;
  language: string;
  english: string;
  odia: string;
  appVersion: string;
  runQATests: string;
  viewFlutterSource: string;
  privacyMode: string;
  // Validation
  errAmountRequired: string;
  errCategoryRequired: string;
  errAccountMismatch: string;
  savedSuccess: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    appName: 'My Khata',
    tagline: 'Track • Save • Grow',
    navHome: 'Home',
    navTransactions: 'Transactions',
    navAdd: 'Add',
    navReports: 'Reports',
    navSettings: 'Settings',
    addExpense: 'Add Expense',
    addIncome: 'Add Income',
    addTransfer: 'Add Transfer',
    recordRefund: 'Record Refund',
    todayExpenditure: "Today's Expenditure",
    todayIncome: "Today's Income",
    totalIncome: 'Total Income',
    totalExpenditure: 'Total Expenditure',
    monthlyExpenditure: 'Monthly Expenditure',
    monthlyIncome: 'Monthly Income',
    netCashFlow: 'Net Cash Flow',
    budgetRemaining: 'Budget Remaining',
    savingsGoalProgress: 'Savings Goal Progress',
    recentTransactions: 'Recent Transactions',
    categorySpending: 'Category-wise Expenditure',
    incomeVsExpense: 'Income vs Expenditure',
    dailySpendingTrend: 'Daily Spending Trend',
    highestCategory: 'Highest Spending Category',
    budgetUtilization: 'Month-to-Date Budget Utilization',
    smartInsights: 'Smart Financial Insights',
    quickActions: 'Quick Entry',
    viewAll: 'View All',
    noTransactions: 'No transactions found',
    recordFirstTx: 'Record your first transaction to get started',
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    previousMonth: 'Previous Month',
    thisYear: 'This Year',
    customRange: 'Custom Range',
    amount: 'Amount',
    amountInINR: 'Amount in ₹',
    transactionDate: 'Date',
    transactionTime: 'Time',
    category: 'Category',
    selectCategory: 'Select Category',
    paymentMethod: 'Payment Method',
    selectPaymentMethod: 'Select Payment Method',
    account: 'Bank Account / Cash',
    fromAccount: 'Paid From (Bank / Cash)',
    toAccount: 'Transfer To (Bank / Cash)',
    bankAccount: 'Bank Account',
    selectBankOrCash: 'Select Bank Account or Cash',
    cashInHand: 'Cash in Hand (Cash)',
    accountNumber: 'Account Number',
    bankName: 'Bank Name',
    addBankAccount: 'Add Bank Account',
    manageBankAccounts: 'Bank & Cash Accounts',
    merchantOrPayee: 'Merchant / Payee',
    sourceOfIncome: 'Source of Income',
    description: 'Description',
    notes: 'Notes / Remarks',
    familyMember: 'Family Member',
    selectFamilyMember: 'Assign Family Member (Optional)',
    receiptPhoto: 'Receipt Photo',
    tags: 'Tags',
    save: 'Save Transaction',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    duplicate: 'Duplicate',
    confirmDelete: 'Delete Transaction?',
    confirmDeleteDesc: 'Are you sure you want to delete this transaction? All reports and balances will recalculate immediately.',
    void: 'Void',
    pmCash: 'Cash',
    pmUpi: 'UPI',
    pmDebitCard: 'Debit Card',
    pmCreditCard: 'Credit Card',
    pmBankTransfer: 'Bank Transfer',
    pmOther: 'Other',
    typeIncome: 'Income',
    typeExpense: 'Expense',
    typeTransfer: 'Transfer',
    typeRefund: 'Refund',
    reportsAndAnalytics: 'Reports & Analytics',
    dailyReport: 'Daily Report',
    weeklyReport: 'Weekly Report',
    monthlyReport: 'Monthly Report',
    yearlyReport: 'Yearly Report',
    categoryReport: 'Category Report',
    paymentMethodReport: 'Payment Method Report',
    budgetReport: 'Budget Report',
    familyReport: 'Family Member Report',
    exportPdf: 'Download PDF Report',
    exportCsv: 'Export CSV',
    grossExpenditure: 'Gross Expenditure',
    eligibleRefunds: 'Eligible Refunds',
    netExpenditure: 'Net Expenditure',
    savingsRate: 'Savings Rate',
    averageDaily: 'Average Daily Spend',
    txCount: 'Total Transactions',
    highestExpense: 'Highest Single Expense',
    vsPrevPeriod: 'vs Previous Period',
    notAvailable: 'Not available',
    budgetManagement: 'Budget Management',
    createBudget: 'Create Budget',
    editBudget: 'Edit Budget',
    overallMonthlyBudget: 'Overall Household Budget',
    categoryBudget: 'Category-specific Budget',
    budgetAmount: 'Budget Amount in ₹',
    utilized: 'Utilized',
    remaining: 'Remaining',
    overspentBy: 'Overspent by',
    alertAt80: '80% Warning Threshold',
    alertAt100: '100% Critical Threshold',
    recurringBills: 'Recurring Bills & Subscriptions',
    addRecurring: 'Add Recurring Rule',
    frequency: 'Frequency',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
    nextDue: 'Next Due Date',
    recordNow: 'Record Today',
    familyManagement: 'Family & Household',
    addFamilyMember: 'Add Family Member',
    memberName: 'Member Name',
    role: 'Role',
    spendingByMember: 'Spending by Family Member',
    settings: 'Settings & Security',
    appSecurity: 'Security & App Lock',
    pinLock: '4-Digit PIN Lock',
    biometricUnlock: 'Biometric / Face / Fingerprint',
    changePin: 'Change PIN',
    setPin: 'Set App PIN',
    enterPin: 'Enter 4-Digit Security PIN',
    confirmPin: 'Confirm PIN',
    pinMismatch: 'PINs do not match. Try again.',
    pinLengthNotice: 'Please enter a 4-digit numeric PIN',
    autoLockTimeout: 'Auto-Lock Timeout',
    cloudBackup: 'Supabase Cloud Backup (Optional)',
    cloudSyncStatus: 'Sync Status',
    syncNow: 'Sync Pending Changes',
    lastBackup: 'Last Successful Backup',
    fullDataBackup: 'Backup Data (JSON)',
    restoreData: 'Restore Backup',
    exportAllData: 'Export All Transactions',
    deleteLocalData: 'Reset Local Database',
    theme: 'App Appearance',
    language: 'App Language',
    english: 'English',
    odia: 'ଓଡ଼ିଆ (Odia)',
    appVersion: 'App Version & Diagnostic Info',
    runQATests: 'Run Automated QA Tests',
    viewFlutterSource: 'Export Flutter Source & Supabase SQL',
    privacyMode: 'Privacy Mode (Hide Balance)',
    errAmountRequired: 'Please enter a valid amount greater than ₹0',
    errCategoryRequired: 'Please choose a category',
    errAccountMismatch: 'Transfer source and destination must be different',
    savedSuccess: 'Transaction saved successfully! Balances updated.',
  },
  or: {
    appName: 'ମୋ ଖାତା',
    tagline: 'ଟ୍ରାକ୍ • ସଞ୍ଚୟ • ବୃଦ୍ଧି (Track • Save • Grow)',
    navHome: 'ମୁଖ୍ୟ ପୃଷ୍ଠା',
    navTransactions: 'ଲେନଦେନ',
    navAdd: 'ଯୋଡ଼ନ୍ତୁ',
    navReports: 'ରିପୋର୍ଟ',
    navSettings: 'ସେଟିଙ୍ଗ୍',
    addExpense: 'ଖର୍ଚ୍ଚ ଯୋଡ଼ନ୍ତୁ',
    addIncome: 'ଆୟ ଯୋଡ଼ନ୍ତୁ',
    addTransfer: 'ଟ୍ରାନ୍ସଫର ଯୋଡ଼ନ୍ତୁ',
    recordRefund: 'ଫେରସ୍ତ ରେକର୍ଡ କରନ୍ତୁ',
    todayExpenditure: 'ଆଜିର ଖର୍ଚ୍ଚ',
    todayIncome: 'ଆଜିର ଆୟ',
    totalIncome: 'ମୋଟ ଆୟ',
    totalExpenditure: 'ମୋଟ ଖର୍ଚ୍ଚ',
    monthlyExpenditure: 'ମାସିକ ଖର୍ଚ୍ଚ',
    monthlyIncome: 'ମାସିକ ଆୟ',
    netCashFlow: 'ଶୁଦ୍ଧ ନଗଦ ପ୍ରବାହ',
    budgetRemaining: 'ବାକି ବଜେଟ୍',
    savingsGoalProgress: 'ସଞ୍ଚୟ ଲକ୍ଷ୍ୟ ପ୍ରଗତି',
    recentTransactions: 'ସଦ୍ୟତମ ଲେନଦେନ',
    categorySpending: 'ବର୍ଗ ଅନୁଯାୟୀ ଖର୍ଚ୍ଚ',
    incomeVsExpense: 'ଆୟ ବନାମ ଖର୍ଚ୍ଚ',
    dailySpendingTrend: 'ଦୈନିକ ଖର୍ଚ୍ଚ ଧାରା',
    highestCategory: 'ସର୍ବାଧିକ ଖର୍ଚ୍ଚ ହୋଇଥିବା ବର୍ଗ',
    budgetUtilization: 'ମାସିକ ବଜେଟ୍ ବ୍ୟବହାର',
    smartInsights: 'ସ୍ମାର୍ଟ ଆର୍ଥିକ ବିଶ୍ଳେଷଣ',
    quickActions: 'ଶୀଘ୍ର ଯୋଡ଼ନ୍ତୁ',
    viewAll: 'ସବୁ ଦେଖନ୍ତୁ',
    noTransactions: 'କୌଣସି ଲେନଦେନ ନାହିଁ',
    recordFirstTx: 'ପ୍ରଥମ ଲେନଦେନ ରେକର୍ଡ କରି ଆରମ୍ଭ କରନ୍ତୁ',
    today: 'ଆଜି',
    yesterday: 'ଗତକାଲି',
    thisWeek: 'ଚଳିତ ସପ୍ତାହ',
    thisMonth: 'ଚଳିତ ମାସ',
    previousMonth: 'ପୂର୍ବ ମାସ',
    thisYear: 'ଚଳିତ ବର୍ଷ',
    customRange: 'ନିର୍ଦ୍ଦିଷ୍ଟ ତାରିଖ ସୀମା',
    amount: 'ପରିମାଣ',
    amountInINR: 'ପରିମାଣ (₹ ରେ)',
    transactionDate: 'ତାରିଖ',
    transactionTime: 'ସମୟ',
    category: 'ବର୍ଗ (କାଟେଗୋରୀ)',
    selectCategory: 'ବର୍ଗ ବାଛନ୍ତୁ',
    paymentMethod: 'ଦେୟ ପଦ୍ଧତି',
    selectPaymentMethod: 'ଦେୟ ପଦ୍ଧତି ବାଛନ୍ତୁ',
    account: 'ବ୍ୟାଙ୍କ ଖାତା / ନଗଦ (Cash)',
    fromAccount: 'ଏହି ଖାତାରୁ (ବ୍ୟାଙ୍କ / କ୍ୟାସ୍)',
    toAccount: 'ଏହି ଖାତାକୁ (ବ୍ୟାଙ୍କ / କ୍ୟାସ୍)',
    bankAccount: 'ବ୍ୟାଙ୍କ ଖାତା',
    selectBankOrCash: 'ବ୍ୟାଙ୍କ ଖାତା କିମ୍ବା ନଗଦ ବାଛନ୍ତୁ',
    cashInHand: 'ନଗଦ ଟଙ୍କା (Cash in Hand)',
    accountNumber: 'ଖାତା ନମ୍ବର (Account No.)',
    bankName: 'ବ୍ୟାଙ୍କ ନାମ',
    addBankAccount: 'ନୂତନ ବ୍ୟାଙ୍କ ଖାତା ଯୋଡ଼ନ୍ତୁ',
    manageBankAccounts: 'ବ୍ୟାଙ୍କ ଏବଂ ନଗଦ ଖାତା',
    merchantOrPayee: 'ବ୍ୟବସାୟୀ / ପ୍ରାପକ',
    sourceOfIncome: 'ଆୟର ଉତ୍ସ',
    description: 'ବିବରଣୀ',
    notes: 'ଟିପ୍ପଣୀ',
    familyMember: 'ପରିବାର ସଦସ୍ୟ',
    selectFamilyMember: 'ସଦସ୍ୟ ଚୟନ କରନ୍ତୁ (ଇଚ୍ଛାଧୀନ)',
    receiptPhoto: 'ରସିଦ ଫଟୋ',
    tags: 'ଟ୍ୟାଗ୍',
    save: 'ସଂରକ୍ଷଣ କରନ୍ତୁ',
    cancel: 'ବାତିଲ୍ କରନ୍ତୁ',
    delete: 'ଡିଲିଟ୍ କରନ୍ତୁ',
    edit: 'ସଂଶୋଧନ',
    duplicate: 'ନକଲ କରନ୍ତୁ',
    confirmDelete: 'ଲେନଦେନ ଡିଲିଟ୍ କରିବେ କି?',
    confirmDeleteDesc: 'ଆପଣ ନିଶ୍ଚିତ କି ଏହି ଲେନଦେନକୁ ଡିଲିଟ୍ କରିବାକୁ ଚାହାଁନ୍ତି? ସମସ୍ତ ରିପୋର୍ଟ ତୁରନ୍ତ ପୁନଃଗଣନା ହେବ।',
    void: 'ବାତିଲ',
    pmCash: 'ନଗଦ (Cash)',
    pmUpi: 'ୟୁପିଆଇ (UPI)',
    pmDebitCard: 'ଡେବିଟ୍ କାର୍ଡ',
    pmCreditCard: 'କ୍ରେଡିଟ୍ କାର୍ଡ',
    pmBankTransfer: 'ବ୍ୟାଙ୍କ ଟ୍ରାନ୍ସଫର',
    pmOther: 'ଅନ୍ୟାନ୍ୟ',
    typeIncome: 'ଆୟ',
    typeExpense: 'ଖର୍ଚ୍ଚ',
    typeTransfer: 'ଟ୍ରାନ୍ସଫର',
    typeRefund: 'ଫେରସ୍ତ (Refund)',
    reportsAndAnalytics: 'ରିପୋର୍ଟ ଏବଂ ବିଶ୍ଳେଷଣ',
    dailyReport: 'ଦୈନିକ ରିପୋର୍ଟ',
    weeklyReport: 'ସାପ୍ତାହିକ ରିପୋର୍ଟ',
    monthlyReport: 'ମାସିକ ରିପୋର୍ଟ',
    yearlyReport: 'ବାର୍ଷିକ ରିପୋର୍ଟ',
    categoryReport: 'ବର୍ଗ ରିପୋର୍ଟ',
    paymentMethodReport: 'ଦେୟ ପଦ୍ଧତି ରିପୋର୍ଟ',
    budgetReport: 'ବଜେଟ୍ ରିପୋର୍ଟ',
    familyReport: 'ପରିବାର ସଦସ୍ୟ ରିପୋର୍ଟ',
    exportPdf: 'ପିଡିଏଫ୍ (PDF) ଡାଉନଲୋଡ୍ କରନ୍ତୁ',
    exportCsv: 'ସିଏସଭି (CSV) ଏକ୍ସପୋର୍ଟ',
    grossExpenditure: 'ମୋଟ ଖର୍ଚ୍ଚ',
    eligibleRefunds: 'ଯୋଗ୍ୟ ଫେରସ୍ତ',
    netExpenditure: 'ଶୁଦ୍ଧ ଖର୍ଚ୍ଚ',
    savingsRate: 'ସଞ୍ଚୟ ହାର',
    averageDaily: 'ଦୈନିକ ହାରାହାରି ଖର୍ଚ୍ଚ',
    txCount: 'ମୋଟ ଲେନଦେନ ସଂଖ୍ୟା',
    highestExpense: 'ସର୍ବାଧିକ ଏକକ ଖର୍ଚ୍ଚ',
    vsPrevPeriod: 'ପୂର୍ବ ସମୟ ତୁଳନାରେ',
    notAvailable: 'ଉପଲବ୍ଧ ନାହିଁ',
    budgetManagement: 'ବଜେଟ୍ ପରିଚାଳନା',
    createBudget: 'ନୂତନ ବଜେଟ୍ ତିଆରି କରନ୍ତୁ',
    editBudget: 'ବଜେଟ୍ ସଂଶୋଧନ କରନ୍ତୁ',
    overallMonthlyBudget: 'ସାମଗ୍ରିକ ମାସିକ ଘରୋଇ ବଜେଟ୍',
    categoryBudget: 'ବର୍ଗ ଭିତ୍ତିକ ବଜେଟ୍',
    budgetAmount: 'ବଜେଟ୍ ପରିମାଣ (₹ ରେ)',
    utilized: 'ବ୍ୟବହୃତ',
    remaining: 'ବାକି',
    overspentBy: 'ଅଧିକ ଖର୍ଚ୍ଚ ହୋଇଛି',
    alertAt80: '୮୦% ସତର୍କତା ସୀମା',
    alertAt100: '୧୦୦% ଚରମ ସୀମା',
    recurringBills: 'ନିୟମିତ ବିଲ୍ ଏବଂ ସବସ୍କ୍ରିପସନ୍',
    addRecurring: 'ନିୟମିତ ନିୟମ ଯୋଡ଼ନ୍ତୁ',
    frequency: 'ପୁନରାବୃତ୍ତି',
    daily: 'ଦୈନିକ',
    weekly: 'ସାପ୍ତାହିକ',
    monthly: 'ମାସିକ',
    yearly: 'ବାର୍ଷିକ',
    nextDue: 'ପରବର୍ତ୍ତୀ ପ୍ରଦେୟ ତାରିଖ',
    recordNow: 'ଆଜି ରେକର୍ଡ କରନ୍ତୁ',
    familyManagement: 'ପରିବାର ଏବଂ ସଦସ୍ୟ',
    addFamilyMember: 'ପରିବାର ସଦସ୍ୟ ଯୋଡ଼ନ୍ତୁ',
    memberName: 'ସଦସ୍ୟଙ୍କ ନାମ',
    role: 'ଭୂମିକା',
    spendingByMember: 'ସଦସ୍ୟ ଅନୁଯାୟୀ ଖର୍ଚ୍ଚ',
    settings: 'ସେଟିଙ୍ଗ୍ ଏବଂ ସୁରକ୍ଷା',
    appSecurity: 'ଆପ୍ ସୁରକ୍ଷା ଏବଂ ଲକ୍',
    pinLock: '୪-ଅଙ୍କ ବିଶିଷ୍ଟ ପିନ୍ ଲକ୍',
    biometricUnlock: 'ବାୟୋମେଟ୍ରିକ୍ / ଫିଙ୍ଗରପ୍ରିଣ୍ଟ',
    changePin: 'ପିନ୍ ପରିବର୍ତ୍ତନ କରନ୍ତୁ',
    setPin: 'ଆପ୍ ପିନ୍ ସେଟ୍ କରନ୍ତୁ',
    enterPin: '୪-ଅଙ୍କ ବିଶିଷ୍ଟ ପିନ୍ ଦିଅନ୍ତୁ',
    confirmPin: 'ପିନ୍ ନିଶ୍ଚିତ କରନ୍ତୁ',
    pinMismatch: 'ପିନ୍ ମେଳ ଖାଉନାହିଁ। ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।',
    pinLengthNotice: 'ଦୟାକରି ୪-ଅଙ୍କ ବିଶିଷ୍ଟ ସଂଖ୍ୟା ପିନ୍ ଦିଅନ୍ତୁ',
    autoLockTimeout: 'ସ୍ୱୟଂଚାଳିତ ଲକ୍ ସମୟ',
    cloudBackup: 'ସୁପାବେସ୍ କ୍ଲାଉଡ୍ ବ୍ୟାକଅପ୍ (ଇଚ୍ଛାଧୀନ)',
    cloudSyncStatus: 'ସିଙ୍କ୍ ସ୍ଥିତି',
    syncNow: 'ବାକି ତଥ୍ୟ ସିଙ୍କ୍ କରନ୍ତୁ',
    lastBackup: 'ଶେଷ ସଫଳ ବ୍ୟାକଅପ୍',
    fullDataBackup: 'ତଥ୍ୟ ବ୍ୟାକଅପ୍ (JSON)',
    restoreData: 'ବ୍ୟାକଅପ୍ ପୁନରୁଦ୍ଧାର କରନ୍ତୁ',
    exportAllData: 'ସମସ୍ତ ଲେନଦେନ ଏକ୍ସପୋର୍ଟ କରନ୍ତୁ',
    deleteLocalData: 'ସ୍ଥାନୀୟ ଡାଟାବେସ୍ ରିସେଟ୍ କରନ୍ତୁ',
    theme: 'ଆପ୍ ରୂପରେଖ',
    language: 'ଆପ୍ ଭାଷା',
    english: 'English',
    odia: 'ଓଡ଼ିଆ (Odia)',
    appVersion: 'ଆପ୍ ସଂସ୍କରଣ ଏବଂ ତଥ୍ୟ',
    runQATests: 'ସ୍ୱୟଂଚାଳିତ ପରୀକ୍ଷା (QA Tests) ଚଲାନ୍ତୁ',
    viewFlutterSource: 'ଫ୍ଲଟର ସୋର୍ସ କୋଡ୍ ଏବଂ ସୁପାବେସ୍ SQL ଦେଖନ୍ତୁ',
    privacyMode: 'ଗୋପନୀୟତା ମୋଡ୍ (ପରିମାଣ ଲୁଚାନ୍ତୁ)',
    errAmountRequired: 'ଦୟାକରି ₹୦ ରୁ ଅଧିକ ବୈଧ ପରିମାଣ ଦିଅନ୍ତୁ',
    errCategoryRequired: 'ଦୟାକରି ଏକ ବର୍ଗ ବାଛନ୍ତୁ',
    errAccountMismatch: 'ପ୍ରେରକ ଏବଂ ପ୍ରାପକ ଖାତା ଭିନ୍ନ ହେବା ଆବଶ୍ୟକ',
    savedSuccess: 'ଲେନଦେନ ସଫଳତାର ସହ ସଂରକ୍ଷିତ ହେଲା!',
  },
};
