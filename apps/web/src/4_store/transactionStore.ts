import { create } from 'zustand';
import { Transaction, DateFilter } from '../1_domain/Transaction';
import { SupabaseTransactionRepo, CostCategory, BalanceSheetItem } from '../3_infrastructure/SupabaseTransactionRepo';
import { supabase } from '../3_infrastructure/supabaseClient';

// ---------------------------------------------------------------------------
// Date filtering utility
// ---------------------------------------------------------------------------
export function applyDateFilter(txs: Transaction[], filter: DateFilter): Transaction[] {
  const now = new Date();
  return txs.filter(tx => {
    const d = new Date(tx.date);
    if (filter === 'today') {
      return d.toDateString() === now.toDateString();
    }
    if (filter === 'week') {
      const weekStart = new Date(now);
      // Monday-based week
      const day = now.getDay() === 0 ? 6 : now.getDay() - 1;
      weekStart.setDate(now.getDate() - day);
      weekStart.setHours(0, 0, 0, 0);
      return d >= weekStart;
    }
    if (filter === 'month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    return true; // 'custom' — show all
  });
}

interface TransactionStore {
  transactions: Transaction[];
  costCategories: CostCategory[];
  balanceSheetItems: BalanceSheetItem[];
  loading: boolean;
  dateFilter: DateFilter;
  fetchAll: () => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  setDateFilter: (filter: DateFilter) => void;
}



export const useTransactionStore = create<TransactionStore>((set) => ({
  transactions: [],
  costCategories: [],
  balanceSheetItems: [],
  loading: false,
  dateFilter: 'month',

  fetchAll: async () => {
    set({ loading: true });
    try {
      const [transactions, costCategories, balanceSheetItems] = await Promise.all([
        SupabaseTransactionRepo.getAll(),
        SupabaseTransactionRepo.getCostCategories(),
        SupabaseTransactionRepo.getBalanceSheetItems(2026, 3),
      ]);
      set({ transactions, costCategories, balanceSheetItems, loading: false });
    } catch (e) {
      console.error('Error fetching data from Supabase:', e);
      set({ loading: false });
    }
  },

  addTransaction: async (tx: Omit<Transaction, 'id'>) => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      console.error('No authenticated user found');
      return;
    }

    const id = crypto.randomUUID();
    const full: Transaction = { ...tx, id };
    
    // Optimistic update
    set(state => ({ transactions: [full, ...state.transactions] }));
    
    // Persist to Supabase
    try {
      const { error } = await supabase.from('transactions').insert({
        id,
        user_id: userId,
        title: tx.title,
        description: tx.description,
        amount: tx.amount,
        type: tx.type,
        flow_activity: tx.flowActivity,
        category: tx.category,
        subcategory: tx.subcategory,
        time: tx.time,
        date: tx.date instanceof Date ? tx.date.toISOString() : tx.date,
        icon: tx.icon,
        note: tx.note ?? null,
        payment_method: tx.paymentMethod ?? null,
        entity: tx.entity ?? null,
        is_fixed: tx.isFixed ?? false,
      });
      
      if (error) throw error;
    } catch (e) {
      console.error('Error persisting transaction:', e);
      // Rollback optimistic update on error if needed (optional for now)
    }
  },

  setDateFilter: (dateFilter) => set({ dateFilter }),
}));
