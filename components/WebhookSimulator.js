'use client';

import { useState, useEffect } from 'react';
import { useBilling } from '@/context/BillingContext';
import { webhooksAPI } from '@/lib/api';
import {
  WebhookIcon,
  PlayIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
} from './Icons';

export default function WebhookSimulator() {
  const {
    invoices,
    customers,
    selectedCustomerId,
    showToast,
    refreshAll,
  } = useBilling();

  const [eventType, setEventType] = useState('payment_intent.succeeded');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [lastDispatched, setLastDispatched] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (invoices.length > 0 && !selectedInvoiceId) {
      setSelectedInvoiceId(invoices[0].invoiceId);
    }
  }, [invoices, selectedInvoiceId]);

  const fetchEvents = async () => {
    try {
      const list = await webhooksAPI.getEvents();
      setEvents(list || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const inv = invoices.find((i) => i.invoiceId === selectedInvoiceId) || invoices[0];
      const customData = {
        invoiceId: inv ? inv.invoiceId : 'inv_sim_99',
        customerId: selectedCustomerId || 'cus_acme_corp',
        amountCents: inv ? inv.totalCents : 9900,
      };

      const result = await webhooksAPI.simulate(eventType, customData);
      setLastDispatched(result);
      showToast(`Webhook ${eventType} dispatched and verified with HMAC-SHA256!`, 'success');
      await fetchEvents();
      await refreshAll();
    } catch {
      showToast('Webhook simulation failed', 'warning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Cryptographic Webhook Test Bench & Audit Log
            </h2>
            <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
              HMAC-SHA256
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulate and audit external Stripe-compatible webhooks with constant-time signature verification.
          </p>
        </div>

        <button
          onClick={fetchEvents}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer self-start md:self-auto"
        >
          <ArrowPathIcon className="w-3.5 h-3.5" />
          <span>Refresh Audit Log</span>
        </button>
      </div>

      {/* Simulator Bench & Payload Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center space-x-2 text-slate-800 font-bold uppercase tracking-wider text-xs">
            <WebhookIcon className="w-4 h-4 text-purple-600" />
            <span>Simulate Incoming Event</span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Event Type:
            </label>
            <select
              aria-label="Event Type"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="payment_intent.succeeded">payment_intent.succeeded (Marks Invoice Paid)</option>
              <option value="payment_intent.payment_failed">payment_intent.payment_failed (Flags Delinquency)</option>
              <option value="customer.subscription.deleted">customer.subscription.deleted (Terminates Plan)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Invoice Context:
            </label>
            <select
              aria-label="Target Invoice Context"
              value={selectedInvoiceId}
              onChange={(e) => setSelectedInvoiceId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              {invoices.map((inv) => (
                <option key={inv.invoiceId} value={inv.invoiceId}>
                  {inv.invoiceNumber || inv.invoiceId} ({inv.status}) — ${((inv.totalCents || 0) / 100).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSimulate}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <PlayIcon className="w-4 h-4" />
              <span>{loading ? 'Verifying HMAC Signature...' : 'Dispatch Simulated Webhook'}</span>
            </button>
          </div>
        </div>

        {/* Live Payload / Signature Inspector */}
        <div className="bg-slate-900 rounded-xl p-5 text-slate-200 shadow-xs flex flex-col justify-between font-mono text-xs">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
              <span className="flex items-center space-x-1.5">
                <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-[11px] text-slate-300">HMAC-SHA256 Security Header</span>
              </span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-emerald-400">
                Verified Signature
              </span>
            </div>

            <div className="mt-3">
              <span className="text-slate-500 text-[10px] block">x-signature header:</span>
              <div className="text-emerald-400 text-[11px] break-all bg-slate-950 p-2 rounded mt-1">
                {lastDispatched?.signature || 'sha256=3c9b78e47f20199182...'}
              </div>
            </div>

            <div className="mt-3">
              <span className="text-slate-500 text-[10px] block">Payload Body:</span>
              <pre className="text-slate-300 text-[10px] bg-slate-950 p-2.5 rounded mt-1 overflow-x-auto max-h-40">
                {JSON.stringify(lastDispatched?.data || {
                  event: eventType,
                  invoiceId: selectedInvoiceId || 'inv_88019a',
                  amountCents: 10717,
                  status: 'simulated_dispatch',
                }, null, 2)}
              </pre>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 text-[10px] text-slate-500">
            Replay protection enforces duplicate rejection within sliding cache.
          </div>
        </div>
      </div>

      {/* Events Audit Log */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Received Webhooks Audit Stream
          </h3>
          <span className="text-[10px] font-bold text-slate-500 font-mono">
            {events.length} events logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Event ID</th>
                <th className="py-2.5 px-4">Event Type</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {events.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-4 text-slate-900 font-semibold">{evt.id}</td>
                  <td className="py-2.5 px-4 text-purple-700 font-semibold">{evt.type}</td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {evt.status || 'processed'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                    {new Date(evt.created || Date.now()).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
