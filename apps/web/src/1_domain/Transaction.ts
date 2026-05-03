export type TransactionType = 'income' | 'expense' | 'investment' | 'financing';

export type FlowActivity = 'operativa' | 'inversion' | 'financiacion';

export interface Transaction {
  id: string;
  title: string;
  description: string;
  amount: number;
  type: TransactionType;
  flowActivity: FlowActivity;
  category: string;
  subcategory: string;
  time: string;
  date: Date;
  icon: string;
  note?: string;
  paymentMethod?: string;
  entity?: string;
  isFixed?: boolean;
}

export type DateFilter = 'today' | 'week' | 'month' | 'custom';

export interface DrawerConfig {
  type: TransactionType;
  title: string;
  colorClass: string;
  bgClass: string;
  chipOptions: ChipOption[];
  fields: DrawerField[];
}

export interface ChipOption {
  label: string;
  value: string;
  effect: '+' | '-';
}

export interface DrawerField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'number';
  required: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  active?: boolean;
}

