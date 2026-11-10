# BillFlow Dashboard 💳⚡

> Modern Next.js 16 SaaS subscription billing, dynamic proration calculator, metered consumption tracker, itemized invoice state machine, and HMAC webhook audit portal.

[![BillFlow Dashboard CI](https://github.com/Jeevan-a10/billflow-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/Jeevan-a10/billflow-dashboard/actions/workflows/ci.yml)
[![Next.js Version](https://img.shields.io/badge/Next.js-16.4.5-black.svg?style=flat&logo=next.js)](https://nextjs.org/)
[![React Version](https://img.shields.io/badge/React-19.3.0-blue.svg?style=flat&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8.svg?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Tests Passing](https://img.shields.io/badge/tests-12%20passing-success.svg)](tests/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    User["Tenant Admin / Finance Operator"] -->|Browser GUI| NextApp["Next.js 16 Full-Stack Dashboard (Port 3002)"]

    subgraph FrontendState ["Frontend State & Context Layer"]
        BillingCtx["BillingContext (Global State & Notifications)"]
        IconLib["Vector SVG Icon System"]
        FormatUtils["Billing & Proration Mathematical Utilities"]
    end

    NextApp --> FrontendState

    subgraph DashboardViews ["Interactive Workspace Tabs"]
        Overview["📊 MRR & Cohort Revenue Analytics"]
        SubMgr["💳 Subscriptions & Proration Manager"]
        MeterPanel["⚡ Metered Usage & Quota Gauges"]
        InvHub["📄 Invoices Hub & Tax Compliance"]
        WhSim["🔔 HMAC Webhook Simulator & Audit Bench"]
    end

    FrontendState --> DashboardViews

    subgraph ApiClient ["Dual-Mode Resilient Client Layer"]
        AxiosClient["Axios REST Client (X-API-Key Auth)"]
        FallbackStore["Zero-Crash Seeded Demo Fallback Store"]
    end

    DashboardViews --> ApiClient

    ApiClient -->|HTTP / JSON| BackendAPI["BillFlow Express API (Port 5002)"]
    BackendAPI -->|Persistence| Mongo[("MongoDB 7.0")]
```

---

## ⚡ Core Features

### 1. Executive MRR & SaaS Metrics Analytics
- **Hero KPI Cards**: Monthly Recurring Revenue (**MRR**), Annual Run Rate (**ARR**), Active Subscribers, and 30-Day Cohort **Churn Rate** (< 3% Top-Decile benchmark).
- **Unit Economics**: Average Revenue Per User (**ARPU**) and Customer Lifetime Value (**LTV**).
- **Contract Intervals**: Monthly vs. Annual (-15% discount) distribution bar gauges.
- **Plan Breakdown**: Visual breakdown across Starter ($29/mo), Professional ($99/mo), and Enterprise ($299/mo) tiers.

### 2. Interactive Mid-Cycle Proration Engine
- **Live Mathematical Quote Preview**: Instant calculation of unused credits from the old plan fraction and prorated charges for the new plan fraction.
- **Seat Multipliers**: Dynamically adjusts multi-seat team pricing in real time.
- **1-Click Upgrade Execution**: Automatically commits plan upgrades to the backend API and generates itemized prorated invoices.

### 3. Real-Time Metered Consumption & Quotas
- **Consumption Gauges**: Live visual tracking of API requests, storage (GB), and compute runtime against subscription allowances.
- **Overage Calculations**: Automatically projects tiered overage costs when consumption exceeds plan limits.
- **High-Throughput Ingestion**: Dispatches usage records with idempotency key deduplication to prevent accidental double-billing.

### 4. Itemized Invoicing & Regional Taxation
- **Full Invoice Lifecycle**: Filter and manage invoices across `draft` ➔ `open` ➔ `paid` ➔ `void` states.
- **Regional Tax Calculation**: Displays tax calculations across US State tax (CA/NY), UK/EU VAT, and India GST.
- **Export Engine**: 1-click downloads for RFC 4180-compliant CSV invoice ledgers and JSON snapshot backups.

### 5. Cryptographic Webhook Test Bench & Audit Stream
- **Interactive Simulator**: Dispatches simulated Stripe-compatible payment events (`payment_intent.succeeded`, `payment_intent.payment_failed`, `customer.subscription.deleted`).
- **HMAC-SHA256 Signature Inspector**: Displays the computed `x-signature` header and payload body.
- **Real-Time Audit Log**: Chronological audit trail of received webhook events with delivery statuses and timestamps.

### 6. Zero-Crash Dual-Persistence & Fallback Mode
- Automatically connects to `billflow-api` on `http://localhost:5002`.
- If the backend is offline or during testing, seamlessly falls back to the built-in rich demo store, ensuring uninterrupted evaluation and demonstration.

---

## 🧪 Automated Testing

Runs on native Node.js test runner with zero dependencies:

```bash
npm test
```

```text
▶ BillFlow API Client & Data Contract Suite
  ✔ FALLBACK_DATA contains valid seeding contracts
  ✔ API Client exposes expected endpoint handlers
  ✔ plansAPI returns fallback plans when API is offline
  ✔ analyticsAPI returns fallback revenue metrics when offline
✔ BillFlow API Client & Data Contract Suite

▶ Billing & Proration Utility Tests
  ✔ formatCurrency formats integer cents into USD currency strings
  ✔ formatPercent formats numbers into percentage strings
  ✔ formatDate formats ISO dates or returns fallback
  ✔ calculateProrationQuote calculates exact credit and net charge for mid-cycle plan switch
  ✔ calculateProrationQuote correctly scales with seat increments
  ✔ calculateUsageOverage computes zero overage within allowance
  ✔ calculateUsageOverage computes tiered cost when exceeding allowance
  ✔ generateInvoiceCsv produces RFC 4180 escaped CSV ledger string
✔ Billing & Proration Utility Tests

ℹ tests 12
ℹ suites 2
ℹ pass 12
ℹ fail 0
```

---

## 🚀 Quick Start

### 1. Install & Run Locally

```bash
cd billflow-dashboard
npm install
npm run dev
```

Visit [http://localhost:3002](http://localhost:3002) in your browser.

### 2. Standalone Production Build

```bash
npm run build
npm start
```

### 3. Docker Deployment

```bash
docker build -t billflow-dashboard .
docker run -p 3002:3000 -e NEXT_PUBLIC_API_URL=http://localhost:5002 billflow-dashboard
```

---

## 📄 License

MIT © [Jeevan-a10](https://github.com/Jeevan-a10)
