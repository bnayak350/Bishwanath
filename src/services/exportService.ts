/**
 * My Daily Khata – PDF and CSV Export Service
 * Strictly generates valid, injection-safe CSV and high-fidelity PDF financial statements.
 */

import { jsPDF } from 'jspdf';
import { Transaction, Category, Account, HouseholdMember, PeriodFinancials } from '../types';
import { formatINR } from './currency';

/**
 * Sanitize text against spreadsheet formula injection (CSV Injection / CWE-1236)
 */
function sanitizeCSVField(value: string | undefined | null): string {
  if (value === undefined || value === null) return '""';
  let str = String(value);

  // If first character is =, +, -, @, or tab/CR, prepend single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape inner double quotes by doubling them
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Export Transactions to RFC 4180 compliant CSV file with UTF-8 BOM
 */
export function exportTransactionsToCSV(
  transactions: Transaction[],
  categories: Category[],
  accounts: Account[],
  members: HouseholdMember[],
  filename = 'my_daily_khata_transactions.csv'
): void {
  const catMap = new Map(categories.map((c) => [c.id, c.name_en]));
  const accMap = new Map(accounts.map((a) => [a.id, a.name]));
  const memMap = new Map(members.map((m) => [m.id, m.display_name]));

  const headers = [
    'Transaction ID',
    'Date',
    'Time',
    'Type',
    'Category',
    'Description',
    'Amount INR',
    'Payment Method',
    'Family Member',
    'Account',
    'Notes',
    'Status',
  ];

  const rows = transactions.map((tx) => {
    const catName = tx.category_id ? catMap.get(tx.category_id) || 'Uncategorized' : '';
    const accName = tx.account_id ? accMap.get(tx.account_id) || '' : '';
    const memName = tx.family_member_id ? memMap.get(tx.family_member_id) || '' : '';
    const amountINR = (tx.amount_paise / 100).toFixed(2);

    return [
      sanitizeCSVField(tx.id),
      sanitizeCSVField(tx.transaction_date),
      sanitizeCSVField(tx.transaction_time || ''),
      sanitizeCSVField(tx.transaction_type.toUpperCase()),
      sanitizeCSVField(catName),
      sanitizeCSVField(tx.description || tx.merchant_or_source || ''),
      sanitizeCSVField(amountINR),
      sanitizeCSVField(tx.payment_method),
      sanitizeCSVField(memName),
      sanitizeCSVField(accName),
      sanitizeCSVField(tx.notes || ''),
      sanitizeCSVField(tx.status),
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate and download professional PDF financial report
 */
export function generatePDFReport(
  periodTitle: string,
  startDate: string,
  endDate: string,
  financials: PeriodFinancials,
  transactions: Transaction[],
  categories: Category[],
  language: 'en' | 'or' = 'en'
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const appTitle = language === 'or' ? 'My Daily Khata (ମୋ ଦୈନିକ ଖାତା)' : 'My Daily Khata – Expense Tracker';
  doc.text(appTitle, 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  const tagline = language === 'or' ? 'Every Rupee Accounted For • ପ୍ରତ୍ୟେକ ଟଙ୍କାର ହିସାବ' : 'Every Rupee Accounted For';
  doc.text(tagline, 14, 18);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')} | Period: ${startDate} to ${endDate}`, 14, 23);

  y = 36;

  // Executive Summary Card
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(14, y, pageWidth - 28, 42, 3, 3, 'FD');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Financial Summary (${periodTitle})`, 18, y + 8);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  // 4 Column Grid in Summary
  const colW = (pageWidth - 36) / 4;
  const metrics = [
    { label: 'Total Income', val: formatINR(financials.totalIncomePaise), color: [16, 185, 129] },
    { label: 'Net Expenditure', val: formatINR(financials.netExpenditurePaise), color: [239, 68, 68] },
    { label: 'Net Cash Flow', val: formatINR(financials.netCashFlowPaise), color: financials.netCashFlowPaise >= 0 ? [16, 185, 129] : [239, 68, 68] },
    {
      label: 'Savings Rate',
      val: financials.savingsRatePercent !== null ? `${financials.savingsRatePercent.toFixed(1)}%` : 'N/A',
      color: [59, 130, 246],
    },
  ];

  metrics.forEach((m, idx) => {
    const mx = 18 + idx * colW;
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, mx, y + 18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(m.color[0], m.color[1], m.color[2]);
    doc.setFontSize(11);
    doc.text(m.val, mx, y + 26);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
  });

  // Secondary summary stats
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Gross Expenditure: ${formatINR(financials.grossExpenditurePaise)}  •  Refunds: ${formatINR(financials.eligibleRefundsPaise)}  •  Avg Daily Spend: ${formatINR(financials.averageDailyExpenditurePaise)}  •  Transactions: ${financials.transactionCount}`,
    18,
    y + 36
  );

  y += 50;

  // Category Breakdown Section
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Category Breakdown', 14, y);
  y += 6;

  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Category', 18, y + 5);
  doc.text('Transactions', 100, y + 5);
  doc.text('Share (%)', 135, y + 5);
  doc.text('Amount (INR)', pageWidth - 20, y + 5, { align: 'right' });
  y += 8;

  const topCategories = financials.categorySpending.slice(0, 8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);

  if (topCategories.length === 0) {
    doc.text('No expenditure recorded for this period.', 18, y + 4);
    y += 8;
  } else {
    topCategories.forEach((cat) => {
      doc.text(cat.categoryNameEn, 18, y + 4);
      doc.text(String(cat.count), 100, y + 4);
      doc.text(`${cat.percentage.toFixed(1)}%`, 135, y + 4);
      doc.setFont('helvetica', 'bold');
      doc.text(formatINR(cat.totalPaise), pageWidth - 20, y + 4, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      y += 6;
    });
  }

  y += 6;

  // Transactions Section
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Itemized Transaction Log', 14, y);
  y += 6;

  // Transaction Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Date', 18, y + 5);
  doc.text('Type', 42, y + 5);
  doc.text('Description / Category', 70, y + 5);
  doc.text('Method', 140, y + 5);
  doc.text('Amount (INR)', pageWidth - 20, y + 5, { align: 'right' });
  y += 8;

  const catMap = new Map(categories.map((c) => [c.id, c.name_en]));
  const txList = transactions.slice(0, 25); // Top 25 for first page

  doc.setFont('helvetica', 'normal');
  txList.forEach((tx) => {
    if (y > 275) {
      doc.addPage();
      y = 20;
    }

    doc.setTextColor(51, 65, 85);
    doc.text(tx.transaction_date, 18, y + 4);

    const typeColor =
      tx.transaction_type === 'income'
        ? [16, 185, 129]
        : tx.transaction_type === 'expense'
        ? [239, 68, 68]
        : [59, 130, 246];
    doc.setTextColor(typeColor[0], typeColor[1], typeColor[2]);
    doc.text(tx.transaction_type.toUpperCase(), 42, y + 4);

    doc.setTextColor(15, 23, 42);
    const catName = tx.category_id ? catMap.get(tx.category_id) || '' : '';
    const descText = `${tx.description || tx.merchant_or_source || 'Item'} ${catName ? `(${catName})` : ''}`;
    const truncatedDesc = descText.length > 36 ? descText.substring(0, 34) + '...' : descText;
    doc.text(truncatedDesc, 70, y + 4);

    doc.setTextColor(100, 116, 139);
    doc.text(tx.payment_method.toUpperCase(), 140, y + 4);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(typeColor[0], typeColor[1], typeColor[2]);
    const sign = tx.transaction_type === 'income' ? '+' : tx.transaction_type === 'expense' ? '-' : '';
    doc.text(`${sign}${formatINR(tx.amount_paise)}`, pageWidth - 20, y + 4, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    y += 6;
  });

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `My Daily Khata • Personal & Family Finance • Page ${i} of ${totalPages}`,
      pageWidth / 2,
      290,
      { align: 'center' }
    );
  }

  doc.save(`My_Daily_Khata_Report_${startDate}_to_${endDate}.pdf`);
}
