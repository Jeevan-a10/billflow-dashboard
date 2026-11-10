import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'bf_live_test_api_key_secret_2026';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
});

// Seeded Fallback / Demo Data Store
export const FALLBACK_DATA = {
  plans: [
    {
      planId: 'plan_starter',
      code: 'starter',
      name: 'Starter Plan',
      description: 'Ideal for early-stage startups and small projects',
      monthlyPriceCents: 2900,
      yearlyPriceCents: 29000,
      quotaLimits: {
        apiRequestsIncluded: 50000,
        storageGbIncluded: 10,
        seatsIncluded: 3,
      },
      overageRates: {
        per1kRequestsCents: 15,
        perGbStorageCents: 20,
        perAdditionalSeatCents: 500,
      },
    },
    {
      planId: 'plan_pro',
      code: 'pro',
      name: 'Professional Plan',
      description: 'Built for scaling engineering teams and fast-growing SaaS',
      monthlyPriceCents: 9900,
      yearlyPriceCents: 99000,
      quotaLimits: {
        apiRequestsIncluded: 250000,
        storageGbIncluded: 50,
        seatsIncluded: 10,
      },
      overageRates: {
        per1kRequestsCents: 10,
        perGbStorageCents: 15,
        perAdditionalSeatCents: 400,
      },
    },
    {
      planId: 'plan_enterprise',
      code: 'enterprise',
      name: 'Enterprise Tier',
      description: 'High-throughput infrastructure, 99.99% SLA, and custom SLAs',
      monthlyPriceCents: 29900,
      yearlyPriceCents: 299000,
      quotaLimits: {
        apiRequestsIncluded: 1000000,
        storageGbIncluded: 250,
        seatsIncluded: 50,
      },
      overageRates: {
        per1kRequestsCents: 5,
        perGbStorageCents: 10,
        perAdditionalSeatCents: 300,
      },
    },
  ],
  customers: [
    {
      customerId: 'cus_acme_corp',
      email: 'alex@acme-corp.com',
      name: 'Alex Rivera',
      company: 'Acme Technologies Inc.',
      country: 'US',
      currency: 'USD',
      balanceCents: 0,
      delinquent: false,
    },
    {
      customerId: 'cus_synth_ai',
      email: 'elena@synthlabs.io',
      name: 'Elena Rostova',
      company: 'SynthLabs AI',
      country: 'GB',
      currency: 'USD',
      balanceCents: 1500,
      delinquent: false,
    },
    {
      customerId: 'cus_cloudscale',
      email: 'marcus@cloudscale.net',
      name: 'Marcus Chen',
      company: 'CloudScale Systems',
      country: 'DE',
      currency: 'USD',
      balanceCents: 0,
      delinquent: false,
    },
    {
      customerId: 'cus_hypernova',
      email: 'priya@hypernova.dev',
      name: 'Priya Sharma',
      company: 'Hypernova Cloud',
      country: 'IN',
      currency: 'USD',
      balanceCents: 0,
      delinquent: false,
    },
  ],
  subscriptions: [
    {
      subscriptionId: 'sub_live_01',
      customerId: 'cus_acme_corp',
      customerName: 'Alex Rivera (Acme Technologies)',
      planCode: 'pro',
      planName: 'Professional Plan',
      status: 'active',
      billingInterval: 'monthly',
      seats: 5,
      unitPriceCents: 9900,
      currentPeriodStart: new Date(Date.now() - 12 * 86400000).toISOString(),
      currentPeriodEnd: new Date(Date.now() + 18 * 86400000).toISOString(),
      cancelAtPeriodEnd: false,
    },
    {
      subscriptionId: 'sub_live_02',
      customerId: 'cus_synth_ai',
      customerName: 'Elena Rostova (SynthLabs AI)',
      planCode: 'enterprise',
      planName: 'Enterprise Tier',
      status: 'active',
      billingInterval: 'yearly',
      seats: 25,
      unitPriceCents: 299000,
      currentPeriodStart: new Date(Date.now() - 45 * 86400000).toISOString(),
      currentPeriodEnd: new Date(Date.now() + 320 * 86400000).toISOString(),
      cancelAtPeriodEnd: false,
    },
    {
      subscriptionId: 'sub_live_03',
      customerId: 'cus_cloudscale',
      customerName: 'Marcus Chen (CloudScale Systems)',
      planCode: 'starter',
      planName: 'Starter Plan',
      status: 'active',
      billingInterval: 'monthly',
      seats: 2,
      unitPriceCents: 2900,
      currentPeriodStart: new Date(Date.now() - 5 * 86400000).toISOString(),
      currentPeriodEnd: new Date(Date.now() + 25 * 86400000).toISOString(),
      cancelAtPeriodEnd: false,
    },
  ],
  invoices: [
    {
      invoiceId: 'inv_88019a',
      invoiceNumber: 'INV-2026-00101',
      customerId: 'cus_acme_corp',
      customerName: 'Acme Technologies Inc.',
      status: 'paid',
      subtotalCents: 9900,
      taxCents: 817,
      taxRate: 0.0825,
      taxJurisdiction: 'US California',
      discountCents: 0,
      totalCents: 10717,
      lineItems: [
        { description: 'Professional Plan (Monthly) - 5 seats', amountCents: 9900 },
      ],
      createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
      paidAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    },
    {
      invoiceId: 'inv_88019b',
      invoiceNumber: 'INV-2026-00102',
      customerId: 'cus_synth_ai',
      customerName: 'SynthLabs AI',
      status: 'paid',
      subtotalCents: 299000,
      taxCents: 59800,
      taxRate: 0.20,
      taxJurisdiction: 'UK VAT',
      discountCents: 1500,
      totalCents: 357300,
      lineItems: [
        { description: 'Enterprise Tier (Yearly) - 25 seats', amountCents: 299000 },
      ],
      createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
      paidAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    },
    {
      invoiceId: 'inv_88019c',
      invoiceNumber: 'INV-2026-00103',
      customerId: 'cus_cloudscale',
      customerName: 'CloudScale Systems',
      status: 'open',
      subtotalCents: 2900,
      taxCents: 551,
      taxRate: 0.19,
      taxJurisdiction: 'EU VAT Germany',
      discountCents: 0,
      totalCents: 3451,
      lineItems: [
        { description: 'Starter Plan (Monthly) - 2 seats', amountCents: 2900 },
      ],
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      paidAt: null,
    },
  ],
  analytics: {
    mrrCents: 1245000, // $12,450.00
    arrCents: 14940000, // $149,400.00
    activeCount: 142,
    trialingCount: 18,
    pastDueCount: 3,
    canceledCount: 4,
    arpuCents: 8767, // $87.67
    churnRatePercent: 2.74,
    ltvCents: 320000, // $3,200.00
    intervalBreakdown: {
      monthly: 108,
      yearly: 34,
    },
    planBreakdown: {
      starter: { count: 68, mrrCents: 197200 },
      pro: { count: 54, mrrCents: 534600 },
      enterprise: { count: 20, mrrCents: 513200 },
    },
  },
  usageSummary: {
    customerId: 'cus_acme_corp',
    metrics: {
      api_requests: { used: 184500, included: 250000, overageUnits: 0, overageCostCents: 0 },
      storage_gb: { used: 38, included: 50, overageUnits: 0, overageCostCents: 0 },
      compute_minutes: { used: 840, included: 1000, overageUnits: 0, overageCostCents: 0 },
    },
    totalOverageCostCents: 0,
  },
  webhookEvents: [
    {
      id: 'evt_sim_01',
      type: 'payment_intent.succeeded',
      created: Date.now() - 3600000,
      data: { invoiceId: 'inv_88019a', customerId: 'cus_acme_corp', amountCents: 10717 },
      status: 'processed',
      signature: 'sha256=3c9b78e47f...',
    },
    {
      id: 'evt_sim_02',
      type: 'payment_intent.succeeded',
      created: Date.now() - 7200000,
      data: { invoiceId: 'inv_88019b', customerId: 'cus_synth_ai', amountCents: 357300 },
      status: 'processed',
      signature: 'sha256=a18d94e10b...',
    },
  ],
};

