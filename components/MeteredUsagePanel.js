'use client';

import { useState, useEffect } from 'react';
import { useBilling } from '@/context/BillingContext';
import { usageAPI } from '@/lib/api';
import { formatCurrency, calculateUsageOverage } from '@/lib/billingUtils';
import {
  BoltIcon,
  PlusIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
} from './Icons';

export default function MeteredUsagePanel() {
  const {
    activeCustomer,
    customers,
    selectedCustomerId,
    setSelectedCustomerId,
    subscriptions,
    plans,
    showToast,
  } = useBilling();

  const [metricName, setMetricName] = useState('api_requests');
  const [quantity, setQuantity] = useState(10000);
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [usageSummary, setUsageSummary] = useState(null);

  // Auto-generate fresh idempotency key
  const refreshKey = () => {
    setIdempotencyKey(`idem_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString().slice(-4)}`);
  };

  useEffect(() => {
    refreshKey();
  }, []);

  // Find customer's active subscription to resolve included quotas
  const sub = subscriptions.find((s) => s.customerId === selectedCustomerId && s.status === 'active');
  const currentPlan = plans.find((p) => p.code === (sub?.planCode || 'pro')) || plans[1] || plans[0];

  const fetchSummary = async () => {
    if (!selectedCustomerId) return;
    try {
      const summary = await usageAPI.getCustomerSummary(selectedCustomerId);
      setUsageSummary(summary);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [selectedCustomerId]);

  const handleRecordUsage = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await usageAPI.record({
        customerId: selectedCustomerId,
        metricName,
        quantity: Number(quantity),
        idempotencyKey,
      });

      if (res.idempotentReplay) {
        showToast(`Idempotent replay detected: duplicate event safely ignored`, 'info');
      } else {
        showToast(`Recorded ${Number(quantity).toLocaleString()} units for ${metricName}!`, 'success');
        refreshKey();
      }

      await fetchSummary();
    } catch {
      showToast('Failed to record metered usage event', 'warning');
    } finally {
      setLoading(false);
    }
  };

  // Quotas & Consumption metrics
  const apiLimit = currentPlan?.quotaLimits?.apiRequestsIncluded || 100000;
  const storageLimit = currentPlan?.quotaLimits?.storageGbIncluded || 50;
  const computeLimit = 1000; // minutes

  const apiUsed = usageSummary?.metrics?.api_requests?.used || 184500;
  const storageUsed = usageSummary?.metrics?.storage_gb?.used || 38;
  const computeUsed = usageSummary?.metrics?.compute_minutes?.used || 840;

  const apiOverage = calculateUsageOverage({
    used: apiUsed,
    included: apiLimit,
    overageRateCents: currentPlan?.overageRates?.per1kRequestsCents ? currentPlan.overageRates.per1kRequestsCents / 1000 : 0.01,
  });

  const storageOverage = calculateUsageOverage({
    used: storageUsed,
    included: storageLimit,
    overageRateCents: currentPlan?.overageRates?.perGbStorageCents || 15,
  });

  const computeOverage = calculateUsageOverage({
    used: computeUsed,
    included: computeLimit,
    overageRateCents: 5,
  });

  const totalOverage = apiOverage.overageCostCents + storageOverage.overageCostCents + computeOverage.overageCostCents;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Metered Consumption & Quota Engine
            </h2>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
              Real-time Ingestion
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracking consumption for{' '}
            <strong className="text-slate-800">{activeCustomer?.company || activeCustomer?.name}</strong>{' '}
            on <strong className="text-emerald-700">{currentPlan?.name}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500">Tenant:</span>
          <select
            aria-label="Metered Tenant"
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
          >
            {customers.map((c) => (
              <option key={c.customerId} value={c.customerId}>
                {c.company || c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Meter Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* API Requests */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              API Requests
            </span>
            <span className="text-xs font-bold text-slate-900 font-mono">
              {apiUsed.toLocaleString()} / {apiLimit.toLocaleString()}
            </span>
          </div>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(100, apiOverage.usagePercentage)}%` }}
              className={`h-full transition-all ${
                apiOverage.overageUnits > 0 ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Utilization: {apiOverage.usagePercentage}%</span>
            {apiOverage.overageUnits > 0 ? (
              <span className="text-rose-600 font-bold">
                Overage: +{apiOverage.overageUnits.toLocaleString()} units
              </span>
            ) : (
              <span className="text-emerald-600 font-medium">Within plan allowance</span>
            )}
          </div>
        </div>

        {/* Cloud Storage */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Cloud Storage
            </span>
            <span className="text-xs font-bold text-slate-900 font-mono">
              {storageUsed} GB / {storageLimit} GB
            </span>
          </div>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(100, storageOverage.usagePercentage)}%` }}
              className={`h-full transition-all ${
                storageOverage.overageUnits > 0 ? 'bg-rose-500' : 'bg-indigo-500'
              }`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Utilization: {storageOverage.usagePercentage}%</span>
            {storageOverage.overageUnits > 0 ? (
              <span className="text-rose-600 font-bold">
                Overage: +{storageOverage.overageUnits} GB
              </span>
            ) : (
              <span className="text-emerald-600 font-medium">Within plan allowance</span>
            )}
          </div>
        </div>

        {/* Compute Minutes */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Compute Runtime
            </span>
            <span className="text-xs font-bold text-slate-900 font-mono">
              {computeUsed} / {computeLimit} mins
            </span>
          </div>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(100, computeOverage.usagePercentage)}%` }}
              className={`h-full transition-all ${
                computeOverage.overageUnits > 0 ? 'bg-rose-500' : 'bg-purple-500'
              }`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Utilization: {computeOverage.usagePercentage}%</span>
            {computeOverage.overageUnits > 0 ? (
              <span className="text-rose-600 font-bold">
                Overage: +{computeOverage.overageUnits} mins
              </span>
            ) : (
              <span className="text-emerald-600 font-medium">Within plan allowance</span>
            )}
          </div>
        </div>
      </div>

      {/* Ingestion Console & Deduplication Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <BoltIcon className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              High-Throughput Meter Ingestion Pipeline
            </h3>
          </div>

          <form onSubmit={handleRecordUsage} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Metric Identifier:
                </label>
                <select
                  aria-label="Metric Identifier"
                  value={metricName}
                  onChange={(e) => setMetricName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="api_requests">api_requests (API Calls)</option>
                  <option value="storage_gb">storage_gb (Storage Usage)</option>
                  <option value="compute_minutes">compute_minutes (Compute Time)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Consumed Delta Quantity:
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider">
                  Idempotency Key (Replay Protection):
                </label>
                <button
                  type="button"
                  onClick={refreshKey}
                  className="text-[11px] text-emerald-600 hover:text-emerald-800 flex items-center space-x-1 cursor-pointer"
                >
                  <ArrowPathIcon className="w-3 h-3" />
                  <span>Generate New Key</span>
                </button>
              </div>
              <input
                type="text"
                value={idempotencyKey}
                onChange={(e) => setIdempotencyKey(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-700 font-mono text-[11px] focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Submitting the identical key twice safely yields a 200 idempotent replay without double-billing.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                <span>{loading ? 'Ingesting...' : 'Ingest Meter Record'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Total Overage Projection Box (1 col) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs uppercase tracking-wider mb-3">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
              <span>Projected Overage Fee</span>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Calculated dynamically at invoice period close and itemized onto the customer's next invoice.
            </p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                {formatCurrency(totalOverage)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-medium">
                Current unbilled overage total
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            Backed by in-memory deduplication set and MongoDB atomic <code className="text-slate-600 font-mono">$inc</code> increments.
          </div>
        </div>
      </div>
    </div>
  );
}
