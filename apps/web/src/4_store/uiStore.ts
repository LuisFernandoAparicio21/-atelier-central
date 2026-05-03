import { create } from 'zustand';
import { TransactionType } from '../1_domain/Transaction';

interface UIStore {
  activeTab: string;
  drawerOpen: boolean;
  drawerType: TransactionType;
  setActiveTab: (tab: string) => void;
  openDrawer: (type: TransactionType) => void;
  closeDrawer: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeTab: 'dashboard-health',
  drawerOpen: false,
  drawerType: 'income',
  setActiveTab: (activeTab) => set({ activeTab }),
  openDrawer: (drawerType) => set({ drawerOpen: true, drawerType }),
  closeDrawer: () => set({ drawerOpen: false })
}));
