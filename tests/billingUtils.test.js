import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatCurrency,
  formatPercent,
  formatDate,
  calculateProrationQuote,
  calculateUsageOverage,
  generateInvoiceCsv,
} from '../lib/billingUtils.js';

describe('Billing & Proration Utility Tests', () => {
  it('formatCurrency formats integer cents into USD currency strings', () => {
    assert.equal(formatCurrency(0), '$0.00');
    assert.equal(formatCurrency(2900), '$29.00');
    assert.equal(formatCurrency(9950), '$99.50');
    assert.equal(formatCurrency(1245000), '$12,450.00');
    assert.equal(formatCurrency(-1500), '-$15.00');
    assert.equal(formatCurrency(null), '$0.00');
    assert.equal(formatCurrency(undefined), '$0.00');
  });

  it('formatPercent formats numbers into percentage strings', () => {
    assert.equal(formatPercent(2.74), '2.7%');
    assert.equal(formatPercent(14.25, 2), '14.25%');
    assert.equal(formatPercent(0), '0.0%');
    assert.equal(formatPercent(null), '0%');
  });

  it('formatDate formats ISO dates or returns fallback', () => {
    const formatted = formatDate('2026-11-10T00:00:00.000Z');
    assert.ok(formatted.includes('2026'));
    assert.equal(formatDate(null), '—');
    assert.equal(formatDate('invalid-date'), '—');
  });

  it('calculateProrationQuote calculates exact credit and net charge for mid-cycle plan switch', () => {
    // Current: Starter ($29/mo, 1 seat). Target: Pro ($99/mo, 1 seat). 15 days remaining in 30-day cycle.
    const quote = calculateProrationQuote({
      currentPlanPriceCents: 2900,
      newPlanPriceCents: 9900,
      currentSeats: 1,
      newSeats: 1,
      daysRemaining: 15,
      daysInCycle: 30,
    });

    // Unused credit: (2900 * 15) / 30 = 1450
    assert.equal(quote.unusedCreditCents, 1450);
    // Prorated new charge: (9900 * 15) / 30 = 4950
    assert.equal(quote.proratedChargeCents, 4950);
    // Net adjustment: 4950 - 1450 = 3500
    assert.equal(quote.netAdjustmentCents, 3500);
    assert.equal(quote.daysRemaining, 15);
  });

  it('calculateProrationQuote correctly scales with seat increments', () => {
    // Current: Pro ($99/mo, 2 seats). Target: Pro ($99/mo, 5 seats). 10 days remaining in 30-day cycle.
    const quote = calculateProrationQuote({
      currentPlanPriceCents: 9900,
      newPlanPriceCents: 9900,
      currentSeats: 2,
      newSeats: 5,
      daysRemaining: 10,
      daysInCycle: 30,
    });

    // Old cycle total: 9900 * 2 = 19800. Unused: 19800 * 10 / 30 = 6600
    assert.equal(quote.unusedCreditCents, 6600);
    // New cycle total: 9900 * 5 = 49500. New charge: 49500 * 10 / 30 = 16500
    assert.equal(quote.proratedChargeCents, 16500);
    // Net: 16500 - 6600 = 9900
    assert.equal(quote.netAdjustmentCents, 9900);
  });

  it('calculateUsageOverage computes zero overage within allowance', () => {
    const result = calculateUsageOverage({
      used: 45000,
      included: 50000,
      overageRateCents: 15,
    });

    assert.equal(result.overageUnits, 0);
    assert.equal(result.overageCostCents, 0);
    assert.equal(result.usagePercentage, 90);
  });

  it('calculateUsageOverage computes tiered cost when exceeding allowance', () => {
    const result = calculateUsageOverage({
      used: 65000,
      included: 50000,
      overageRateCents: 2, // 2 cents per extra unit
    });

    assert.equal(result.overageUnits, 15000);
    assert.equal(result.overageCostCents, 30000); // 15000 * 2 = 30000 cents ($300.00)
    assert.equal(result.usagePercentage, 100);
  });

  it('generateInvoiceCsv produces RFC 4180 escaped CSV ledger string', () => {
    const sampleInvoices = [
      {
        invoiceId: 'inv_01',
        invoiceNumber: 'INV-2026-001',
        customerId: 'cus_test',
        status: 'paid',
        subtotalCents: 9900,
        taxCents: 825,
        discountCents: 0,
        totalCents: 10725,
        createdAt: '2026-11-10T10:00:00.000Z',
        paidAt: '2026-11-10T10:05:00.000Z',
      },
    ];

    const csv = generateInvoiceCsv(sampleInvoices);
    assert.ok(csv.includes('Invoice ID,Invoice Number,Customer ID'));
    assert.ok(csv.includes('"inv_01"'));
    assert.ok(csv.includes('"INV-2026-001"'));
    assert.ok(csv.includes('"107.25"'));
    assert.ok(csv.includes('"paid"'));
  });
});