// Health Check API
export const healthAPI = {
  check: async () => {
    try {
      const res = await apiClient.get('/health');
      return { online: true, ...res.data };
    } catch {
      return { online: false, mode: 'fallback-demo' };
    }
  },
};

// Plans API
export const plansAPI = {
  list: async () => {
    try {
      const res = await apiClient.get('/api/v1/plans');
      return res.data.data;
    } catch {
      return FALLBACK_DATA.plans;
    }
  },
  getByCode: async (code) => {
    try {
      const res = await apiClient.get(`/api/v1/plans/${code}`);
      return res.data.data;
    } catch {
      return FALLBACK_DATA.plans.find((p) => p.code === code) || null;
    }
  },
};

// Customers API
export const customersAPI = {
  list: async () => {
    try {
      const res = await apiClient.get('/api/v1/customers');
      return res.data.data;
    } catch {
      return FALLBACK_DATA.customers;
    }
  },
  getById: async (id) => {
    try {
      const res = await apiClient.get(`/api/v1/customers/${id}`);
      return res.data.data;
    } catch {
      return FALLBACK_DATA.customers.find((c) => c.customerId === id) || null;
    }
  },
  create: async (data) => {
    try {
      const res = await apiClient.post('/api/v1/customers', data);
      return res.data.data;
    } catch {
      const newCus = {
        customerId: `cus_${Math.random().toString(36).substring(2, 9)}`,
        ...data,
        balanceCents: 0,
        delinquent: false,
      };
      FALLBACK_DATA.customers.unshift(newCus);
      return newCus;
    }
  },
  adjustBalance: async (id, amountCents, reason) => {
    try {
      const res = await apiClient.post(`/api/v1/customers/${id}/balance`, { amountCents, reason });
      return res.data.data;
    } catch {
      const cus = FALLBACK_DATA.customers.find((c) => c.customerId === id);
      if (cus) cus.balanceCents += amountCents;
      return cus;
    }
  },
};

