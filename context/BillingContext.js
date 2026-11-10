'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  healthAPI,
  plansAPI,
  customersAPI,
  subscriptionsAPI,
  invoicesAPI,
  analyticsAPI,
} from '@/lib/api';

const BillingContext = createContext(null);

export function BillingProvider({ children }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [health, setHealth] = useState({ online: false, mode: 'checking' });
  const [plans, setPlans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [subscriptions, setSubscriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modals state
  const [upgradeModal, setUpgradeModal] = useState({ isOpen: false, subscription: null });
  const [newSubModal, setNewSubModal] = useState({ isOpen: false });
  const [invoiceModal, setInvoiceModal] = useState({ isOpen: false, invoice: null });
  const [meterModal, setMeterModal] = useState({ isOpen: false });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((prev) => (prev && prev.message === message ? null : prev));
    }, 4000);
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const [hRes, pRes, cRes, sRes, iRes, aRes] = await Promise.all([
        healthAPI.check(),
        plansAPI.list(),
        customersAPI.list(),
        subscriptionsAPI.list(),
        invoicesAPI.list(),
        analyticsAPI.getOverview(),
      ]);

      setHealth(hRes);
      setPlans(pRes || []);
      setCustomers(cRes || []);
      if (!selectedCustomerId && cRes && cRes.length > 0) {
        setSelectedCustomerId(cRes[0].customerId);
      }
      setSubscriptions(sRes || []);
      setInvoices(iRes || []);
      setAnalytics(aRes || null);
    } catch (err) {
      console.error('Failed to load billing state:', err);
      showToast('Error syncing with billing engine, using fallback data', 'warning');
    } finally {
      setLoading(false);
    }
  }, [selectedCustomerId, showToast]);

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['overview', 'subscriptions', 'metered', 'invoices', 'webhooks'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
      if (params.get('modal') === 'upgrade' && subscriptions.length > 0) {
        setUpgradeModal({ isOpen: true, subscription: subscriptions[0] });
      }
      if (params.get('modal') === 'invoice' && invoices.length > 0) {
        setInvoiceModal({ isOpen: true, invoice: invoices[0] });
      }
    }
  }, [subscriptions, invoices]);

  const activeCustomer = customers.find((c) => c.customerId === selectedCustomerId) || customers[0] || null;

  const value = {
    activeTab,
    setActiveTab,
    health,
    plans,
    customers,
    selectedCustomerId,
    setSelectedCustomerId,
    activeCustomer,
    subscriptions,
    setSubscriptions,
    invoices,
    setInvoices,
    analytics,
    setAnalytics,
    loading,
    refreshAll,
    toast,
    showToast,
    // Modals
    upgradeModal,
    setUpgradeModal,
    newSubModal,
    setNewSubModal,
    invoiceModal,
    setInvoiceModal,
    meterModal,
    setMeterModal,
  };

  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
}

export function useBilling() {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error('useBilling must be used within a BillingProvider');
  }
  return context;
}
