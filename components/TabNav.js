'use client';

import { useBilling } from '@/context/BillingContext';
import {
  CurrencyDollarIcon,
  CreditCardIcon,
  BoltIcon,
  DocumentTextIcon,
  WebhookIcon,
} from './Icons';

export default function TabNav() {
  const { activeTab, setActiveTab, subscriptions, invoices } = useBilling();

  const tabs = [
    {
      id: 'overview',
      name: 'MRR & Revenue Analytics',
      icon: CurrencyDollarIcon,
    },
    {
      id: 'subscriptions',
      name: 'Subscriptions & Proration',
      icon: CreditCardIcon,
      badge: subscriptions.length,
    },
    {
      id: 'metered',
      name: 'Metered Usage & Quotas',
      icon: BoltIcon,
    },
    {
      id: 'invoices',
      name: 'Invoices & Regional Tax',
      icon: DocumentTextIcon,
      badge: invoices.length,
    },
    {
      id: 'webhooks',
      name: 'Webhook Simulator & Audit',
      icon: WebhookIcon,
    },
  ];

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{tab.name}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
