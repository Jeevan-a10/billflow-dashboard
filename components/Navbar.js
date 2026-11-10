'use client';

import { useBilling } from '@/context/BillingContext';
import { LogoIcon, ArrowPathIcon, PlusIcon } from './Icons';

export default function Navbar() {
  const {
    health,
    customers,
    selectedCustomerId,
    setSelectedCustomerId,
    refreshAll,
    loading,
    setNewSubModal,
  } = useBilling();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-center">
              <LogoIcon className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">BillFlow</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  v1.0 SaaS
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Subscription Billing, Proration & Metered Invoicing Engine
              </p>
            </div>
          </div>

          {/* Controls: Customer switcher, Health badge, Refresh, CTA */}
          <div className="flex items-center space-x-3">
            {/* Customer Switcher */}
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
              <span className="text-xs text-slate-500 font-medium hidden md:inline">Tenant:</span>
              <select
                aria-label="Active Tenant"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="text-xs font-semibold text-slate-800 bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer"
              >
                {customers.map((c) => (
                  <option key={c.customerId} value={c.customerId}>
                    {c.company || c.name} ({c.customerId})
                  </option>
                ))}
              </select>
            </div>

            {/* Health / Connection Badge */}
            <div
              className={`flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-full border ${
                health.online
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
              title={health.online ? 'Connected to BillFlow API (Port 5002)' : 'Using Fallback / Demo In-Memory Store'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  health.online ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="font-medium hidden sm:inline">
                {health.online ? 'API Live' : 'Demo Mode'}
              </span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={refreshAll}
              disabled={loading}
              title="Refresh Data from API"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {/* New Subscription CTA */}
            <button
              onClick={() => setNewSubModal({ isOpen: true })}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              <span>New Subscription</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
