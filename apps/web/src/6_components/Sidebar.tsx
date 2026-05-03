import { 
  Wallet, 
  Flower2, 
  TrendingUp,
  LayoutDashboard,
  Calculator,
  Plus,
  LogOut
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onNewSale: () => void;
}

export default function Sidebar({ activeTab, onTabChange, onNewSale }: SidebarProps) {
  const navItems = [
    { id: 'dashboard-health', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'dashboard', label: 'Flujo de Efectivo', icon: Wallet },
    { id: 'escenarios', label: 'Escenarios', icon: TrendingUp },
    { id: 'punto-equilibrio', label: 'Pto. Equilibrio', icon: Calculator },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 hidden lg:flex flex-col bg-surface py-6 z-40 border-r border-on-surface/5">
      <div className="px-6 mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Flower2 size={24} fill="currentColor" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-on-surface leading-tight">Entrega de Flores</h2>
            <p className="text-[10px] opacity-60 uppercase tracking-wider font-bold">Premium Floral POS</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-col space-y-2 px-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`group relative flex items-center space-x-3 px-4 py-3 rounded-full transition-all duration-300 cursor-pointer ${
              activeTab === item.id 
                ? 'bg-gradient-to-r from-primary to-primary-container text-white shadow-md shadow-primary/20' 
                : 'text-on-surface/70 hover:bg-surface-container-high'
            }`}
          >
            <item.icon size={20} />
            <span className="font-headline font-semibold text-sm">{item.label}</span>
            {activeTab === item.id && (
              <motion.div 
                layoutId="active-pill"
                className="absolute inset-0 bg-gradient-to-r from-primary to-primary-container rounded-full -z-10"
              />
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto px-6 space-y-4">
        <button 
          onClick={onNewSale}
          className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <Plus size={20} />
          <span className="font-headline">+ New Sale</span>
        </button>
        
        <button className="w-full flex items-center justify-center space-x-2 py-3 text-on-surface/40 hover:text-on-surface transition-colors cursor-pointer">
          <LogOut size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
