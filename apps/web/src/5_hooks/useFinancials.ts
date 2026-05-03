import { useTransactionStore } from '../4_store/transactionStore';
import { useUIStore } from '../4_store/uiStore';

export const useFinancials = () => {
  const transactions = useTransactionStore((state) => state.transactions);
  const costCategories = useTransactionStore((state) => state.costCategories);
  const balanceSheetItems = useTransactionStore((state) => state.balanceSheetItems);
  const dateFilter = useTransactionStore((state) => state.dateFilter);
  const setDateFilter = useTransactionStore((state) => state.setDateFilter);
  const triggerAddTransaction = useTransactionStore((state) => state.addTransaction);

  return { transactions, costCategories, balanceSheetItems, dateFilter, setDateFilter, triggerAddTransaction };
};

export const useAppNavigation = () => {
  const activeTab = useUIStore((state) => state.activeTab);
  const setActiveTab = useUIStore((state) => state.setActiveTab);
  const drawerOpen = useUIStore((state) => state.drawerOpen);
  const drawerType = useUIStore((state) => state.drawerType);
  const openDrawer = useUIStore((state) => state.openDrawer);
  const closeDrawer = useUIStore((state) => state.closeDrawer);

  return { activeTab, setActiveTab, drawerOpen, drawerType, openDrawer, closeDrawer };
};
