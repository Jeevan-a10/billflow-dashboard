'use client';

import { useBilling } from '@/context/BillingContext';
import { formatCurrency, formatDate } from '@/lib/billingUtils';
import { XMarkIcon, DocumentTextIcon, CheckCircleIcon } from './Icons';

export default function InvoiceModal() {
  const { invoiceModal, setInvoiceModal, customers } = useBilling();

  const inv = invoiceModal.invoice;
  if (!invoiceModal.isOpen || !inv) return null;

  const customer = customers.find((c) => c.customerId === inv.customerId) || {
    company: inv.customerName || inv.customerId,
    email: 'billing@customer.com',
    country: 'US',
  };

  const lineItems = inv.lineItems || [
    { description: 'SaaS Subscription Services', amountCents: inv.subtotalCents || 0 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <DocumentTextIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Invoice {inv.invoiceNumber || inv.invoiceId}
              </h3>
              <p className="text-xs text-slate-500">Itemized billing breakdown & tax compliance</p>
            </div>
          </div>
          <button
            onClick={() => setInvoiceModal({ isOpen: false, invoice: null })}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Body */}
        <div className="p-6 space-y-6 text-xs">
          {/* Top Info Banner */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 font-medium">Billed To:</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">
                {customer.company || customer.name}
              </div>
              <div className="text-slate-500">{customer.email}</div>
              <div className="text-[11px] text-slate-400 mt-1">Country: {customer.country || 'US'}</div>
            </div>

            <div className="text-right">
              <span className="text-slate-500 font-medium">Invoice Status:</span>
              <div className="mt-0.5">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                    inv.status === 'paid'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : inv.status === 'open'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {inv.status}
                </span>
              </div>
              <div className="text-slate-500 mt-1">Issued: {formatDate(inv.createdAt)}</div>
              {inv.paidAt && (
                <div className="text-emerald-600 font-medium mt-0.5">
                  Paid on {formatDate(inv.paidAt)}
                </div>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2">
              Itemized Line Items
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lineItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 text-slate-800 font-medium">{item.description}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(item.amountCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="border-t border-slate-200 pt-4 space-y-1.5 text-right font-medium">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono text-slate-900">{formatCurrency(inv.subtotalCents)}</span>
            </div>

            {inv.discountCents > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Promotional Discount:</span>
                <span className="font-mono">-{formatCurrency(inv.discountCents)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>Regional Tax ({inv.taxJurisdiction || 'Standard Rate'}):</span>
              <span className="font-mono text-slate-900">+{formatCurrency(inv.taxCents)}</span>
            </div>

            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Amount:</span>
              <span className="font-mono text-emerald-700">{formatCurrency(inv.totalCents)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Compliant with US State Tax, UK/EU VAT, and GST rules.
          </span>
          <button
            onClick={() => setInvoiceModal({ isOpen: false, invoice: null })}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
