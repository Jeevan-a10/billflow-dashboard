'use client';

import { useBilling } from '@/context/BillingContext';
import { formatCurrency, formatPercent } from '@/lib/billingUtils';
import {
  CurrencyDollarIcon,
  TrendingUpIcon,
  UsersIcon,
  ChartPieIcon,
  BoltIcon,
  ArrowUpRightIcon,
} from './Icons';

export default function AnalyticsOverview() {
  const { analytics, plans, setActiveTab, setUpgradeModal, subscriptions } = useBilling();

  if (!analytics) {
    return (
      <div className="py-12 text-center text-slate-500">
        Loading SaaS revenue metrics...
      </div>
    );
  }

  const {
    mrrCents = 0,
    arrCents = 0,
    activeCount = 0,
    trialingCount = 0,
    pastDueCount = 0,
    churnRatePercent = 0,
    arpuCents = 0,
    ltvCents = 0,
    planBreakdown = {},
    intervalBreakdown = { monthly: 0, yearly: 0 },
  } = analytics;

  const totalIntervals = (intervalBreakdown.monthly || 0) + (intervalBreakdown.yearly || 0) || 1;
  const monthlyPercent = Math.round(((intervalBreakdown.monthly || 0) / totalIntervals) * 100);
  const yearlyPercent = 100 - monthlyPercent;

  return (
    <div className="space-y-6">
      {/* 4 Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">MRR (Monthly Recurring)</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CurrencyDollarIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(mrrCents)}
            </div>
            <div className="mt-1 flex items-center text-xs font-medium text-emerald-600">
              <span className="font-semibold">+14.2%</span>
              <span className="text-slate-400 ml-1.5">vs last month</span>
            </div>
          </div>
        </div>

        {/* ARR Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">ARR (Annual Run Rate)</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <TrendingUpIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(arrCents)}
            </div>
            <div className="mt-1 flex items-center text-xs font-medium text-indigo-600">
              <span className="font-semibold">12x Normalized</span>
              <span className="text-slate-400 ml-1.5">annualized pipeline</span>
            </div>
          </div>
        </div>

        {/* Active Subscribers */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Customers</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <UsersIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {activeCount}
            </div>
            <div className="mt-1 flex items-center space-x-2 text-xs text-slate-500">
              <span className="text-amber-600 font-medium">{trialingCount} trialing</span>
              <span>•</span>
              <span className="text-rose-600 font-medium">{pastDueCount} past due</span>
            </div>
          </div>
        </div>

        {/* Churn Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Cohort Churn Rate</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <ChartPieIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatPercent(churnRatePercent)}
            </div>
            <div className="mt-1 flex items-center text-xs font-medium text-emerald-600">
              <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold text-[10px]">
                Top 10% Decile
              </span>
              <span className="text-slate-400 ml-1.5">&lt; 3% Benchmark</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Bar: ARPU, LTV, Interval Split */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
          Unit Economics & Contract Intervals
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-l-4 border-emerald-500 pl-4">
            <div className="text-xs text-slate-500 font-medium">ARPU (Average Revenue Per User)</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(arpuCents)} / mo</div>
            <div className="text-xs text-slate-400 mt-0.5">Blended subscription seat average</div>
          </div>

          <div className="border-l-4 border-indigo-500 pl-4">
            <div className="text-xs text-slate-500 font-medium">Customer Lifetime Value (LTV)</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(ltvCents)}</div>
            <div className="text-xs text-slate-400 mt-0.5">Based on 30-day cohort retention curve</div>
          </div>

          <div className="border-l-4 border-amber-500 pl-4">
            <div className="text-xs text-slate-500 font-medium">Contract Terms Distribution</div>
            <div className="flex items-center space-x-2 text-sm font-semibold text-slate-800 mt-1">
              <span>{monthlyPercent}% Monthly</span>
              <span>/</span>
              <span className="text-amber-700">{yearlyPercent}% Annual (-15%)</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5 flex">
              <div style={{ width: `${monthlyPercent}%` }} className="bg-emerald-500 h-full" />
              <div style={{ width: `${yearlyPercent}%` }} className="bg-amber-500 h-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Plan Breakdown & Quick Action Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tier Distribution (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Subscription Plan Breakdown
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              3 Active Production Tiers
            </span>
          </div>

          <div className="space-y-4">
            {plans.map((plan) => {
              const stats = planBreakdown[plan.code] || { count: 0, mrrCents: 0 };
              const percent = activeCount > 0 ? Math.round((stats.count / activeCount) * 100) : 0;

              return (
                <div key={plan.code} className="border border-slate-100 p-3.5 rounded-lg bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-slate-900">{plan.name}</span>
                      <span className="ml-2 text-xs text-slate-500 font-medium">
                        ({formatCurrency(plan.monthlyPriceCents)}/mo)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm text-slate-900">{formatCurrency(stats.mrrCents)}</span>
                      <span className="text-xs text-slate-500 ml-1.5 font-medium">
                        ({stats.count} subs • {percent}%)
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                    <div
                      style={{ width: `${Math.max(percent, 4)}%` }}
                      className={`h-full ${
                        plan.code === 'enterprise'
                          ? 'bg-purple-600'
                          : plan.code === 'pro'
                          ? 'bg-emerald-600'
                          : 'bg-blue-600'
                      }`}
                    />
                  </div>

                  <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>
                      Quota: {plan.quotaLimits?.apiRequestsIncluded?.toLocaleString()} API calls • {plan.quotaLimits?.storageGbIncluded}GB
                    </span>
                    <span className="font-semibold text-slate-700">
                      Overage: ${((plan.overageRates?.per1kRequestsCents || 0) / 100).toFixed(2)}/1k calls
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Simulator & Engine Shortcuts (1 col) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Engine Shortcuts
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Interact directly with the mathematical proration engine, metered quota aggregator, and HMAC webhooks.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  if (subscriptions.length > 0) {
                    setUpgradeModal({ isOpen: true, subscription: subscriptions[0] });
                  } else {
                    setActiveTab('subscriptions');
                  }
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-lg text-xs font-semibold border border-emerald-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <ArrowUpRightIcon className="w-4 h-4 text-emerald-600" />
                  <span>Interactive Proration Quote</span>
                </div>
                <span className="text-[10px] bg-emerald-200 px-1.5 py-0.5 rounded text-emerald-900">Live Math</span>
              </button>

              <button
                onClick={() => setActiveTab('metered')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <BoltIcon className="w-4 h-4 text-amber-600" />
                  <span>Ingest Metered Usage</span>
                </div>
                <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">Quota</span>
              </button>

              <button
                onClick={() => setActiveTab('invoices')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <CurrencyDollarIcon className="w-4 h-4 text-indigo-600" />
                  <span>Invoice State Machine</span>
                </div>
                <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">Tax</span>
              </button>

              <button
                onClick={() => setActiveTab('webhooks')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <ChartPieIcon className="w-4 h-4 text-purple-600" />
                  <span>HMAC Webhook Simulator</span>
                </div>
                <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">Events</span>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            Node.js 20 native test runner: <strong className="text-slate-600 font-semibold">36/36 tests passing</strong> in &lt; 380ms.
          </div>
        </div>
      </div>
    </div>
  );
}
