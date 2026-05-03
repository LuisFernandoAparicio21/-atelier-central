import React, { useState, useMemo, useEffect } from 'react';
import { useFinancials } from '../5_hooks/useFinancials';
import { supabase } from '../3_infrastructure/supabaseClient';
import { 
  Filter, 
  BookOpen, 
  Activity, 
  Home, 
  TrendingUp, 
  Lightbulb,
  Save,
  Check,
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceDot
} from 'recharts';
import { motion } from 'motion/react';

interface InputCardProps {
  label: string;
  description: string;
  value: number;
  onChange: (val: number) => void;
  icon: React.ReactNode;
  color: string;
}

function InputCard({ label, description, value, onChange, icon, color }: InputCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/10 flex flex-col gap-4 shadow-sm"
    >
      <div className={`flex items-center gap-3 ${color}`}>
        {icon}
        <span className="font-label text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="space-y-2">
        <span className="text-sm text-on-surface-variant font-medium">{description}</span>
        <div className="relative">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface/30 font-bold">$</span>
          <input 
            type="number" 
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full pl-10 pr-6 py-4 bg-surface-container-low border-none rounded-full focus:ring-2 focus:ring-primary/20 text-xl font-headline font-bold text-on-surface outline-none transition-all"
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function PuntoEquilibrioPage() {
  const { transactions } = useFinancials();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  // Calculate actual fixed and variable costs from transactions
  const calculatedFixedCosts = transactions
    .filter(t => t.type === 'expense' && t.isFixed)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const calculatedVariableCosts = transactions
    .filter(t => t.type === 'expense' && !t.isFixed)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const calculatedTotalExpenses = calculatedFixedCosts + calculatedVariableCosts;

  // Calculate average variable cost per unit (using total transactions count as proxy)
  const totalTransactions = transactions.filter(t => t.type === 'expense' && !t.isFixed).length || 1;
  const avgVariableCost = totalTransactions > 0 ? calculatedVariableCosts / totalTransactions : 350;

  // State for the break-even calculator
  const [fixedCosts, setFixedCosts] = useState(12000);
  const [salePrice, setSalePrice] = useState(850);
  const [variableCost, setVariableCost] = useState(350);

  // Pre-load with real data when transactions change
  useEffect(() => {
    if (calculatedFixedCosts > 0) {
      setFixedCosts(calculatedFixedCosts);
    }
    if (avgVariableCost > 0) {
      setVariableCost(Math.round(avgVariableCost));
    }
  }, [transactions]);

  // Derived values
  const contributionMargin = salePrice - variableCost;
  const breakEvenUnits = Math.ceil(fixedCosts / (contributionMargin || 1));

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (userId) {
        await supabase.from('scenarios').insert({
          id: crypto.randomUUID(),
          user_id: userId,
          name: `Pto. Equilibrio ${new Date().toLocaleDateString('es-MX')}`,
          baseline: { fixedCosts, salePrice, variableCost, breakEvenUnits, contributionMargin },
          hypothesis: {},
        });
      }
    } catch (_) {
      const all = JSON.parse(localStorage.getItem('breakeven') || '[]');
      all.push({ fixedCosts, salePrice, variableCost, breakEvenUnits, savedAt: new Date().toISOString() });
      localStorage.setItem('breakeven', JSON.stringify(all));
    } finally {
      setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500);
    }
  };

  const handleDownload = () => {
    const csv = [
      'Concepto,Valor',
      `Costos Fijos,$${fixedCosts}`,
      `Precio de Venta,$${salePrice}`,
      `Costo Variable,$${variableCost}`,
      `Margen de Contribución,$${contributionMargin}`,
      `Punto de Equilibrio,${breakEvenUnits} unidades`,
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'punto_equilibrio.csv'; a.click();
  };
  
  // Generate chart data
  const chartData = useMemo(() => {
    const data = [];
    const maxUnits = Math.max(100, breakEvenUnits * 1.5);
    const step = Math.ceil(maxUnits / 10);
    
    for (let i = 0; i <= maxUnits; i += step) {
      data.push({
        units: i,
        revenue: i * salePrice,
        costs: fixedCosts + (i * variableCost),
      });
    }
    
    // Ensure break-even point is in the data for precision
    const bePoint = {
      units: breakEvenUnits,
      revenue: breakEvenUnits * salePrice,
      costs: fixedCosts + (breakEvenUnits * variableCost),
      isBreakEven: true
    };
    
    // Insert and sort
    data.push(bePoint);
    return data.sort((a, b) => a.units - b.units);
  }, [fixedCosts, salePrice, variableCost, breakEvenUnits]);

  return (
    <div className="pb-12 max-w-6xl mx-auto space-y-12">
      {/* Hero Header */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight">
          Punto de Equilibrio
        </h1>
        <p className="text-on-surface-variant max-w-2xl text-lg font-medium leading-relaxed">
          Visualiza el momento exacto en que tu taller floral comienza a generar ganancias. Ajusta tus costos y precios para ver el impacto inmediato.
        </p>
      </motion.section>

      {/* Inputs Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InputCard 
          label="Costos Fijos (CF)" 
          description="Renta, Sueldos, Servicios"
          value={fixedCosts}
          onChange={setFixedCosts}
          icon={<Home className="w-5 h-5" />}
          color="text-primary"
        />
        <InputCard 
          label="Precio de Venta" 
          description="Promedio por Arreglo"
          value={salePrice}
          onChange={setSalePrice}
          icon={<TrendingUp className="w-5 h-5" />}
          color="text-secondary"
        />
        <InputCard 
          label="Costos Variables (CV)" 
          description="Flores, Base, Envoltura"
          value={variableCost}
          onChange={setVariableCost}
          icon={<BookOpen className="w-5 h-5" />}
          color="text-on-surface-variant"
        />
      </section>

      {/* Chart & Info Section */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <div className="lg:col-span-3 bg-surface-container-lowest p-8 md:p-12 rounded-3xl shadow-[0_20px_48px_rgba(43,21,26,0.06)] overflow-hidden relative border border-outline-variant/10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h3 className="font-headline text-2xl font-bold text-on-surface">Análisis de Rentabilidad</h3>
              <p className="text-sm text-on-surface-variant font-medium">Proyección a {chartData[chartData.length - 1].units} unidades vendidas</p>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary"></div>
                <span className="text-[10px] font-bold uppercase text-on-surface/60">Ingresos Totales</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-[10px] font-bold uppercase text-on-surface/60">Costos Totales</span>
              </div>
            </div>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e3bdc4" opacity={0.3} />
                <XAxis 
                  dataKey="units" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#2b151a66' }}
                  label={{ value: 'ARREGLOS', position: 'insideBottom', offset: -10, fontSize: 10, fontWeight: 800, fill: '#2b151a66' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#2b151a66' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#206c3b" 
                  strokeWidth={4} 
                  dot={false} 
                  activeDot={{ r: 6 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="costs" 
                  stroke="#b60057" 
                  strokeWidth={4} 
                  dot={false} 
                  activeDot={{ r: 6 }} 
                />
                <ReferenceDot 
                  x={breakEvenUnits} 
                  y={breakEvenUnits * salePrice} 
                  r={8} 
                  fill="#ffffff" 
                  stroke="#b60057" 
                  strokeWidth={3} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface-container-high p-6 rounded-2xl space-y-4">
            <div className="p-3 bg-white/50 rounded-xl inline-flex">
              <Lightbulb className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-headline font-bold text-on-surface">¿Cómo funciona?</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Cada arreglo que vendes aporta un <strong>Margen de Contribución</strong> (Precio - Costo Variable). 
              <br/><br/>
              El Punto de Equilibrio es cuántas veces debes ganar ese margen para cubrir tus <strong>Costos Fijos</strong>.
            </p>
          </div>

          <div className="bg-secondary-container/20 p-6 rounded-2xl space-y-4 border border-secondary/10">
            <div className="p-3 bg-secondary-container rounded-xl inline-flex">
              <Activity className="w-6 h-6 text-on-secondary-container" />
            </div>
            <h4 className="font-headline font-bold text-on-secondary-container">Margen Actual</h4>
            <div className="space-y-1">
              <p className="text-3xl font-headline font-extrabold text-on-secondary-container">${contributionMargin}</p>
              <p className="text-[10px] font-bold text-on-secondary-container/70 uppercase tracking-tighter">Por unidad vendida</p>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Card */}
      <motion.section 
        layout
        className="relative overflow-hidden bg-primary text-white p-10 md:p-16 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl shadow-primary/20"
      >
        <div className="relative z-10 space-y-4 max-w-xl text-center md:text-left">
          <div className="inline-block px-4 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2">Meta Mensual</div>
          <h2 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight">
            ¡Tu Punto de Equilibrio es de {breakEvenUnits} arreglos!
          </h2>
          <p className="text-white/80 text-lg font-medium">
            A partir de la unidad {breakEvenUnits + 1}, cada arreglo vendido suma <strong>${contributionMargin} netos</strong> a tu utilidad operativa. 
            Con {Math.ceil(breakEvenUnits / 15)} arreglos al día, eres rentable antes de la quincena.
          </p>
        </div>
        
        <div className="relative z-10 flex flex-col items-center gap-4 shrink-0">
          <div className="w-40 h-40 rounded-full border-8 border-white/10 flex items-center justify-center relative">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle 
                cx="80" cy="80" r="72" 
                fill="none" 
                stroke="white" 
                strokeWidth="8" 
                strokeDasharray="452" 
                strokeDashoffset={452 - (452 * Math.min(1, breakEvenUnits / 100))}
                strokeLinecap="round"
                className="opacity-40 transition-all duration-1000"
              />
            </svg>
            <span className="text-4xl font-headline font-extrabold">{breakEvenUnits}</span>
          </div>
          <span className="font-label text-xs font-bold opacity-80 uppercase tracking-widest">Unidades / Mes</span>
        </div>

        {/* Abstract Decoration */}
        <div className="absolute -right-20 -bottom-20 opacity-10 pointer-events-none">
          <Filter className="w-[400px] h-[400px] rotate-12" />
        </div>
      </motion.section>

      {/* Secondary Actions */}
      <section className="flex flex-col md:flex-row justify-between items-center py-8 border-t border-on-surface/5 gap-6">
        <div className="flex items-center gap-4">
          <img 
            className="w-12 h-12 rounded-full object-cover border-2 border-primary/20" 
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop" 
            alt="Florist avatar"
            referrerPolicy="no-referrer"
          />
          <div>
            <p className="font-headline font-bold text-on-surface">Consejo del Atelier</p>
            <p className="text-sm text-on-surface-variant italic">"Reduce el costo del listón en $10 y bajarás tu meta en 1 arreglo."</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <button
            onClick={handleDownload}
            className="flex-1 md:flex-none px-8 py-4 bg-surface-container-high text-primary font-bold rounded-full hover:bg-surface-container-high/80 transition-colors cursor-pointer"
          >
            Descargar CSV
          </button>
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`flex-1 md:flex-none px-8 py-4 font-bold rounded-full shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
              saved ? 'bg-secondary-container text-secondary' : 'bg-primary text-white shadow-primary/20 hover:scale-[1.02]'
            }`}
          >
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saved ? '¡Guardado!' : saving ? 'Guardando...' : 'Guardar Escenario'}
          </button>
        </div>
      </section>
    </div>
  );
}
