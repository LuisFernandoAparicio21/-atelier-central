import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  LayoutDashboard,
  Wallet,
  Calculator,
  TrendingUp,
  CirclePlus,
  CircleMinus,
  Briefcase,
  Handshake,
  Banknote,
  ShoppingBag,
  Compass,
  Landmark,
  X,
  Flower2,
  Loader2,
} from 'lucide-react';

import Sidebar from './6_components/Sidebar';
import Topbar from './6_components/Topbar';
import SummaryCard from './6_components/SummaryCard';
import ActionCard from './6_components/ActionCard';
import TransactionList from './6_components/TransactionList';
import Drawer from './6_components/Drawer';

import EscenariosPage from './7_pages/EscenariosPage';
import DashboardPage from './7_pages/DashboardPage';
import PuntoEquilibrioPage from './7_pages/PuntoEquilibrioPage';
import LoginPage from './7_pages/LoginPage';

import { useTransactionStore, applyDateFilter } from './4_store/transactionStore';
import { useUIStore } from './4_store/uiStore';
import { useAuthStore } from './4_store/authStore';
import type { Transaction } from './1_domain/Transaction';

export default function App() {
  const { activeTab, setActiveTab, openDrawer, drawerOpen, drawerType, closeDrawer } = useUIStore();
  const { transactions, dateFilter, setDateFilter, addTransaction, fetchAll } = useTransactionStore();
  const { user, loading, initialize } = useAuthStore();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Custom date range state
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  useEffect(() => { 
    initialize();
    
    // Update title
    document.title = 'Atelier Central | Sistema Contable';

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  // Apply date filter — for 'custom' use the date range inputs
  const filteredTransactions = (() => {
    if (dateFilter === 'custom' && (customFrom || customTo)) {
      return transactions.filter(tx => {
        const d = new Date(tx.date);
        const from = customFrom ? new Date(customFrom) : null;
        const to = customTo ? new Date(customTo + 'T23:59:59') : null;
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
      });
    }
    return applyDateFilter(transactions, dateFilter);
  })();

  const handleDateFilterChange = (filter: typeof dateFilter) => {
    setDateFilter(filter);
    if (filter === 'custom') {
      setShowCustomPicker(true);
    } else {
      setShowCustomPicker(false);
    }
  };

  if (!loading && !user) return <LoginPage />;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2b151a] flex flex-col items-center justify-center p-6">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, -10, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-white shadow-2xl mb-6"
        >
          <Flower2 size={40} />
        </motion.div>
        <p className="text-white/40 text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2">
          Cargando Atelier <Loader2 size={12} className="animate-spin" />
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface selection:bg-primary/10">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onNewSale={() => openDrawer('income')} />

      <main className="lg:ml-64 min-h-screen flex flex-col">
        <Topbar />

        <AnimatePresence>
          {isOffline && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] py-2 text-center"
            >
              ⚠️ Estás trabajando sin conexión. Los cambios se sincronizarán al volver.
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 pt-6 px-6 pb-24 md:pb-12 max-w-6xl mx-auto w-full space-y-12">
          {activeTab === 'dashboard-health' ? (
            <DashboardPage />
          ) : activeTab === 'escenarios' ? (
            <EscenariosPage />
          ) : activeTab === 'punto-equilibrio' ? (
            <PuntoEquilibrioPage />
          ) : (
            <>
              {/* Section 1: FNE Summary */}
              <SummaryCard transactions={filteredTransactions} dateFilter={dateFilter} />

              {/* Section 2: Quick Actions */}
              <section>
                <h3 className="font-headline font-bold text-2xl mb-6 px-2">Gestión Rápida</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <ActionCard 
                    title="Entró<br/>Dinero"
                    icon={CirclePlus}
                    bgIcon={Banknote}
                    colorClass="text-secondary"
                    bgColorClass="bg-secondary-container"
                    iconBgClass="bg-white/40"
                    delay={0.1}
                    onClick={() => openDrawer('income')}
                  />
                  <ActionCard 
                    title="Salió<br/>Dinero"
                    icon={CircleMinus}
                    bgIcon={ShoppingBag}
                    colorClass="text-primary"
                    bgColorClass="bg-primary-fixed"
                    iconBgClass="bg-white/40"
                    delay={0.2}
                    onClick={() => openDrawer('expense')}
                  />
                  <ActionCard 
                    title="Equipos y<br/>Mobiliario"
                    icon={Briefcase}
                    bgIcon={Compass}
                    colorClass="text-blue-600"
                    bgColorClass="bg-blue-100"
                    iconBgClass="bg-white/40"
                    delay={0.3}
                    onClick={() => openDrawer('investment')}
                  />
                  <ActionCard 
                    title="Préstamos /<br/>Aportes"
                    icon={Handshake}
                    bgIcon={Landmark}
                    colorClass="text-yellow-700"
                    bgColorClass="bg-yellow-100"
                    iconBgClass="bg-white/40"
                    delay={0.4}
                    onClick={() => openDrawer('financing')}
                  />
                </div>
              </section>

              {/* Custom date range picker */}
              {showCustomPicker && (
                <div className="flex items-center gap-4 bg-surface-container-lowest rounded-2xl p-5 border border-on-surface/10 shadow-sm">
                  <span className="text-sm font-bold text-on-surface/60 uppercase tracking-widest">Rango de fechas</span>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={e => setCustomFrom(e.target.value)}
                    className="px-4 py-2 rounded-xl bg-surface-container-low border border-on-surface/10 text-sm font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                  />
                  <span className="text-on-surface/40 font-bold">→</span>
                  <input
                    type="date"
                    value={customTo}
                    onChange={e => setCustomTo(e.target.value)}
                    className="px-4 py-2 rounded-xl bg-surface-container-low border border-on-surface/10 text-sm font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                  />
                  <button
                    onClick={() => { setShowCustomPicker(false); setCustomFrom(''); setCustomTo(''); setDateFilter('month'); }}
                    className="ml-auto p-2 hover:bg-surface-container-high rounded-lg transition cursor-pointer text-on-surface/40 hover:text-on-surface"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Section 3: Transaction History */}
              <TransactionList 
                transactions={filteredTransactions} 
                dateFilter={dateFilter}
                onDateFilterChange={handleDateFilterChange}
              />
            </>
          )}
        </div>
      </main>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass-panel px-6 py-3 flex justify-between items-center z-40 border-t border-on-surface/5">
        <button 
          onClick={() => setActiveTab('dashboard-health')}
          className={`flex flex-col items-center space-y-1 cursor-pointer ${activeTab === 'dashboard-health' ? 'text-primary' : 'text-on-surface/40'}`}
        >
          <LayoutDashboard size={24} />
          <span className="text-[10px] font-bold">Dashboard</span>
        </button>
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center space-y-1 cursor-pointer ${activeTab === 'dashboard' ? 'text-primary' : 'text-on-surface/40'}`}
        >
          <Wallet size={24} />
          <span className="text-[10px] font-bold">Caja</span>
        </button>
        
        <button 
          onClick={() => openDrawer('income')}
          className="w-14 h-14 bg-primary rounded-full -mt-10 shadow-xl shadow-primary/30 border-4 border-surface flex items-center justify-center text-white active:scale-90 transition-transform cursor-pointer"
        >
          <Plus size={28} />
        </button>
        
        <button 
          onClick={() => setActiveTab('escenarios')}
          className={`flex flex-col items-center space-y-1 cursor-pointer ${activeTab === 'escenarios' ? 'text-primary' : 'text-on-surface/40'}`}
        >
          <TrendingUp size={24} />
          <span className="text-[10px] font-bold">Escen.</span>
        </button>
        <button 
          onClick={() => setActiveTab('punto-equilibrio')}
          className={`flex flex-col items-center space-y-1 cursor-pointer ${activeTab === 'punto-equilibrio' ? 'text-primary' : 'text-on-surface/40'}`}
        >
          <Calculator size={24} />
          <span className="text-[10px] font-bold">P. Eq.</span>
        </button>
      </div>

      <Drawer 
        isOpen={drawerOpen}
        type={drawerType}
        onClose={closeDrawer}
        onSubmit={(tx: Omit<Transaction, 'id'>) => addTransaction(tx)}
      />
    </div>
  );
}
