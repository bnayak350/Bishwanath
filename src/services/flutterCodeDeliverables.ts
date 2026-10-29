/**
 * My Daily Khata – Flutter Source Code & Supabase SQL Deliverables
 * Provides production-ready Flutter Dart files, Drift SQLite schemas, Riverpod providers,
 * and Supabase RLS security policies as specified in Section 15.
 */

export interface CodeDeliverable {
  filename: string;
  category: 'Flutter' | 'Supabase' | 'Android/iOS' | 'Documentation';
  description: string;
  code: string;
}

export const FLUTTER_DELIVERABLES: CodeDeliverable[] = [
  {
    filename: 'pubspec.yaml',
    category: 'Flutter',
    description: 'Flutter dependencies, Riverpod, Drift, Localization, and Assets',
    code: `name: my_daily_khata
description: Personal and family finance management with Indian Rupee formatting, Odia & English localization.
version: 1.0.0+1

environment:
  sdk: '>=3.2.0 <4.0.0'
  flutter: '>=3.16.0'

dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter
  intl: ^0.19.0
  flutter_riverpod: ^2.5.1
  riverpod_annotation: ^2.3.5
  go_router: ^14.0.0
  drift: ^2.18.0
  sqlite3_flutter_libs: ^0.5.21
  path_provider: ^2.1.2
  path: ^1.9.0
  supabase_flutter: ^2.5.0
  local_auth: ^2.1.8
  flutter_secure_storage: ^9.0.0
  fl_chart: ^0.68.0
  pdf: ^3.10.8
  printing: ^5.12.0
  csv: ^6.0.0
  share_plus: ^9.0.0
  uuid: ^4.4.0
  crypto: ^3.0.3

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0
  build_runner: ^2.4.9
  drift_dev: ^2.18.0
  riverpod_generator: ^2.4.0

flutter:
  uses-material-design: true
  generate: true
`,
  },
  {
    filename: 'lib/services/currency_formatter.dart',
    category: 'Flutter',
    description: 'Strict Indian Lakh/Crore grouping (en_IN) currency formatting in Dart',
    code: `import 'package:intl/intl.dart';

/// Authoritative Indian Rupee (INR — ₹) Currency Formatter
/// Converts integer paise into formatted INR string with lakh/crore grouping.
class CurrencyFormatter {
  static final NumberFormat _inrFormat = NumberFormat.currency(
    locale: 'en_IN',
    symbol: '₹',
    decimalDigits: 2,
  );

  /// Format paise to ₹ with standard en_IN grouping (e.g. 1250000 -> ₹12,500.00)
  static String formatINR(int amountPaise, {bool compact = false}) {
    final double rupees = amountPaise / 100.0;
    if (compact && amountPaise % 100 == 0) {
      final compactFormat = NumberFormat.currency(
        locale: 'en_IN',
        symbol: '₹',
        decimalDigits: 0,
      );
      return compactFormat.format(rupees);
    }
    return _inrFormat.format(rupees);
  }

  /// Parse user input string into exact integer paise
  static int? parseToPaise(String input) {
    final cleaned = input.replaceAll(RegExp(r'[₹,\\s]'), '').trim();
    if (cleaned.isEmpty) return null;
    final value = double.tryParse(cleaned);
    if (value == null || value.isNaN || value.isInfinite || value < 0) return null;
    return (value * 100).round();
  }
}
`,
  },
  {
    filename: 'lib/services/financial_calculator.dart',
    category: 'Flutter',
    description: 'Pure, testable financial calculation engine using exact integer paise arithmetic',
    code: `class FinancialCalculator {
  /// Net Expenditure = Gross Expenditure - Eligible Refunds
  static int calculateNetExpenditure({
    required int grossExpenditurePaise,
    required int eligibleRefundsPaise,
  }) {
    final net = grossExpenditurePaise - eligibleRefundsPaise;
    return net < 0 ? 0 : net;
  }

  /// Net Cash Flow = Total Income - Net Expenditure
  static int calculateNetCashFlow({
    required int totalIncomePaise,
    required int netExpenditurePaise,
  }) {
    return totalIncomePaise - netExpenditurePaise;
  }

  /// Savings Rate = (Net Cash Flow / Total Income) * 100
  static double? calculateSavingsRate({
    required int netCashFlowPaise,
    required int totalIncomePaise,
  }) {
    if (totalIncomePaise <= 0) return null;
    return (netCashFlowPaise / totalIncomePaise) * 100.0;
  }

  /// Budget Utilization % = (Expenditure / Budget) * 100
  static double calculateBudgetUtilization({
    required int eligibleExpenditurePaise,
    required int budgetAmountPaise,
  }) {
    if (budgetAmountPaise <= 0) return 0.0;
    return (eligibleExpenditurePaise / budgetAmountPaise) * 100.0;
  }
}
`,
  },
  {
    filename: 'lib/database/schema.drift',
    category: 'Flutter',
    description: 'Drift SQLite schema migrations with foreign keys, indexes, and integer paise',
    code: `CREATE TABLE users (
  id TEXT NOT NULL PRIMARY KEY,
  display_name TEXT NOT NULL,
  preferred_language TEXT NOT NULL DEFAULT 'en',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE households (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  owner_user_id TEXT NOT NULL REFERENCES users(id),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id TEXT NOT NULL PRIMARY KEY,
  household_id TEXT REFERENCES households(id),
  category_type TEXT NOT NULL, -- 'income' or 'expense'
  name_en TEXT NOT NULL,
  name_or TEXT NOT NULL,
  icon_key TEXT NOT NULL,
  is_system BOOLEAN NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
  id TEXT NOT NULL PRIMARY KEY,
  household_id TEXT NOT NULL REFERENCES households(id),
  account_id TEXT,
  transaction_type TEXT NOT NULL, -- 'income', 'expense', 'transfer', 'refund'
  amount_paise INTEGER NOT NULL, -- Positive integer paise
  transaction_date TEXT NOT NULL, -- YYYY-MM-DD
  category_id TEXT REFERENCES categories(id),
  payment_method TEXT NOT NULL,
  merchant_or_source TEXT,
  description TEXT NOT NULL,
  notes TEXT,
  family_member_id TEXT,
  refund_of_transaction_id TEXT REFERENCES transactions(id),
  status TEXT NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tx_date ON transactions(transaction_date);
CREATE INDEX idx_tx_household ON transactions(household_id);
CREATE INDEX idx_tx_category ON transactions(category_id);
`,
  },
  {
    filename: 'supabase/schema.sql',
    category: 'Supabase',
    description: 'PostgreSQL schema with Row Level Security (RLS) policies and household authorization',
    code: `-- My Daily Khata Supabase Cloud Backup Schema & RLS Policies

CREATE TABLE IF NOT EXISTS public.households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Household owners can access their household"
  ON public.households
  FOR ALL
  USING (auth.uid() = owner_user_id);

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense', 'transfer', 'refund')),
  amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
  transaction_date DATE NOT NULL,
  category_id TEXT,
  payment_method TEXT NOT NULL,
  merchant_or_source TEXT,
  description TEXT NOT NULL,
  notes TEXT,
  family_member_id TEXT,
  refund_of_transaction_id UUID REFERENCES public.transactions(id),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only read and write their household transactions"
  ON public.transactions
  FOR ALL
  USING (
    household_id IN (
      SELECT id FROM public.households WHERE owner_user_id = auth.uid()
    )
  );
`,
  },
  {
    filename: 'test/currency_test.dart',
    category: 'Flutter',
    description: 'Flutter unit tests verifying Section 13.1 and 13.2 acceptance criteria',
    code: `import 'package:flutter_test/flutter_test.dart';
import 'package:my_daily_khata/services/currency_formatter.dart';
import 'package:my_daily_khata/services/financial_calculator.dart';

void main() {
  group('Section 13.1 Currency Tests', () {
    test('Formats standard values with Indian lakh/crore grouping', () {
      expect(CurrencyFormatter.formatINR(100000), '₹1,000.00');
      expect(CurrencyFormatter.formatINR(1250000), '₹12,500.00');
      expect(CurrencyFormatter.formatINR(12500000), '₹1,25,000.00');
      expect(CurrencyFormatter.formatINR(123456700), '₹12,34,567.00');
      expect(CurrencyFormatter.formatINR(12345678900), '₹12,34,56,789.00');
    });

    test('Preserves decimal paise', () {
      expect(CurrencyFormatter.formatINR(1250050), '₹12,500.50');
    });
  });

  group('Section 13.2 Financial Calculation Tests', () {
    test('Scenario: Salary ₹30k, Exp ₹5k, Net Cashflow ₹25k, Savings ~83.33%', () {
      final grossExp = 250000 + 150000 + 100000; // ₹5,000 in paise
      final income = 3000000; // ₹30,000 in paise

      final netExp = FinancialCalculator.calculateNetExpenditure(
        grossExpenditurePaise: grossExp,
        eligibleRefundsPaise: 0,
      );
      expect(netExp, 500000);

      final netCash = FinancialCalculator.calculateNetCashFlow(
        totalIncomePaise: income,
        netExpenditurePaise: netExp,
      );
      expect(netCash, 2500000);

      final savings = FinancialCalculator.calculateSavingsRate(
        netCashFlowPaise: netCash,
        totalIncomePaise: income,
      );
      expect((savings! - 83.33).abs() < 0.05, isTrue);

      // Add ₹500 refund
      final netExpWithRefund = FinancialCalculator.calculateNetExpenditure(
        grossExpenditurePaise: grossExp,
        eligibleRefundsPaise: 50000,
      );
      expect(netExpWithRefund, 450000); // ₹4,500

      final netCashWithRefund = FinancialCalculator.calculateNetCashFlow(
        totalIncomePaise: income,
        netExpenditurePaise: netExpWithRefund,
      );
      expect(netCashWithRefund, 2550000); // ₹25,500
    });
  });
}
`,
  },
  {
    filename: 'README.md',
    category: 'Documentation',
    description: 'Comprehensive setup, Android/iOS build, and architectural guide',
    code: `# My Daily Khata – Expense Tracker (ମୋ ଦୈନିକ ଖାତା)

**Every Rupee Accounted For • ପ୍ରତ୍ୟେକ ଟଙ୍କାର ହିସାବ**

An offline-first personal and family financial tracker engineered for Android and iOS using Flutter, Drift SQLite, and optional Supabase cloud synchronization.

## Build Instructions

### Android
\`\`\`bash
flutter pub get
flutter analyze
flutter test
flutter build apk --release
\`\`\`

### iOS
\`\`\`bash
flutter pub get
flutter analyze
flutter test
flutter build ios --release
\`\`\`

## Features
- **INR Strict Policy**: Indian Lakh/Crore grouping (₹) everywhere.
- **Bilingual**: English & Odia (ଓଡ଼ିଆ) full translation with Noto Sans Oriya glyph support.
- **Exact Math**: Integer paise arithmetic prevents rounding bugs.
- **Transfers & Refunds**: Linked refund policy, double-entry transfers excluded from income/expenditure.
- **Biometric & PIN Lock**: PBKDF2 SHA-256 hashed PIN with biometric authentication.
- **PDF & CSV Export**: One-click reports with formula injection protection.
`,
  },
];
