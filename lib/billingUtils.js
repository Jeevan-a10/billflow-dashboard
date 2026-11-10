/**
 * Pure Billing, Proration, Currency & Export Utilities
 */

/**
 * Format integer cents into USD currency string (e.g. 2900 -> "$29.00", -1500 -> "-$15.00")
 */
export function formatCurrency(cents = 0) {
  if (cents === null || cents === undefined || isNaN(cents)) return '$0.00';
  const isNegative = cents < 0;
  const absDollars = (Math.abs(cents) / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return isNegative ? `-$${absDollars}` : `$${absDollars}`;
}

/**
 * Format percentage (e.g. 1.8 -> "1.8%", 14.25 -> "14.3%")
 */
export function formatPercent(rate = 0, decimals = 1) {
  if (rate === null || rate === undefined || isNaN(rate)) return '0%';
  return `${Number(rate).toFixed(decimals)}%`;
}

/**
 * Format ISO or timestamp date into human readable string
 */
export function formatDate(dateInput) {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

/**
 * Calculate mathematical proration preview for mid-cycle plan switches
 */
export function calculateProrationQuote({
  currentPlanPriceCents = 0,
  newPlanPriceCents = 0,
  currentSeats = 1,
  newSeats = 1,
  daysRemaining = 15,
  daysInCycle = 30,
}) {
  const safeDaysTotal = Math.max(daysInCycle, 1);
  const safeDaysRemaining = Math.max(Math.min(daysRemaining, safeDaysTotal), 0);

  const currentTotalPerCycle = currentPlanPriceCents * currentSeats;
  const newTotalPerCycle = newPlanPriceCents * newSeats;

  // Credit for unused portion of old plan
  const unusedCreditCents = Math.round((currentTotalPerCycle * safeDaysRemaining) / safeDaysTotal);

  // Charge for remaining portion of new plan
  const proratedChargeCents = Math.round((newTotalPerCycle * safeDaysRemaining) / safeDaysTotal);

  // Net amount payable (positive = charge customer, negative = credit to balance)
  const netAdjustmentCents = proratedChargeCents - unusedCreditCents;

  return {
    daysRemaining: safeDaysRemaining,
    daysInCycle: safeDaysTotal,
    unusedCreditCents,
    proratedChargeCents,
    netAdjustmentCents,
    newTotalPerCycle,
  };
}

/**
 * Calculate metered overage consumption and costs
 */
export function calculateUsageOverage({
  used = 0,
  included = 0,
  overageRateCents = 0,
}) {
  const safeUsed = Math.max(0, Number(used) || 0);
  const safeIncluded = Math.max(0, Number(included) || 0);
  const overageUnits = Math.max(0, safeUsed - safeIncluded);
  const overageCostCents = Math.round(overageUnits * (Number(overageRateCents) || 0));
  const usagePercentage = safeIncluded > 0 ? Math.min(100, Math.round((safeUsed / safeIncluded) * 100)) : 100;

  return {
    used: safeUsed,
    included: safeIncluded,
    overageUnits,
    overageCostCents,
    usagePercentage,
  };
}

/**
 * Generate RFC 4180-compliant CSV string from invoice list
 */
export function generateInvoiceCsv(invoices = []) {
  const headers = [
    'Invoice ID',
    'Invoice Number',
    'Customer ID',
    'Status',
    'Subtotal USD',
    'Tax USD',
    'Discount USD',
    'Total USD',
    'Created At',
    'Paid At',
  ];

  const rows = invoices.map((inv) => {
    return [
      inv.invoiceId || '',
      inv.invoiceNumber || '',
      inv.customerId || '',
      inv.status || '',
      ((inv.subtotalCents || 0) / 100).toFixed(2),
      ((inv.taxCents || 0) / 100).toFixed(2),
      ((inv.discountCents || 0) / 100).toFixed(2),
      ((inv.totalCents || 0) / 100).toFixed(2),
      inv.createdAt ? new Date(inv.createdAt).toISOString() : '',
      inv.paidAt ? new Date(inv.paidAt).toISOString() : '',
    ].map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Trigger browser download for structured JSON payload
 */
export function downloadJsonFile(data, filename = 'billflow-export.json') {
  if (typeof window === 'undefined') return;
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Trigger browser download for CSV text
 */
export function downloadCsvFile(csvContent, filename = 'billflow-invoices.csv') {
  if (typeof window === 'undefined') return;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
