import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Transaction,
  Category,
  Account,
  HouseholdMember,
  Budget,
  RecurringRule,
  SavingsGoal,
  AppSettings,
  TransactionType,
} from './types';
import { StorageService } from './services/storage';
import { calculatePeriodFinancials } from './services/financialEngine';
import { hashPinWithSalt, generateSalt, verifyPin } from './services/security';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { HomeDashboard } from './components/HomeDashboard';
import { TransactionsList } from './components/TransactionsList';
import { AddTransactionModal } from './components/AddTransactionModal';
import { ReportsScreen } from './components/ReportsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { LockScreen } from './components/LockScreen';
import { QATestRunnerModal } from './components/QATestRunnerModal';
import { FlutterDeliverablesModal } from './components/FlutterDeliverablesModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { BudgetManagerModal } from './components/BudgetManagerModal';
import { RecurringManagerModal } from './components/RecurringManagerModal';
import { FamilyManagerModal } from './components/FamilyManagerModal';
import { OnboardingModal } from './components/OnboardingModal';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { ExportDownloadModal } from './components/ExportDownloadModal';
import { BankAccountsModal } from './components/BankAccountsModal';
import confetti from 'canvas-confetti';

export default function App() {
  // Database Entities State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [settings, setSettings] = useState<AppSettings>(StorageService.loadSettings());

  // Navigation & View State
  const [currentTab, setCurrentTab] = useState<'home' | 'transactions' | 'reports' | 'settings'>('home');
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'custom'>('month');
  const [privacyMode, setPrivacyMode] = useState<boolean>(false);
  const [isFramed, setIsFramed] = useState<boolean>(true); // Mobile phone frame toggle

  // Security / App Lock State
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Modals State
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddDefaultType, setQuickAddDefaultType] = useState<TransactionType>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [isQATestsOpen, setIsQATestsOpen] = useState(false);
  const [isFlutterDeliverablesOpen, setIsFlutterDeliverablesOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isBudgetManagerOpen, setIsBudgetManagerOpen] = useState(false);
  const [isRecurringManagerOpen, setIsRecurringManagerOpen] = useState(false);
  const [isFamilyManagerOpen, setIsFamilyManagerOpen] = useState(false);
  const [isBankAccountsOpen, setIsBankAccountsOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAndroidInstallOpen, setIsAndroidInstallOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Initialize and load database on mount
  useEffect(() => {
    // Clear all transactions as requested by user so app starts completely clean
    const hasCleared = localStorage.getItem('mdk_transactions_cleaned_v5');
    let loadedTx = StorageService.loadTransactions();
    if (!hasCleared) {
      StorageService.clearAllTransactions();
      loadedTx = [];
      localStorage.setItem('mdk_transactions_cleaned_v5', 'true');
    }

    const loadedCats = StorageService.loadCategories();
    const loadedAccs = StorageService.loadAccounts();
    const loadedMems = StorageService.loadMembers();
    const loadedBudgets = StorageService.loadBudgets();
    const loadedRules = StorageService.loadRecurringRules();
    const loadedGoals = StorageService.loadSavingsGoals();
    const loadedSettings = StorageService.loadSettings();

    setTransactions(loadedTx);
    setCategories(loadedCats);
    setAccounts(loadedAccs);
    setMembers(loadedMems);
    setBudgets(loadedBudgets);
    setRecurringRules(loadedRules);
    setSavingsGoals(loadedGoals);
    setSettings(loadedSettings);

    // If PIN is enabled, lock app initially
    if (loadedSettings.pin_hash) {
      setIsLocked(true);
    }

    // Check first launch for onboarding
    const seenOnboarding = localStorage.getItem('mdk_seen_onboarding_v1');
    if (!seenOnboarding) {
      setIsOnboardingOpen(true);
      localStorage.setItem('mdk_seen_onboarding_v1', 'true');
    }

    // Auto-download APK if ?download=apk or ?download=auto in URL
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (
        urlParams.get('download') === 'apk' ||
        urlParams.get('download') === 'auto' ||
        urlParams.has('autodownload')
      ) {
        const link = document.createElement('a');
        link.href = '/My_Khata.apk';
        link.download = 'My_Khata.apk';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch {
      // safe fallback
    }
  }, []);

  // Sync Dark/Light theme class
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Derive Period Date Bounds for Home Dashboard
  const periodBounds = useMemo(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    if (selectedPeriod === 'today') {
      return { start: todayStr, end: todayStr };
    }
    if (selectedPeriod === 'week') {
      const startD = new Date(now);
      startD.setDate(now.getDate() - 6);
      return {
        start: `${startD.getFullYear()}-${pad(startD.getMonth() + 1)}-${pad(startD.getDate())}`,
        end: todayStr,
      };
    }
    // Default Month
    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    return {
      start: `${year}-${month}-01`,
      end: `${year}-${month}-${pad(lastDay)}`,
    };
  }, [selectedPeriod]);

  // Calculate Period Financials for Selected Period
  const financials = useMemo(() => {
    return calculatePeriodFinancials(
      transactions,
      categories,
      periodBounds.start,
      periodBounds.end,
      { useLinkedRefundPolicy: true }
    );
  }, [transactions, categories, periodBounds]);

  // Calculate Today's Financials for Top Metric Cards
  const todayFinancials = useMemo(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    return calculatePeriodFinancials(
      transactions,
      categories,
      todayStr,
      todayStr,
      { useLinkedRefundPolicy: true }
    );
  }, [transactions, categories]);

  // ==========================================
  // Transaction CRUD Handlers
  // ==========================================
  const handleSaveTransaction = useCallback(
    (txData: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'version'>) => {
      let updated: Transaction[];
      if (editingTransaction) {
        const modified: Transaction = {
          ...editingTransaction,
          ...txData,
          updated_at: new Date().toISOString(),
          version: editingTransaction.version + 1,
        };
        updated = transactions.map((t) => (t.id === editingTransaction.id ? modified : t));
        setEditingTransaction(null);
      } else {
        const newTx: Transaction = {
          ...txData,
          id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          version: 1,
        };
        updated = [newTx, ...transactions];

        // Trigger celebratory confetti for income records
        if (newTx.transaction_type === 'income') {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        }
      }

      setTransactions(updated);
      StorageService.saveTransactions(updated);
      StorageService.queueSync('insert', 'transaction', 'tx-id', txData);
    },
    [editingTransaction, transactions]
  );

  const handleDeleteTransaction = useCallback(
    (id: string) => {
      const updated = transactions.filter((t) => t.id !== id);
      setTransactions(updated);
      StorageService.saveTransactions(updated);
      StorageService.queueSync('delete', 'transaction', id, { id });
    },
    [transactions]
  );

  const handleDuplicateTransaction = useCallback(
    (tx: Transaction) => {
      const duplicated: Transaction = {
        ...tx,
        id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        transaction_date: new Date().toISOString().substring(0, 10),
        description: `${tx.description} (Copy)`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: 1,
      };
      const updated = [duplicated, ...transactions];
      setTransactions(updated);
      StorageService.saveTransactions(updated);
    },
    [transactions]
  );

  // ==========================================
  // Category & Budget CRUD Handlers
  // ==========================================
  const handleSaveCategory = useCallback(
    (cat: Category) => {
      const existing = categories.find((c) => c.id === cat.id);
      const updated = existing
        ? categories.map((c) => (c.id === cat.id ? cat : c))
        : [...categories, cat];
      setCategories(updated);
      StorageService.saveCategories(updated);
    },
    [categories]
  );

  const handleToggleArchiveCategory = useCallback(
    (catId: string) => {
      const updated = categories.map((c) =>
        c.id === catId ? { ...c, is_active: !c.is_active } : c
      );
      setCategories(updated);
      StorageService.saveCategories(updated);
    },
    [categories]
  );

  const handleSaveBudget = useCallback(
    (budget: Budget) => {
      const existing = budgets.find((b) => b.id === budget.id);
      const updated = existing
        ? budgets.map((b) => (b.id === budget.id ? budget : b))
        : [...budgets, budget];
      setBudgets(updated);
      StorageService.saveBudgets(updated);
    },
    [budgets]
  );

  const handleDeleteBudget = useCallback(
    (id: string) => {
      const updated = budgets.filter((b) => b.id !== id);
      setBudgets(updated);
      StorageService.saveBudgets(updated);
    },
    [budgets]
  );

  const handleSaveRecurringRule = useCallback(
    (rule: RecurringRule) => {
      const existing = recurringRules.find((r) => r.id === rule.id);
      const updated = existing
        ? recurringRules.map((r) => (r.id === rule.id ? rule : r))
        : [...recurringRules, rule];
      setRecurringRules(updated);
      StorageService.saveRecurringRules(updated);
    },
    [recurringRules]
  );

  const handleDeleteRecurringRule = useCallback(
    (id: string) => {
      const updated = recurringRules.filter((r) => r.id !== id);
      setRecurringRules(updated);
      StorageService.saveRecurringRules(updated);
    },
    [recurringRules]
  );

  const handleRecordRecurringNow = useCallback(
    (rule: RecurringRule) => {
      const newTx: Transaction = {
        id: 'tx-' + Date.now(),
        household_id: rule.household_id,
        account_id: rule.account_id || null,
        transaction_type: rule.transaction_type,
        amount_paise: rule.amount_paise,
        transaction_date: new Date().toISOString().substring(0, 10),
        transaction_time: new Date().toTimeString().substring(0, 5),
        category_id: rule.category_id,
        payment_method: 'upi',
        description: rule.description,
        recurring_rule_id: rule.id,
        status: 'active',
        sync_status: 'pending',
        device_id: 'dev-local',
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated = [newTx, ...transactions];
      setTransactions(updated);
      StorageService.saveTransactions(updated);
      setIsRecurringManagerOpen(false);
      alert(`Recorded '${rule.description}' successfully!`);
    },
    [transactions]
  );

  const handleAddFamilyMember = useCallback(
    (member: HouseholdMember) => {
      const updated = [...members, member];
      setMembers(updated);
      StorageService.saveMembers(updated);
    },
    [members]
  );

  // ==========================================
  // Settings & Security Handlers
  // ==========================================
  const handleUpdateSettings = useCallback(
    (partial: Partial<AppSettings>) => {
      const updated: AppSettings = {
        ...settings,
        ...partial,
        updated_at: new Date().toISOString(),
      };
      setSettings(updated);
      StorageService.saveSettings(updated);
    },
    [settings]
  );

  const handleSetNewPin = useCallback(
    async (pin: string) => {
      const salt = generateSalt();
      const hash = await hashPinWithSalt(pin, salt);
      handleUpdateSettings({
        pin_hash: hash,
        pin_salt: salt,
      });
      alert('Security PIN updated successfully!');
    },
    [handleUpdateSettings]
  );

  const handleRemovePin = useCallback(() => {
    if (window.confirm('Remove PIN protection? Anyone can access the app.')) {
      handleUpdateSettings({
        pin_hash: null,
        pin_salt: null,
      });
      setIsLocked(false);
    }
  }, [handleUpdateSettings]);

  const handleUnlockWithPin = useCallback(
    async (enteredPin: string): Promise<boolean> => {
      if (!settings.pin_salt || !settings.pin_hash) {
        setIsLocked(false);
        return true;
      }
      const valid = await verifyPin(enteredPin, settings.pin_salt, settings.pin_hash);
      if (valid) {
        setIsLocked(false);
        return true;
      }
      return false;
    },
    [settings.pin_salt, settings.pin_hash]
  );

  const handleUnlockWithBiometrics = useCallback(async (): Promise<boolean> => {
    // Simulated native biometric prompt
    setIsLocked(false);
    return true;
  }, []);

  const handleResetDatabase = useCallback(() => {
    StorageService.resetAllData();
    window.location.reload();
  }, []);

  // Quick Action Opener
  const handleOpenQuickAdd = useCallback((type: TransactionType = 'expense') => {
    setQuickAddDefaultType(type);
    setEditingTransaction(null);
    setIsQuickAddOpen(true);
  }, []);

  const handleEditTransaction = useCallback((tx: Transaction) => {
    setEditingTransaction(tx);
    setQuickAddDefaultType(tx.transaction_type);
    setIsQuickAddOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-start sm:py-6 sm:px-4">
      {/* Container - Phone Framed or Full Responsive View */}
      <div
        className={`w-full transition-all duration-300 relative ${
          isFramed
            ? 'max-w-[430px] min-h-[850px] bg-slate-50 dark:bg-slate-950 sm:rounded-[42px] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] sm:border-[8px] sm:border-slate-800 overflow-hidden flex flex-col'
            : 'max-w-2xl min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col'
        }`}
      >
        {/* Mobile Device Status Bar Notch (Framed Mode Only) */}
        {isFramed && (
          <div className="hidden sm:flex items-center justify-between px-7 pt-3 pb-1 text-[11px] font-semibold text-slate-800 dark:text-slate-200 bg-white/95 dark:bg-slate-900/95 z-50 select-none">
            <span>9:41</span>
            {/* Camera Pill */}
            <div className="w-20 h-4 bg-slate-900 rounded-full mx-auto" />
            <div className="flex items-center space-x-1.5">
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>
        )}

        {/* Top App Bar Header */}
        <Header
          language={settings.language}
          onToggleLanguage={() =>
            handleUpdateSettings({ language: settings.language === 'en' ? 'or' : 'en' })
          }
          privacyMode={privacyMode}
          onTogglePrivacy={() => setPrivacyMode(!privacyMode)}
          hasPin={Boolean(settings.pin_hash)}
          onLockApp={() => setIsLocked(true)}
          isFramed={isFramed}
          onToggleFrame={() => setIsFramed(!isFramed)}
          onInstallClick={() => setIsAndroidInstallOpen(true)}
        />

        {/* Main Body Content according to Tab */}
        <main className="flex-1 overflow-y-auto px-4 pt-3">
          {currentTab === 'home' && (
            <HomeDashboard
              language={settings.language}
              privacyMode={privacyMode}
              financials={financials}
              todayFinancials={todayFinancials}
              transactions={transactions}
              categories={categories}
              accounts={accounts}
              budgets={budgets}
              savingsGoals={savingsGoals}
              onOpenQuickAdd={handleOpenQuickAdd}
              onNavigateToTab={(tab) => setCurrentTab(tab)}
              selectedPeriod={selectedPeriod}
              onChangePeriod={setSelectedPeriod}
            />
          )}

          {currentTab === 'transactions' && (
            <TransactionsList
              transactions={transactions}
              categories={categories}
              accounts={accounts}
              members={members}
              language={settings.language}
              privacyMode={privacyMode}
              onEditTransaction={handleEditTransaction}
              onDuplicateTransaction={handleDuplicateTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onOpenQuickAdd={() => handleOpenQuickAdd('expense')}
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsScreen
              transactions={transactions}
              categories={categories}
              accounts={accounts}
              members={members}
              budgets={budgets}
              language={settings.language}
              privacyMode={privacyMode}
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsScreen
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onSetNewPin={handleSetNewPin}
              onRemovePin={handleRemovePin}
              onOpenQATests={() => setIsQATestsOpen(true)}
              onOpenFlutterDeliverables={() => setIsFlutterDeliverablesOpen(true)}
              onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
              onOpenBudgetManager={() => setIsBudgetManagerOpen(true)}
              onOpenRecurringManager={() => setIsRecurringManagerOpen(true)}
              onOpenFamilyManager={() => setIsFamilyManagerOpen(true)}
              onOpenBankAccounts={() => setIsBankAccountsOpen(true)}
              onResetDatabase={handleResetDatabase}
              onOpenExportModal={() => setIsExportModalOpen(true)}
              language={settings.language}
              onToggleLanguage={() =>
                handleUpdateSettings({ language: settings.language === 'en' ? 'or' : 'en' })
              }
              theme={settings.theme}
              onToggleTheme={() =>
                handleUpdateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
              }
            />
          )}
        </main>

        {/* Material 3 Bottom Navigation Bar */}
        <Navigation
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenQuickAdd={() => handleOpenQuickAdd('expense')}
          language={settings.language}
        />

        {/* App Lock Screen Overlay (if locked) */}
        <LockScreen
          isOpen={isLocked}
          onUnlockWithPin={handleUnlockWithPin}
          onUnlockWithBiometrics={handleUnlockWithBiometrics}
          language={settings.language}
        />

        {/* Fast-Entry Add / Edit Transaction Modal */}
        <AddTransactionModal
          isOpen={isQuickAddOpen}
          onClose={() => {
            setIsQuickAddOpen(false);
            setEditingTransaction(null);
          }}
          categories={categories}
          accounts={accounts}
          members={members}
          onSaveTransaction={handleSaveTransaction}
          language={settings.language}
          defaultType={quickAddDefaultType}
          editingTransaction={editingTransaction}
        />

        {/* Supporting Feature Modals */}
        <QATestRunnerModal
          isOpen={isQATestsOpen}
          onClose={() => setIsQATestsOpen(false)}
        />

        <FlutterDeliverablesModal
          isOpen={isFlutterDeliverablesOpen}
          onClose={() => setIsFlutterDeliverablesOpen(false)}
        />

        <CategoryManagerModal
          isOpen={isCategoryManagerOpen}
          onClose={() => setIsCategoryManagerOpen(false)}
          categories={categories}
          onSaveCategory={handleSaveCategory}
          onToggleArchive={handleToggleArchiveCategory}
          language={settings.language}
        />

        <BudgetManagerModal
          isOpen={isBudgetManagerOpen}
          onClose={() => setIsBudgetManagerOpen(false)}
          budgets={budgets}
          categories={categories}
          onSaveBudget={handleSaveBudget}
          onDeleteBudget={handleDeleteBudget}
          language={settings.language}
        />

        <RecurringManagerModal
          isOpen={isRecurringManagerOpen}
          onClose={() => setIsRecurringManagerOpen(false)}
          recurringRules={recurringRules}
          categories={categories}
          onSaveRule={handleSaveRecurringRule}
          onDeleteRule={handleDeleteRecurringRule}
          onRecordNow={handleRecordRecurringNow}
          language={settings.language}
        />

        <FamilyManagerModal
          isOpen={isFamilyManagerOpen}
          onClose={() => setIsFamilyManagerOpen(false)}
          members={members}
          onAddMember={handleAddFamilyMember}
          language={settings.language}
        />

        <OnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          language={settings.language}
          onSelectLanguage={(lang) => handleUpdateSettings({ language: lang })}
        />

        <AndroidInstallModal
          isOpen={isAndroidInstallOpen}
          onClose={() => setIsAndroidInstallOpen(false)}
          onOpenFlutterDeliverables={() => setIsFlutterDeliverablesOpen(true)}
        />

        <ExportDownloadModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          transactions={transactions}
          categories={categories}
          accounts={accounts}
          members={members}
          language={settings.language}
        />

        <BankAccountsModal
          isOpen={isBankAccountsOpen}
          onClose={() => setIsBankAccountsOpen(false)}
          language={settings.language}
          onAccountAdded={() => setAccounts(StorageService.loadAccounts())}
        />
      </div>
    </div>
  );
}
