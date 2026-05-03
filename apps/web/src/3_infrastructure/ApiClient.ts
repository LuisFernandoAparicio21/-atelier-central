const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api';

export interface TransactionFilters {
  type?: 'income' | 'expense' | 'financing';
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;   // YYYY-MM-DD
  category?: string;
  isFixed?: boolean;
  page?: number;
  pageSize?: number;
}

export const ApiClient = {
  async getTransactions(filters: TransactionFilters = {}) {
    const params = new URLSearchParams();
    if (filters.type) params.set('type', filters.type);
    if (filters.dateFrom) params.set('date_from', filters.dateFrom);
    if (filters.dateTo) params.set('date_to', filters.dateTo);
    if (filters.category) params.set('category', filters.category);
    if (filters.isFixed !== undefined) params.set('is_fixed', String(filters.isFixed));
    if (filters.page) params.set('page', String(filters.page));
    if (filters.pageSize) params.set('page_size', String(filters.pageSize));
    const res = await fetch(`${API_BASE}/transactions?${params}`);
    if (!res.ok) throw new Error('Error fetching transactions');
    return res.json();
  },

  async getDashboardMetrics(year: number, month: number) {
    const res = await fetch(`${API_BASE}/dashboard/metrics?year=${year}&month=${month}`);
    if (!res.ok) throw new Error('Error fetching metrics');
    return res.json();
  },

  async getBudgetComparison(year: number, month: number) {
    const res = await fetch(`${API_BASE}/dashboard/budget-comparison?year=${year}&month=${month}`);
    if (!res.ok) throw new Error('Error fetching budget comparison');
    return res.json();
  },

  async getCostCategories() {
    const res = await fetch(`${API_BASE}/cost-categories`);
    if (!res.ok) throw new Error('Error fetching cost categories');
    return res.json();
  },

  async getBalanceSheet(year: number, month: number) {
    const res = await fetch(`${API_BASE}/balance-sheet?year=${year}&month=${month}`);
    if (!res.ok) throw new Error('Error fetching balance sheet');
    return res.json();
  },

  async createTransaction(tx: Record<string, unknown>) {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
    });
    if (!res.ok) throw new Error('Error creating transaction');
    return res.json();
  },

  async deleteTransaction(id: string) {
    await fetch(`${API_BASE}/transactions/${id}`, { method: 'DELETE' });
  },
};
