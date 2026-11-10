'use client';

import { useBilling } from '@/context/BillingContext';
import AnalyticsOverview from '@/components/AnalyticsOverview';
import SubscriptionManager from '@/components/SubscriptionManager';
import MeteredUsagePanel from '@/components/MeteredUsagePanel';
import InvoiceHub from '@/components/InvoiceHub';
import WebhookSimulator from '@/components/WebhookSimulator';

export default function DashboardHome() {
  const { activeTab } = useBilling();

  return (
    <div className="space-y-6 animate-fade-in">
      {activeTab === 'overview' && <AnalyticsOverview />}
      {activeTab === 'subscriptions' && <SubscriptionManager />}
      {activeTab === 'metered' && <MeteredUsagePanel />}
      {activeTab === 'invoices' && <InvoiceHub />}
      {activeTab === 'webhooks' && <WebhookSimulator />}
    </div>
  );
}
