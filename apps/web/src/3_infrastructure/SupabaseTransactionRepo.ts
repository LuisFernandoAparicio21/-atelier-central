import { Transaction } from '../1_domain/Transaction';
import { supabase } from './supabaseClient';

function mapRow(row: Record<string, unknown>): Transaction {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) ?? '',
    amount: Number(row.amount),
    type: row.type as Transaction['type'],
    flowActivity: row.flow_activity as Transaction['flowActivity'],
    category: (row.category as string) ?? '',
    subcategory: (row.subcategory as string) ?? '',
    time: (row.time as string) ?? '',
    date: new Date(row.date as string),
    icon: (row.icon as string) ?? '',
    note: (row.note as string) ?? undefined,
    paymentMethod: (row.payment_method as string) ?? undefined,
    entity: (row.entity as string) ?? undefined,
    isFixed: (row.is_fixed as boolean) ?? false,
  };
}

export interface CostCategory {
  id: number;
  name: string;
  icon: string;
  budgetMonthly: number;
  budgetAnnual: number;
  sortOrder: number;
}

export interface BalanceSheetItem {
  id: number;
  side: 'activo' | 'pasivo';
  label: string;
  amount: number;
  sortOrder: number;
  periodYear: number;
  periodMonth: number;
}

export const SupabaseTransactionRepo = {
  async getAll(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapRow);
  },

  async getCostCategories(): Promise<CostCategory[]> {
    const { data, error } = await supabase
      .from('cost_categories')
      .select('*')
      .order('sort_order');

    if (error) throw new Error(error.message);
    return (data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as number,
      name: r.name as string,
      icon: (r.icon as string) ?? '',
      budgetMonthly: Number(r.budget_monthly),
      budgetAnnual: Number(r.budget_annual),
      sortOrder: r.sort_order as number,
    }));
  },

  async getBalanceSheetItems(year: number, month: number): Promise<BalanceSheetItem[]> {
    const { data, error } = await supabase
      .from('balance_sheet_items')
      .select('*')
      .eq('period_year', year)
      .eq('period_month', month)
      .order('sort_order');

    if (error) throw new Error(error.message);
    return (data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as number,
      side: r.side as 'activo' | 'pasivo',
      label: r.label as string,
      amount: Number(r.amount),
      sortOrder: r.sort_order as number,
      periodYear: r.period_year as number,
      periodMonth: r.period_month as number,
    }));
  },
};
