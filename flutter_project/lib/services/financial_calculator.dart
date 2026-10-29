class FinancialCalculator {
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
