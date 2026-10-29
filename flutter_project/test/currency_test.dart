import 'package:flutter_test/flutter_test.dart';
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