// Subscriptions API
export const subscriptionsAPI = {
  list: async (params = {}) => {
    try {
      const res = await apiClient.get('/api/v1/subscriptions', { params });
      return res.data.data;
    } catch {
      let filtered = [...FALLBACK_DATA.subscriptions];
      if (params.customerId) filtered = filtered.filter((s) => s.customerId === params.customerId);
      if (params.status) filtered = filtered.filter((s) => s.status === params.status);
      return filtered;
    }
  },
  getById: async (id) => {
    try {
      const res = await apiClient.get(`/api/v1/subscriptions/${id}`);
      return res.data.data;
    } catch {
      return FALLBACK_DATA.subscriptions.find((s) => s.subscriptionId === id) || null;
    }
  },
  create: async (data) => {
    try {
      const res = await apiClient.post('/api/v1/subscriptions', data);
      return res.data.data;
    } catch {
      const plan = FALLBACK_DATA.plans.find((p) => p.code === data.planCode) || FALLBACK_DATA.plans[0];
      const newSub = {
        subscriptionId: `sub_${Math.random().toString(36).substring(2, 9)}`,
        customerId: data.customerId,
        planCode: data.planCode,
        planName: plan.name,
        status: 'active',
        billingInterval: data.billingInterval || 'monthly',
        seats: data.seats || 1,
        unitPriceCents: data.billingInterval === 'yearly' ? plan.yearlyPriceCents : plan.monthlyPriceCents,
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
        cancelAtPeriodEnd: false,
      };
      FALLBACK_DATA.subscriptions.unshift(newSub);
      return newSub;
    }
  },
  upgrade: async (id, data) => {
    try {
      const res = await apiClient.post(`/api/v1/subscriptions/${id}/upgrade`, data);
      return res.data.data;
    } catch {
      const sub = FALLBACK_DATA.subscriptions.find((s) => s.subscriptionId === id);
      const plan = FALLBACK_DATA.plans.find((p) => p.code === data.newPlanCode) || FALLBACK_DATA.plans[1];
      if (data.previewOnly) {
        return {
          previewOnly: true,
          subscriptionId: id,
          currentPlanCode: sub ? sub.planCode : 'starter',
          newPlanCode: data.newPlanCode,
          proration: {
            daysRemaining: 18,
            daysInCycle: 30,
            unusedCreditCents: 5940,
            proratedChargeCents: 17940,
            netAdjustmentCents: 12000,
          },
        };
      }
      if (sub) {
        sub.planCode = data.newPlanCode;
        sub.planName = plan.name;
        if (data.newSeats) sub.seats = data.newSeats;
      }
      return { subscription: sub };
    }
  },
  cancel: async (id, data = {}) => {
    try {
      const res = await apiClient.post(`/api/v1/subscriptions/${id}/cancel`, data);
      return res.data.data;
    } catch {
      const sub = FALLBACK_DATA.subscriptions.find((s) => s.subscriptionId === id);
      if (sub) {
        if (data.immediate) {
          sub.status = 'canceled';
        } else {
          sub.cancelAtPeriodEnd = true;
        }
      }
      return sub;
    }
  },
};

