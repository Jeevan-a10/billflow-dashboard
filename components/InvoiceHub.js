'use client';

import { useState } from 'react';
import { useBilling } from '@/context/BillingContext';
import { formatCurrency, formatDate, generateInvoiceCsv, downloadCsvFile, downloadJsonFile } from '@/lib/billingUtils';
import { invoicesAPI } from '@/lib/api';
import {
  DocumentTextIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
} from './Icons';

export default function InvoiceHub() {
  const {
    invoices,
    setInvoices,
    setInvoiceModal,
    showToast,
    customers,
  } = useBilling();

  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = invoices.filter((inv) => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    return true;
  });

  const handlePay = async (invoice) => {
    try {
      const updated = await invoicesAPI.pay(invoice.invoiceId);
      setInvoices((prev) =>
        prev.map((i) => (i.invoiceId === invoice.invoiceId ? { ...i, ...updated, status: 'paid', paidAt: new Date().toISOString() } : i))
      );
      showToast(`Invoice ${invoice.invoiceNumber || invoice.invoiceId} marked as paid!`, 'success');
    } catch {
      showToast('Payment processing failed', 'warning');
    }
  };

  const handleVoid = async (invoice) => {
    if (invoice.status === 'paid') {
      showToast('Cannot void a paid invoice', 'warning');
      return;
    }
    try {
      const updated = await invoicesAPI.void(invoice.invoiceId);
      setInvoices((prev) =>
        prev.map((i) => (i.invoiceId === invoice.invoiceId ? { ...i, ...updated, status: 'void' } : i))
      );
      showToast(`Invoice ${invoice.invoiceNumber || invoice.invoiceId} voided`, 'info');
    } catch {
      showToast('Failed to void invoice', 'warning');
    }
  };

  const handleExportCsv = () => {
    const csv = generateInvoiceCsv(invoices);
    downloadCsvFile(csv, `billflow-invoices-${Date.now()}.csv`);
    showToast('Exported invoice ledger to CSV', 'success');
  };

  const handleExportJson = () => {
    downloadJsonFile(invoices, `billflow-invoices-${Date.now()}.json`);
    showToast('Exported full invoice JSON snapshot', 'success');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            Paid
          </span>
        );
      case 'open':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            Open Due
          </span>
        );
      case 'draft':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            Draft
          </span>
        );
      case 'void':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Void
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
      {/* Action & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status:</span>
          {['all', 'paid', 'open', 'draft', 'void'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium capitalize transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <ArrowDownTrayIcon className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <ArrowDownTrayIcon className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Invoice Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No invoices matching the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Subtotal / Tax</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((inv) => {
                  const customer =
                    customers.find((c) => c.customerId === inv.customerId) || {
                      company: inv.customerName || inv.customerId,
                      name: '',
                    };

                  return (
                    <tr key={inv.invoiceId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {inv.invoiceNumber || inv.invoiceId}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{customer.company || customer.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{inv.customerId}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>{formatCurrency(inv.subtotalCents)}</div>
                        <div className="text-[10px] text-slate-400">
                          +{formatCurrency(inv.taxCents)} ({inv.taxJurisdiction || 'Tax'})
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                        {formatCurrency(inv.totalCents)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {formatDate(inv.createdAt)}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(inv.status)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setInvoiceModal({ isOpen: true, invoice: inv })}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-[11px] transition-colors cursor-pointer"
                          >
                            Details
                          </button>

                          {inv.status === 'open' && (
                            <button
                              onClick={() => handlePay(inv)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold text-[11px] transition-colors cursor-pointer"
                            >
                              Pay Now
                            </button>
                          )}

                          {inv.status === 'open' && (
                            <button
                              onClick={() => handleVoid(inv)}
                              className="px-2 py-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md text-[11px] transition-colors cursor-pointer"
                            >
                              Void
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
