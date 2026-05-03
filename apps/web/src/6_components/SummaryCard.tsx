import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';
import type { Transaction, DateFilter } from '../1_domain/Transaction';

interface SummaryCardProps {
  transactions: Transaction[];
  dateFilter: DateFilter;
}

function calculateFNE(transactions: Transaction[]): number {
  return transactions.reduce((acc, tx) => acc + tx.amount, 0);
}

function calculateChange(transactions: Transaction[]): number {
  const total = calculateFNE(transactions);
  if (total === 0) return 0;
  const income = transactions.filter(t => t.amount > 0).reduce((a, t) => a + t.amount, 0);
  if (income === 0) return 0;
  return ((total / income) * 100);
}

export default function SummaryCard({ transactions, dateFilter }: SummaryCardProps) {
  const fne = calculateFNE(transactions);
  const change = calculateChange(transactions);
  const isPositive = fne >= 0;

  const filterLabel = {
    today: 'de Hoy',
    week: 'de la Semana',
    month: 'del Mes',
    custom: 'Personalizado',
  }[dateFilter];

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_20px_48px_rgba(43,21,26,0.06)] relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-container/20 rounded-full -mr-20 -mt-20 blur-3xl transition-transform group-hover:scale-110 duration-700"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-semibold text-on-surface/60 uppercase tracking-widest mb-1">FNE {filterLabel}</p>
            <h2 className="text-on-surface font-bold text-xl mb-4 font-headline">Flujo Neto de Efectivo</h2>
          </div>
          <div className={`${isPositive ? 'bg-secondary-container text-secondary' : 'bg-primary-fixed text-primary'} px-4 py-2 rounded-full text-sm font-bold flex items-center space-x-1`}>
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{change >= 0 ? '+' : ''}{change.toFixed(1)}%</span>
          </div>
        </div>
        
        <motion.div 
          key={fne}
          initial={{ scale: 0.95, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={`${isPositive ? 'text-secondary' : 'text-primary'} text-6xl md:text-8xl font-black tracking-tighter mb-2 font-headline`}
        >
          {fne < 0 ? '-' : ''}${Math.abs(fne).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </motion.div>
        <p className="text-on-surface/40 text-sm font-medium">Actualizado hace un momento</p>
      </div>
    </motion.section>
  );
}
