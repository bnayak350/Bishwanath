import 'package:intl/intl.dart';

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
    final cleaned = input.replaceAll(RegExp(r'[₹,\s]'), '').trim();
    if (cleaned.isEmpty) return null;
    final value = double.tryParse(cleaned);
    if (value == null || value.isNaN || value.isInfinite || value < 0) return null;
    return (value * 100).round();
  }
}
