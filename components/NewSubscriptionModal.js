'use client';

import { useState } from 'react';
import { useBilling } from '@/context/BillingContext';
import { subscriptionsAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/billingUtils';
import { XMarkIcon, PlusIcon, CreditCardIcon } from './Icons';

export default function NewSubscriptionModal() {
  const {
    newSubModal,
    setNewSubModal,
    plans,
    customers,
    selectedCustomerId,
    refreshAll,
    showToast,
  } = useBilling();

  const [customerId, setCustomerId] = useState(selectedCustomerId || (customers[0]?.customerId || ''));
  const [planCode, setPlanCode] = useState('pro');
  const [billingInterval, setBillingInterval] = useState('monthly');
  const [seats, setSeats] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!newSubModal.isOpen) return null;

  const selectedPlan = plans.find((p) => p.code === planCode) || plans[0];
  const unitPrice = billingInterval === 'yearly'
    ? (selectedPlan?.yearlyPriceCents || 0)
    : (selectedPlan?.monthlyPriceCents || 0);
  const totalPrice = unitPrice * seats;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await subscriptionsAPI.create({
        customerId,
        planCode,
        billingInterval,
        seats,
      });

      showToast(`Subscription provisioned successfully for ${selectedPlan?.name}!`, 'success');
      setNewSubModal({ isOpen: false });
      await refreshAll();
    } catch {
      showToast('Failed to provision subscription', 'warning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <CreditCardIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Provision Subscription</h3>
              <p className="text-xs text-slate-500">Assign a customer to a recurring billing plan</p>
            </div>
          </div>
          <button
            onClick={() => setNewSubModal({ isOpen: false })}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 text-xs">
            {/* Customer select */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Customer Account:
              </label>
              <select
                aria-label="Target Customer Account"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {customers.map((c) => (
                  <option key={c.customerId} value={c.customerId}>
                    {c.company || c.name} — {c.email} ({c.customerId})
                  </option>
                ))}
              </select>
            </div>

            {/* Plan Select */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Subscription Plan Tier:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {plans.map((p) => (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => setPlanCode(p.code)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      planCode === p.code
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 hover:border-slate-300 bg-white font-medium text-slate-700'
                    }`}
                  >
                    <div>{p.name}</div>
                    <div className="text-[11px] text-emerald-700 mt-0.5">
                      {formatCurrency(p.monthlyPriceCents)}/mo
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Interval & Seats */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Billing Interval:
                </label>
                <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setBillingInterval('monthly')}
                    className={`flex-1 py-2 text-center font-semibold cursor-pointer ${
                      billingInterval === 'monthly' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingInterval('yearly')}
                    className={`flex-1 py-2 text-center font-semibold cursor-pointer ${
                      billingInterval === 'yearly' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'
                    }`}
                  >
                    Annual (-15%)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Seats Multiplier:
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={seats}
                  onChange={(e) => setSeats(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Total Summary */}
            <div className="border border-slate-200 bg-slate-50 rounded-xl p-3 flex items-center justify-between">
              <span className="font-medium text-slate-600">Recurring Price per Cycle:</span>
              <span className="font-bold text-base text-slate-900">
                {formatCurrency(totalPrice)}
                <span className="text-xs text-slate-500 font-normal">
                  /{billingInterval === 'yearly' ? 'year' : 'month'}
                </span>
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setNewSubModal({ isOpen: false })}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              <span>{loading ? 'Provisioning...' : 'Provision Subscription'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
