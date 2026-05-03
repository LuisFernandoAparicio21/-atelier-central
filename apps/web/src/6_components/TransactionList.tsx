import { useState } from 'react';
import { 
  Store, 
  Truck, 
  MessageSquare, 
  PiggyBank, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Wrench,
  Flower2,
  CreditCard,
  Landmark,
  Search,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Transaction, DateFilter } from '../1_domain/Transaction';

const iconMap: Record<string, any> = {
  store: Store,
  truck: Truck,
  chat: MessageSquare,
  savings: PiggyBank,
  wrench: Wrench,
  flower: Flower2,
  card: CreditCard,
  bank: Landmark,
};

const getBgColor = (type: string) => {
  switch (type) {
    case 'income': return 'bg-secondary-container text-secondary';
    case 'expense': return 'bg-primary-fixed text-primary';
    case 'financing': return 'bg-yellow-100 text-yellow-700';
    case 'investment': return 'bg-blue-100 text-blue-600';
    default: return 'bg-surface-container-high text-on-surface';
  }
};

const TYPE_FILTERS = [
  { id: 'all',        label: 'Todos',      color: 'bg-on-surface text-surface' },
  { id: 'income',     label: 'Entradas',   color: 'bg-secondary-container text-secondary' },
  { id: 'expense',    label: 'Salidas',    color: 'bg-primary-fixed text-primary' },
  { id: 'investment', label: 'Inversión',  color: 'bg-blue-100 text-blue-600' },
  { id: 'financing',  label: 'Financiación', color: 'bg-yellow-100 text-yellow-700' },
];

const PAGE_SIZE = 10;

interface TransactionListProps {
  transactions: Transaction[];
  dateFilter: DateFilter;
  onDateFilterChange: (filter: DateFilter) => void;
}

export default function TransactionList({ transactions, dateFilter, onDateFilterChange }: TransactionListProps) {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const dateFilters: { id: DateFilter; label: string; icon?: any }[] = [
    { id: 'today', label: 'Hoy' },
    { id: 'week', label: 'Esta Semana' },
    { id: 'month', label: 'Este Mes' },
    { id: 'custom', label: 'Fechas exactas', icon: Calendar },
  ];

  // Apply type + search filters
  const filtered = transactions.filter(tx => {
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        tx.title.toLowerCase().includes(q) ||
        tx.description?.toLowerCase().includes(q) ||
        tx.note?.toLowerCase().includes(q) ||
        tx.category?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const shown = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = shown.length < filtered.length;

  const handleTypeFilter = (id: string) => {
    setTypeFilter(id);
    setPage(1);
  };

  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  return (
    <section className="space-y-5">
      {/* Header row: title + date filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="font-headline font-bold text-2xl px-2">Últimos Movimientos</h3>
        <div className="flex overflow-x-auto pb-2 md:pb-0 space-x-2 no-scrollbar">
          {dateFilters.map(f => (
            <button 
              key={f.id}
              onClick={() => onDateFilterChange(f.id)}
              className={`px-6 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                dateFilter === f.id 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-surface-container-high text-on-surface/70 hover:bg-surface-container-highest'
              } ${f.icon ? 'flex items-center space-x-2' : ''}`}
            >
              {f.icon && <f.icon size={14} />}
              <span>{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/30 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Buscar por concepto, nota o categoría..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-container-lowest border border-on-surface/8 text-sm text-on-surface placeholder:text-on-surface/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Type pills */}
      <div className="flex flex-wrap gap-2">
        {TYPE_FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => handleTypeFilter(f.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              typeFilter === f.id
                ? `${f.color} border-transparent shadow-sm scale-[1.03]`
                : 'bg-surface-container-high text-on-surface/50 border-transparent hover:bg-surface-container-highest'
            }`}
          >
            {f.label}
            {typeFilter === f.id && filtered.length > 0 && (
              <span className="ml-1.5 opacity-60">{filtered.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm divide-y divide-on-surface/5 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Flower2 size={48} className="text-on-surface/20 mx-auto mb-4" />
            <p className="text-on-surface/40 font-medium font-headline text-lg">Sin resultados</p>
            <p className="text-on-surface/30 text-sm mt-1">Prueba otro filtro o período de tiempo</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {shown.map((tx, idx) => {
              const Icon = iconMap[tx.icon] || Store;
              const colors = getBgColor(tx.type);
              const dateLabel = new Date(tx.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });

              return (
                <motion.div 
                  key={tx.id}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ delay: Math.min(idx * 0.04, 0.3) }}
                  className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors group cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-11 h-11 ${colors} rounded-full flex items-center justify-center shrink-0`}>
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-on-surface font-headline truncate">{tx.title}</p>
                      <p className="text-xs text-on-surface/40 font-medium truncate">
                        {tx.description}{tx.note ? ` — ${tx.note}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4 flex flex-col items-end gap-0.5">
                    <div className="flex items-center space-x-1">
                      <p className={`font-bold text-lg font-headline ${tx.amount > 0 ? 'text-secondary' : 'text-primary'}`}>
                        {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      {tx.amount > 0 ? <ArrowUpRight size={14} className="text-secondary" /> : <ArrowDownRight size={14} className="text-primary" />}
                    </div>
                    <p className="text-[10px] text-on-surface/35 font-bold uppercase tracking-widest">{dateLabel} · {tx.time}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Show more */}
      {hasMore && (
        <button
          onClick={() => setPage(p => p + 1)}
          className="w-full py-3 flex items-center justify-center gap-2 text-sm font-bold text-on-surface/50 hover:text-on-surface bg-surface-container-lowest rounded-xl border border-on-surface/8 hover:bg-surface-container-low transition-all cursor-pointer"
        >
          <ChevronDown size={16} />
          Ver {Math.min(PAGE_SIZE, filtered.length - shown.length)} más de {filtered.length - shown.length} restantes
        </button>
      )}

      {/* Count summary */}
      {filtered.length > 0 && (
        <p className="text-xs text-on-surface/30 text-center font-medium">
          Mostrando {shown.length} de {filtered.length} movimiento{filtered.length !== 1 ? 's' : ''}
          {typeFilter !== 'all' || search ? ' (filtrado)' : ''}
        </p>
      )}
    </section>
  );
}