// Usage API
export const usageAPI = {
  record: async (data) => {
    try {
      const res = await apiClient.post('/api/v1/usage', data);
      return res.data.data;
    } catch {
      return {
        recordId: `usg_${Math.random().toString(36).substring(2, 9)}`,
        ...data,
        timestamp: new Date().toISOString(),
      };
    }
  },
  getCustomerSummary: async (customerId) => {
    try {
      const res = await apiClient.get(`/api/v1/usage/customer/${customerId}`);
      return res.data.data;
    } catch {
      return {
        ...FALLBACK_DATA.usageSummary,
        customerId,
      };
    }
  },
};

// Invoices API
export const invoicesAPI = {
  list: async (params = {}) => {
    try {
      const res = await apiClient.get('/api/v1/invoices', { params });
      return res.data.data;
    } catch {
      let list = [...FALLBACK_DATA.invoices];
      if (params.customerId) list = list.filter((i) => i.customerId === params.customerId);
      if (params.status) list = list.filter((i) => i.status === params.status);
      return list;
    }
  },
  getById: async (id) => {
    try {
      const res = await apiClient.get(`/api/v1/invoices/${id}`);
      return res.data.data;
    } catch {
      return FALLBACK_DATA.invoices.find((i) => i.invoiceId === id || i.invoiceNumber === id) || null;
    }
  },
  pay: async (id) => {
    try {
      const res = await apiClient.post(`/api/v1/invoices/${id}/pay`);
      return res.data.data;
    } catch {
      const inv = FALLBACK_DATA.invoices.find((i) => i.invoiceId === id);
      if (inv) {
        inv.status = 'paid';
        inv.paidAt = new Date().toISOString();
      }
      return inv;
    }
  },
  void: async (id) => {
    try {
      const res = await apiClient.post(`/api/v1/invoices/${id}/void`);
      return res.data.data;
    } catch {
      const inv = FALLBACK_DATA.invoices.find((i) => i.invoiceId === id);
      if (inv) inv.status = 'void';
      return inv;
    }
  },
};

// Webhooks API
export const webhooksAPI = {
  simulate: async (eventType, customData = {}) => {
    try {
      const res = await apiClient.post('/api/v1/webhooks/simulate', { eventType, data: customData });
      return res.data.data;
    } catch {
      const simEvent = {
        id: `evt_sim_${Date.now()}`,
        type: eventType || 'payment_intent.succeeded',
        created: Date.now(),
        data: customData,
        signature: 'sha256=simulated_hmac_key_digest_' + Math.random().toString(36).substring(2, 10),
        status: 'processed',
      };
      FALLBACK_DATA.webhookEvents.unshift(simEvent);
      return simEvent;
    }
  },
  getEvents: async () => {
    try {
      const res = await apiClient.get('/api/v1/webhooks/events');
      return res.data.data;
    } catch {
      return FALLBACK_DATA.webhookEvents;
    }
  },
};

// Analytics API
export const analyticsAPI = {
  getOverview: async () => {
    try {
      const res = await apiClient.get('/api/v1/analytics/overview');
      return res.data.data;
    } catch {
      return FALLBACK_DATA.analytics;
    }
  },
};
