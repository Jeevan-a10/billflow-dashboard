import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  FALLBACK_DATA,
  healthAPI,
  plansAPI,
  customersAPI,
  subscriptionsAPI,
  usageAPI,
  invoicesAPI,
  webhooksAPI,
  analyticsAPI,
} from '../lib/api.js';

describe('BillFlow API Client & Data Contract Suite', () => {
  it('FALLBACK_DATA contains valid seeding contracts', () => {
    assert.ok(Array.isArray(FALLBACK_DATA.plans));
    assert.equal(FALLBACK_DATA.plans.length, 3);
    assert.ok(FALLBACK_DATA.plans.some((p) => p.code === 'starter'));
    assert.ok(FALLBACK_DATA.plans.some((p) => p.code === 'pro'));
    assert.ok(FALLBACK_DATA.plans.some((p) => p.code === 'enterprise'));

    assert.ok(Array.isArray(FALLBACK_DATA.customers));
    assert.ok(FALLBACK_DATA.customers.length >= 3);

    assert.ok(Array.isArray(FALLBACK_DATA.subscriptions));
    assert.ok(FALLBACK_DATA.subscriptions.length >= 2);

    assert.ok(Array.isArray(FALLBACK_DATA.invoices));
    assert.ok(FALLBACK_DATA.invoices.length >= 2);

    assert.equal(typeof FALLBACK_DATA.analytics.mrrCents, 'number');
    assert.equal(typeof FALLBACK_DATA.analytics.arrCents, 'number');
    assert.equal(typeof FALLBACK_DATA.analytics.churnRatePercent, 'number');
  });

  it('API Client exposes expected endpoint handlers', () => {
    assert.equal(typeof healthAPI.check, 'function');
    assert.equal(typeof plansAPI.list, 'function');
    assert.equal(typeof plansAPI.getByCode, 'function');
    assert.equal(typeof customersAPI.list, 'function');
    assert.equal(typeof customersAPI.create, 'function');
    assert.equal(typeof subscriptionsAPI.list, 'function');
    assert.equal(typeof subscriptionsAPI.upgrade, 'function');
    assert.equal(typeof subscriptionsAPI.cancel, 'function');
    assert.equal(typeof usageAPI.record, 'function');
    assert.equal(typeof invoicesAPI.list, 'function');
    assert.equal(typeof invoicesAPI.pay, 'function');
    assert.equal(typeof webhooksAPI.simulate, 'function');
    assert.equal(typeof analyticsAPI.getOverview, 'function');
  });

  it('plansAPI returns fallback plans when API is offline', async () => {
    const plans = await plansAPI.list();
    assert.ok(Array.isArray(plans));
    assert.equal(plans.length, 3);
  });

  it('analyticsAPI returns fallback revenue metrics when offline', async () => {
    const metrics = await analyticsAPI.getOverview();
    assert.ok(metrics.mrrCents > 0);
    assert.ok(metrics.arrCents === metrics.mrrCents * 12);
  });
});
