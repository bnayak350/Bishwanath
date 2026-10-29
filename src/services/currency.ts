/**
 * Indian Currency (INR — ₹) Formatting and Parsing Service
 * Strictly adheres to Indian Lakh/Crore grouping and exact integer paise arithmetic.
 * 1 Rupee = 100 Paise.
 */

/**
 * Format an integer amount in paise into Indian Currency string (₹)
 * Examples:
 *   5000 paise  -> ₹50.00
 *   50000 paise -> ₹500.00
 *   100000 paise -> ₹1,000.00
 *   1250000 paise -> ₹12,500.00
 *   12500000 paise -> ₹1,25,000.00
 *   123456700 paise -> ₹12,34,567.00
 *   12345678900 paise -> ₹12,34,56,789.00
 */
export function formatINR(
  amountPaise: number,
  options?: {
    showDecimals?: boolean;
    compact?: boolean; // omit decimal if .00 on compact cards
    showSign?: boolean; // + or -
  }
): string {
  if (isNaN(amountPaise) || !isFinite(amountPaise)) {
    return '₹0.00';
  }

  const isNegative = amountPaise < 0;
  const absPaise = Math.abs(Math.round(amountPaise));

  const rupees = Math.floor(absPaise / 100);
  const paise = absPaise % 100;

  // Format rupees with Indian lakh/crore grouping
  const formattedRupees = formatIndianGrouping(rupees);

  let formattedPaise = paise.toString().padStart(2, '0');

  const showDecimals = options?.showDecimals ?? (options?.compact ? paise !== 0 : true);

  let result = showDecimals
    ? `₹${formattedRupees}.${formattedPaise}`
    : `₹${formattedRupees}`;

  if (isNegative) {
    result = `-${result}`;
  } else if (options?.showSign && amountPaise > 0) {
    result = `+${result}`;
  }

  return result;
}

/**
 * Pure Indian Lakh/Crore numbering algorithm:
 * - Last 3 digits grouped together
 * - Preceding digits grouped in pairs of 2
 */
export function formatIndianGrouping(num: number | bigint): string {
  const str = num.toString();
  if (str.length <= 3) {
    return str;
  }

  const lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);

  // Split otherNumbers into groups of 2 from right to left
  const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');

  return `${formattedOther},${lastThree}`;
}

/**
 * Convert user input string in Rupees into exact integer paise.
 * Rejects invalid strings, malformed numbers, negative numbers, NaN, and values beyond MAX_SAFE_PAISE.
 */
export function parseINRToPaise(input: string): {
  valid: boolean;
  paise: number;
  error?: string;
} {
  if (!input || typeof input !== 'string') {
    return { valid: false, paise: 0, error: 'Amount is required' };
  }

  // Remove currency symbol, whitespace, and Indian grouping commas
  const cleaned = input.replace(/[₹\s,]/g, '').trim();

  if (cleaned === '') {
    return { valid: false, paise: 0, error: 'Amount cannot be empty' };
  }

  // Check valid decimal format: e.g. "123", "123.45", "0.50"
  const regex = /^\d+(\.\d{1,2})?$/;
  if (!regex.test(cleaned)) {
    return {
      valid: false,
      paise: 0,
      error: 'Invalid amount format. Use numbers with optional 2 decimal places (e.g. 12500.50)',
    };
  }

  const parts = cleaned.split('.');
  const wholePart = parseInt(parts[0], 10);
  const decimalPart = parts[1] ? parts[1].padEnd(2, '0') : '00';
  const paisePart = parseInt(decimalPart.substring(0, 2), 10);

  // Maximum supported single transaction: ₹99,99,99,999 (99 Crore)
  const MAX_RUPEES = 999999999;
  if (wholePart > MAX_RUPEES) {
    return {
      valid: false,
      paise: 0,
      error: 'Amount exceeds maximum limit (₹99,99,99,999)',
    };
  }

  const totalPaise = wholePart * 100 + paisePart;

  if (totalPaise <= 0) {
    return {
      valid: false,
      paise: 0,
      error: 'Amount must be greater than zero',
    };
  }

  return { valid: true, paise: totalPaise };
}

/**
 * Format Paise to plain Decimal string for edit inputs (e.g. "12500.50" or "500")
 */
export function paiseToDecimalInput(paise: number): string {
  if (!paise || paise === 0) return '';
  const rupees = Math.floor(paise / 100);
  const remPaise = paise % 100;
  if (remPaise === 0) return rupees.toString();
  return `${rupees}.${remPaise.toString().padStart(2, '0')}`;
}
