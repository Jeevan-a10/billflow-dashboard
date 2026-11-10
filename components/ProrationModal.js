'use client';

import { useState, useEffect } from 'react';
import { useBilling } from '@/context/BillingContext';
import { subscriptionsAPI } from '@/lib/api';
import { formatCurrency, calculateProrationQuote } from '@/lib/billingUtils';
import {
  XMarkIcon,
  CalculatorIcon,
  ArrowUpRightIcon,
  CheckCircleIcon,
} from './Icons';

export default function ProrationModal() {
  const {
    upgradeModal,
    setUpgradeModal,
    plans,
    setSubscriptions,
    showToast,
    refreshAll,
  } = useBilling();

  const sub = upgradeModal.subscription;

  const [selectedPlanCode, setSelectedPlanCode] = useState('pro');
  const [selectedSeats, setSelectedSeats] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sub) {
      // Pick next plan or default
      const currentCode = sub.planCode;
      const targetCode = currentCode === 'starter' ? 'pro' : currentCode === 'pro' ? 'enterprise' : 'starter';
      setSelectedPlanCode(targetCode);
      setSelectedSeats(sub.seats || 1);
    }
  }, [sub]);

  if (!upgradeModal.isOpen || !sub) return null;

  const currentPlan = plans.find((p) => p.code === sub.planCode) || plans[0];
  const targetPlan = plans.find((p) => p.code === selectedPlanCode) || plans[1] || plans[0];

  // Calculate live proration quote
  const currentPlanPrice = sub.billingInterval === 'yearly'
    ? (currentPlan?.yearlyPriceCents || 0)
    : (currentPlan?.monthlyPriceCents || 0);

  const targetPlanPrice = sub.billingInterval === 'yearly'
    ? (targetPlan?.yearlyPriceCents || 0)
    : (targetPlan?.monthlyPriceCents || 0);

  // Compute days remaining from currentPeriodEnd
  let daysRemaining = 18;
  if (sub.currentPeriodEnd) {
    const end = new Date(sub.currentPeriodEnd).getTime();
    const now = Date.now();
    const diff = Math.max(0, Math.ceil((end - now) / 86400000));
    daysRemaining = Math.min(diff, 30);
  }

  const quote = calculateProrationQuote({
    currentPlanPriceCents: currentPlanPrice,
    newPlanPriceCents: targetPlanPrice,
    currentSeats: sub.seats || 1,
    newSeats: selectedSeats,
    daysRemaining,
    daysInCycle: 30,
  });

  const handleApplyUpgrade = async () => {
    setLoading(true);
    try {
      const res = await subscriptionsAPI.upgrade(sub.subscriptionId, {
        newPlanCode: selectedPlanCode,
        newSeats: selectedSeats,
        previewOnly: false,
      });

      showToast(
        `Subscription upgraded to ${targetPlan?.name} (${selectedSeats} seats)! Net adjustment: ${formatCurrency(quote.netAdjustmentCents)}`,
        'success'
      );

      setUpgradeModal({ isOpen: false, subscription: null });
      await refreshAll();
    } catch (err) {
      console.error(err);
      showToast('Upgrade execution failed', 'warning');
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
              <CalculatorIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Mid-Cycle Proration Engine
              </h3>
              <p className="text-xs text-slate-500">
                Plan & seat adjustment with exact credit proration
              </p>
            </div>
          </div>
          <button
            onClick={() => setUpgradeModal({ isOpen: false, subscription: null })}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Active Subscription Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">Current Subscription:</span>
              <div className="font-bold text-slate-800 text-sm mt-0.5">
                {currentPlan?.name} ({sub.seats || 1} {sub.seats === 1 ? 'seat' : 'seats'})
              </div>
            </div>
            <div className="text-right">
              <span className="text-slate-500">Days Remaining in Cycle:</span>
              <div className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                {quote.daysRemaining} of {quote.daysInCycle} days
              </div>
            </div>
          </div>

          {/* New Plan Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select New Target Plan:
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {plans.map((p) => {
                const isSelected = selectedPlanCode === p.code;
                return (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => setSelectedPlanCode(p.code)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900">{p.name}</div>
                    <div className="text-xs font-semibold text-emerald-700 mt-1">
                      {formatCurrency(p.monthlyPriceCents)}
                      <span className="text-[10px] text-slate-500 font-normal">/mo</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seat Count Adjuster */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                User Seats Multiplier:
              </label>
              <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                {selectedSeats} {selectedSeats === 1 ? 'seat' : 'seats'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="25"
              value={selectedSeats}
              onChange={(e) => setSelectedSeats(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* Proration Mathematical Breakdown Box */}
          <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Unused credit of current plan ({quote.daysRemaining} days):</span>
              <span className="font-mono font-semibold text-rose-600">
                -{formatCurrency(quote.unusedCreditCents)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Prorated charge for new plan ({selectedSeats} seats):</span>
              <span className="font-mono font-semibold text-slate-800">
                +{formatCurrency(quote.proratedChargeCents)}
              </span>
            </div>

            <div className="pt-2.5 border-t border-emerald-200 flex items-center justify-between text-sm font-bold text-slate-900">
              <span>Net Adjustment Due Today:</span>
              <span className="font-mono text-emerald-700 text-base">
                {formatCurrency(quote.netAdjustmentCents)}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => setUpgradeModal({ isOpen: false, subscription: null })}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleApplyUpgrade}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <ArrowUpRightIcon className="w-3.5 h-3.5" />
            <span>{loading ? 'Processing...' : 'Confirm Upgrade & Generate Invoice'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
