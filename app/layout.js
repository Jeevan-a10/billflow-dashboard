import './globals.css';
import { BillingProvider } from '@/context/BillingContext';
import Navbar from '@/components/Navbar';
import TabNav from '@/components/TabNav';
import Toast from '@/components/Toast';
import ProrationModal from '@/components/ProrationModal';
import NewSubscriptionModal from '@/components/NewSubscriptionModal';
import InvoiceModal from '@/components/InvoiceModal';

export const metadata = {
  title: 'BillFlow — SaaS Subscription Billing, Proration & Metered Invoicing Engine',
  description: 'Next.js 16 SaaS billing portal with dynamic proration calculations, metered usage tracking, itemized invoice state machine, and HMAC webhook audit logging.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
      </head>
      <body className="font-sans bg-slate-50 min-h-screen antialiased text-slate-800 flex flex-col">
        <BillingProvider>
          <Navbar />
          <TabNav />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <ProrationModal />
          <NewSubscriptionModal />
          <InvoiceModal />
          <Toast />
        </BillingProvider>
      </body>
    </html>
  );
}
