'use client';

import { useState } from 'react';
import { useBilling } from '@/context/BillingContext';
import { formatCurrency, formatDate } from '@/lib/billingUtils';
import { subscriptionsAPI } from '@/lib/api';
import {
  CreditCardIcon,
  ArrowUpRightIcon,
  XCircleIcon,
  CheckCircleIcon,
  PlusIcon,
} from './Icons';

export default function SubscriptionManager() {
  const {
    subscriptions,
    setSubscriptions,
    setUpgradeModal,
    setNewSubModal,
    showToast,
    selectedCustomerId,
    customers,
  } = useBilling();

  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = subscriptions.filter((sub) => {
    if (filterStatus !== 'all' && sub.status !== filterStatus) return false;
    return true;
  });

  const handleCancel = async (sub, immediate = false) => {
    const confirmMsg = immediate
      ? `Are you sure you want to immediately terminate subscription ${sub.subscriptionId}?`
      : `Schedule subscription ${sub.subscriptionId} for cancellation at end of current period?`;

    if (!confirm(confirmMsg)) return;

    try {
      const updated = await subscriptionsAPI.cancel(sub.subscriptionId, { immediate });
      setSubscriptions((prev) =>
        prev.map((s) => (s.subscriptionId === sub.subscriptionId ? { ...s, ...updated } : s))
      );
      showToast(
        immediate
          ? `Subscription ${sub.subscriptionId} canceled immediately`
          : `Subscription scheduled to cancel at end of period`,
        'info'
      );
    } catch {
      showToast('Failed to cancel subscription', 'warning');
    }
  };

  const getStatusBadge = (status, cancelAtPeriodEnd) => {
    if (cancelAtPeriodEnd) {
      return (
        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
          Cancels at Period End
        </span>
      );
    }
    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>Active</span>
          </span>
        );
      case 'trialing':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            Trialing
          </span>
        );
      case 'past_due':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-200">
            Past Due
          </span>
        );
      case 'canceled':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            Canceled
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Filter:</span>
          {['all', 'active', 'trialing', 'past_due', 'canceled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium capitalize transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <button
          onClick={() => setNewSubModal({ isOpen: true })}
          className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <PlusIcon className="w-3.5 h-3.5" />
          <span>Provision Subscription</span>
        </button>
      </div>

      {/* Subscription Cards / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No subscriptions matching filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Subscription ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Plan & Seats</th>
                  <th className="py-3 px-4">Amount / Cycle</th>
                  <th className="py-3 px-4">Period End / Renewal</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((sub) => {
                  const customer =
                    customers.find((c) => c.customerId === sub.customerId) || {
                      name: sub.customerName || sub.customerId,
                      email: '',
                    };

                  return (
                    <tr key={sub.subscriptionId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-900 font-semibold">
                        {sub.subscriptionId}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{customer.company || customer.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{sub.customerId}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-semibold text-slate-800 capitalize">
                            {sub.planName || sub.planCode}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                            {sub.seats || 1} {sub.seats === 1 ? 'seat' : 'seats'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 capitalize">
                          {sub.billingInterval} billing
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {formatCurrency((sub.unitPriceCents || 0) * (sub.seats || 1))}
                        <span className="text-slate-400 text-[10px] font-normal">
                          /{sub.billingInterval === 'yearly' ? 'yr' : 'mo'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {formatDate(sub.currentPeriodEnd)}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(sub.status, sub.cancelAtPeriodEnd)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {sub.status === 'active' && (
                            <button
                              onClick={() => setUpgradeModal({ isOpen: true, subscription: sub })}
                              className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-md font-semibold text-[11px] border border-emerald-200 transition-colors cursor-pointer"
                              title="Calculate mid-cycle proration & upgrade"
                            >
                              <ArrowUpRightIcon className="w-3 h-3 text-emerald-600" />
                              <span>Change Plan</span>
                            </button>
                          )}

                          {sub.status === 'active' && !sub.cancelAtPeriodEnd && (
                            <button
                              onClick={() => handleCancel(sub, false)}
                              className="px-2 py-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md font-medium text-[11px] transition-colors cursor-pointer"
                              title="Cancel at end of billing cycle"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
