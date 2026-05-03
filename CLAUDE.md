# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**The Botanical Atelier** is a financial health dashboard for Atelier Central, a high-end florist business. The app provides real-time cash flow analysis, expense tracking, break-even calculations, and financial projections.

**Core principle:** This is a production tool working with real data from Supabase. No hardcoded values, no mock data, no fallbacks. All UI values must come from the database.

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account with a project

### Setup
1. `cd apps/web`
2. Copy `.env.example` to `.env` and fill in Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. `npm install`

### Development Commands
- `npm run dev` — Start dev server (http://localhost:5173)
- `npm run build` — Build for production
- `npm run preview` — Preview production build
- `npm run lint` — TypeScript type check (no emit)

## Architecture

The codebase follows a **layered clean architecture** with numbered folders:

### 1_domain/
Entity definitions and pure business logic
- `Transaction.ts` — Main entity (id, amount, type, date, category, etc.) + `DateFilter` type
- `FinancialCalculator.ts` — Calculations on transactions (totals, ratios, etc.)

### 2_application/
Use cases and orchestration
- `TransactionUseCases.ts` — Business workflows (add, filter, categorize)

### 3_infrastructure/
External integrations
- `supabaseClient.ts` — Supabase client configured from env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- `SupabaseTransactionRepo.ts` — Queries for transactions, cost_categories, balance_sheet_items
  - Uses RLS-protected queries; anon role must have SELECT permissions
  - Maps raw rows to typed entities via `mapRow()`
- `ApiClient.ts`, `ApiTransactionRepo.ts` — Placeholder for backend API (not currently used)

### 4_store/
Zustand stores (shared state)
- `transactionStore.ts` 
  - Holds: transactions[], costCategories[], balanceSheetItems[], dateFilter, loading
  - Key method: `fetchAll()` uses `Promise.all()` to load all three tables concurrently
  - Fetches from SupabaseTransactionRepo
- `uiStore.ts` — UI state (activeTab, drawerOpen, drawerType)
- `authStore.ts` — Auth state (placeholder for future auth)

### 5_hooks/
React hooks wrapping stores
- `useFinancials()` — Exposes transactions, costCategories, balanceSheetItems, dateFilter, setDateFilter, triggerAddTransaction
- `useAppNavigation()` — Exposes activeTab, setActiveTab, drawerOpen, drawerType, openDrawer, closeDrawer

### 6_components/
Reusable UI components
- `Sidebar.tsx` — Navigation and tab switching
- `Topbar.tsx` — Header with date picker
- `SummaryCard.tsx` — FNE (Flujo Neto Efectivo) summary
- `TransactionList.tsx` — Income/expense table
- `ActionCard.tsx` — Quick action buttons (add income, expense, etc.)
- `Drawer.tsx` — Modal form for adding transactions
- Use Motion (`motion/react`) for animations

### 7_pages/
Full-page components
- `DashboardPage.tsx` — **Key file.** Main financial health dashboard with:
  - `StatCard()` — KPI cards (Caja Fuerte, Colchón de Vida, Burn Rate)
  - `CostComparison()` — Three tabs:
    - "Presupuesto vs Costos" — Budget vs actual expenses by category
    - "Ingresos" — Weekly income table with financial metrics (liquidez, rentabilidad, etc.)
    - "Egresos" — Expense detail with grouping by period
  - `FinancialList()` — Top 3 income/expense items
- `EscenariosPage.tsx` — Financial projections/scenarios
- `PuntoEquilibrioPage.tsx` — Break-even analysis
- `LoginPage.tsx` — Placeholder for auth

## Critical Data Model

### Transaction
```ts
interface Transaction {
  id: string;
  title: string;
  description: string;
  amount: number;  // Can be negative (expenses)
  type: 'income' | 'expense' | 'investment' | 'financing';
  flowActivity: string;  // e.g. 'venta', 'compra'
  category: string;
  subcategory: string;
  time: string;
  date: Date;
  icon: string;
  note?: string;
  paymentMethod?: string;
  entity?: string;
  isFixed: boolean;  // For expenses: true = fixed cost, false = variable
}

type DateFilter = 'today' | 'week' | 'month' | 'year';
```

### CostCategory
From DB table `cost_categories`:
- id, name, icon, budgetMonthly, budgetAnnual, sortOrder
- Must have SELECT permission with RLS policy `USING (true)` for anon role

### BalanceSheetItem
From DB table `balance_sheet_items`:
- id, side ('activo' | 'pasivo'), label, amount, sortOrder, periodYear, periodMonth
- Must have SELECT permission with RLS policy for anon role

## Supabase & RLS (Critical)

### Anon Role Permissions
The app uses Supabase's anonymous (unauthenticated) client. Ensure these tables have SELECT policies for `TO anon`:

1. **transactions** — `USING (true)` or similar (NOT a subquery like `IN (SELECT id FROM tenants...)`; anon can't see tenants table)
2. **cost_categories** — `USING (true)`
3. **balance_sheet_items** — `USING (true)`

### Common Pitfall: Subqueries in RLS
If a policy tries to reference another table in a subquery, the anon role must have explicit SELECT permission on that table. Prefer `USING (true)` for anon access to multi-tenant tables.

## No Mock Data Rule

⚠️ **Absolute:** Every value shown in the UI must come from Supabase.

- ❌ No hardcoded arrays like `const COST_CATEGORIES = [...]`
- ❌ No fallback numbers like `burnRate ?? 8500`
- ✅ Fetch from DB via `SupabaseTransactionRepo`
- ✅ If table doesn't exist, create it with RLS policy
- ✅ If store doesn't fetch it, add `fetchAll()` call

If a value is `undefined` after fetching, show empty state (`—` or empty list) rather than a placeholder number.

## Key Workflows

### Adding a New Table to Dashboard
1. Add RLS policy to table: `CREATE POLICY "anon_read" ON table_name FOR SELECT TO anon USING (true);`
2. Create fetch method in `SupabaseTransactionRepo.ts`
3. Add field to `TransactionStore` interface
4. Add call to fetch in `fetchAll()` with `Promise.all()`
5. Update `useFinancials()` hook to expose the data
6. Use in components via `useFinancials()`

### Date Filtering
- `CostComparison.CostComparison()` has internal state for selectedDate (default: `new Date('2026-04-28')`)
- `dateFilter` in transactionStore is for quick selections (today/week/month/year); currently mostly unused
- Weekly grouping uses `getWeekStartFromDay()` helper (Monday-based ISO week)

### Expense Categorization
- `categorizeExpense(subcategory)` in DashboardPage maps subcategory strings to cost_category names
- Used to group actual expenses against budget categories
- Example: subcategory `'renta'` → category `'Renta Local'`

## Styling

- **Tailwind CSS 4.x** with `@tailwindcss/vite` plugin
- **Motion** library for animations (`motion/react`)
- **Lucide React** for icons
- Design tokens (color, typography) used via CSS classes: `text-primary`, `bg-surface-container-low`, etc.
- Responsive grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`

## Environment Variables (frontend)

File: `apps/web/.env`

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Accessed in code via `import.meta.env.VITE_*` (see `vite-env.d.ts` for type definitions).

## Common Tasks

### Test a Component
The app has no test runner configured. Manually test in browser:
1. `npm run dev`
2. Open http://localhost:5173
3. Navigate to the page using sidebar or mobile nav
4. Check Supabase data appears correctly

### Add a New Financial Metric
1. Compute in `DashboardPage.tsx` using `transactions`, `balanceSheetItems`
2. Display in a `StatCard()` or inline element
3. Never use hardcoded fallback values
4. Reference Supabase data

### Fix a Missing Supabase Value
1. Check RLS policy on the table: must have `USING (true)` or equivalent for anon
2. Verify `SupabaseTransactionRepo` has a fetch method
3. Confirm `transactionStore.fetchAll()` calls it
4. Check browser console for errors
5. Verify `useFinancials()` exposes the data

## File Organization
```
apps/web/
├── src/
│   ├── 1_domain/          (entities, logic)
│   ├── 2_application/     (use cases)
│   ├── 3_infrastructure/  (Supabase, API)
│   ├── 4_store/           (Zustand)
│   ├── 5_hooks/           (React hooks)
│   ├── 6_components/      (UI components)
│   ├── 7_pages/           (full pages)
│   ├── App.tsx            (router/layout)
│   ├── main.tsx           (entry point)
│   ├── index.css          (global Tailwind)
│   └── vite-env.d.ts      (type defs for env vars)
├── .env                   (Supabase credentials)
├── vite.config.ts         (build config)
└── tsconfig.json          (TypeScript config)
```

## TypeScript Notes

- Target: ES2022
- Module: ESNext
- JSX: react-jsx (automatic runtime)
- Path alias `@/*` maps to `src/`
- `skipLibCheck: true` (faster builds)
- `noEmit: true` (lint only, don't emit JS)
