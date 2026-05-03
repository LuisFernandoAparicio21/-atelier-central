import { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  Plus, 
  Minus, 
  History, 
  CheckCircle2, 
  Sparkles,
  Save,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFinancials } from '../5_hooks/useFinancials';
import { supabase } from '../3_infrastructure/supabaseClient';

interface ScenarioData {
  salesVolume: number;
  unitPrice: number;
  costPerUnit: number;
  fixedCosts: number;
}

const StatBox = ({ label, value, unit }: { label: string; value: string | number; unit?: string }) => (
  <div className="bg-surface-container-low p-4 rounded-lg">
    <p className="text-xs font-medium text-on-surface-variant mb-1">{label}</p>
    <p className="text-2xl font-headline font-bold">
      {value} {unit && <span className="text-sm font-normal text-on-surface-variant">{unit}</span>}
    </p>
  </div>
);

const Stepper = ({ label, value, onChange, min = 0, step = 1 }: { label: string; value: number; onChange: (val: number) => void; min?: number; step?: number }) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">{label}</label>
    <div className="flex items-center gap-2">
      <button 
        onClick={() => onChange(Math.max(min, value - step))}
        className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors active:scale-90 cursor-pointer"
      >
        <Minus size={20} />
      </button>
      <div className="flex-1 bg-surface-container-low h-12 rounded-full flex items-center px-6 font-headline font-bold text-lg text-primary-container">
        {value}
      </div>
      <button 
        onClick={() => onChange(value + step)}
        className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors active:scale-90 cursor-pointer"
      >
        <Plus size={20} />
      </button>
    </div>
  </div>
);

const SmallStepper = ({ label, value, onChange, min = 0, step = 1 }: { label: string; value: number; onChange: (val: number) => void; min?: number; step?: number }) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">{label}</label>
    <div className="flex-1 bg-surface-container-low h-12 rounded-full flex items-center justify-between px-4 font-headline font-bold">
      <button onClick={() => onChange(Math.max(min, value - step))} className="text-primary hover:scale-110 transition-transform cursor-pointer"><Minus size={16} /></button>
      <span>{value}</span>
      <button onClick={() => onChange(value + step)} className="text-primary hover:scale-110 transition-transform cursor-pointer"><Plus size={16} /></button>
    </div>
  </div>
);

export default function EscenariosPage() {
  const { transactions } = useFinancials();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Derive real baseline from transactions
  const baseline: ScenarioData = useMemo(() => {
    const incomes = transactions.filter(t => t.type === 'income');
    const expenses = transactions.filter(t => t.type === 'expense');
    const salesVolume = incomes.length || 100;
    const totalRevenue = incomes.reduce((s, t) => s + t.amount, 0);
    const unitPrice = salesVolume > 0 ? Math.round(totalRevenue / salesVolume) : 100;
    const totalExpenses = expenses.reduce((s, t) => s + Math.abs(t.amount), 0);
    const fixedCosts = expenses.filter(t => t.isFixed).reduce((s, t) => s + Math.abs(t.amount), 0);
    const variableCosts = totalExpenses - fixedCosts;
    const costPerUnit = salesVolume > 0 ? Math.round(variableCosts / salesVolume) : 40;
    return { salesVolume, unitPrice, costPerUnit, fixedCosts: Math.round(fixedCosts) || 2000 };
  }, [transactions]);

  const [hypothesis, setHypothesis] = useState<ScenarioData>({
    salesVolume: 120,
    unitPrice: 105,
    costPerUnit: 38,
    fixedCosts: 2000,
  });

  // Sync hypothesis initial values once baseline loads
  useEffect(() => {
    if (transactions.length > 0) {
      setHypothesis({
        salesVolume: Math.round(baseline.salesVolume * 1.2),
        unitPrice: Math.round(baseline.unitPrice * 1.05),
        costPerUnit: Math.round(baseline.costPerUnit * 0.95),
        fixedCosts: baseline.fixedCosts,
      });
    }
  }, [baseline.salesVolume]);

  const calculateProfit = (data: ScenarioData) =>
    (data.salesVolume * (data.unitPrice - data.costPerUnit)) - data.fixedCosts;

  const calculateMargin = (data: ScenarioData) => {
    const revenue = data.salesVolume * data.unitPrice;
    const profit = calculateProfit(data);
    return revenue === 0 ? 0 : (profit / revenue) * 100;
  };

  const baselineProfit = calculateProfit(baseline);
  const baselineMargin = calculateMargin(baseline);
  const hypothesisProfit = calculateProfit(hypothesis);
  const hypothesisMargin = calculateMargin(hypothesis);
  const profitDelta = hypothesisProfit - baselineProfit;
  const profitIncreasePercent = baselineProfit === 0 ? 0 : ((hypothesisProfit - baselineProfit) / Math.abs(baselineProfit)) * 100;

  const handleSave = async () => {
    setSaving(true);
    try {
      // Get first tenant
      const { data: tenants } = await supabase.from('tenants').select('id').limit(1);
      const tenantId = tenants?.[0]?.id;
      if (tenantId) {
        await supabase.from('scenarios').insert({
          id: crypto.randomUUID(),
          tenant_id: tenantId,
          name: `Escenario ${new Date().toLocaleDateString('es-MX')}`,
          baseline,
          hypothesis,
        });
      }
    } catch (_) {
      // Save to localStorage as fallback
      const saved = JSON.parse(localStorage.getItem('scenarios') || '[]');
      saved.push({ baseline, hypothesis, savedAt: new Date().toISOString() });
      localStorage.setItem('scenarios', JSON.stringify(saved));
    } finally {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <div className="space-y-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <span className="text-xs font-bold tracking-widest text-primary uppercase">Estrategia & Inteligencia</span>
        <h3 className="text-4xl lg:text-5xl font-headline font-extrabold tracking-tight text-on-surface">Escenarios Paralelos</h3>
        <p className="text-on-surface-variant max-w-2xl leading-relaxed text-lg">
          Ajusta variables para simular fluctuaciones de mercado e inventario. Compara tu realidad actual con condiciones especulativas.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Baseline Card */}
        <motion.section 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="bg-surface-container-lowest rounded-xl p-8 border border-surface-container-high shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <History size={120} />
          </div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
              <CheckCircle2 className="text-secondary" size={24} />
            </div>
            <div>
              <h4 className="font-headline text-xl font-bold">Realidad Actual</h4>
              {transactions.length > 0 && (
                <p className="text-xs text-on-surface/40 font-medium">Calculado de {transactions.length} transacciones</p>
              )}
            </div>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <StatBox label="Volumen de Venta" value={baseline.salesVolume} unit="ventas" />
              <StatBox label="Precio Promedio" value={`$${baseline.unitPrice.toLocaleString()}`} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <StatBox label="Costo Variable/Unit" value={`$${baseline.costPerUnit.toLocaleString()}`} />
              <StatBox label="Costos Fijos" value={`$${baseline.fixedCosts.toLocaleString()}`} />
            </div>
            <div className="pt-6 border-t border-surface-container-high flex justify-between items-end">
              <div>
                <p className="text-sm font-semibold text-secondary mb-1">Utilidad Base</p>
                <p className="text-4xl font-headline font-extrabold text-on-surface">${baselineProfit.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">Margen Operativo</p>
                <p className="text-xl font-headline font-bold text-secondary">{baselineMargin.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Hypothesis Card */}
        <motion.section 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="bg-surface-container-lowest rounded-xl p-8 border-2 border-primary/10 shadow-2xl relative ring-4 ring-primary-container/5"
        >
          <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                <Sparkles className="text-white" size={20} />
              </div>
              <h4 className="font-headline text-xl font-bold">Crear Hipótesis</h4>
            </div>
            <AnimatePresence mode="wait">
              <motion.span 
                key={profitIncreasePercent > 0 ? 'better' : 'worse'}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className={`px-3 py-1 rounded-full text-xs font-bold font-headline flex items-center gap-1 ${
                  profitIncreasePercent >= 0 ? 'bg-secondary-container text-secondary' : 'bg-primary-fixed text-primary'
                }`}
              >
                <TrendingUp size={14} className={profitIncreasePercent < 0 ? 'rotate-180' : ''} />
                {profitIncreasePercent >= 0 ? 'Mejor Escenario' : 'Escenario Adverso'} ({profitIncreasePercent >= 0 ? '+' : ''}{profitIncreasePercent.toFixed(1)}%)
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="space-y-6">
            <Stepper label="Volumen de Venta" value={hypothesis.salesVolume} onChange={(v) => setHypothesis(p => ({ ...p, salesVolume: v }))} />
            <div className="grid grid-cols-2 gap-6">
              <SmallStepper label="Precio ($)" value={hypothesis.unitPrice} onChange={(v) => setHypothesis(p => ({ ...p, unitPrice: v }))} />
              <SmallStepper label="Costo/Unidad ($)" value={hypothesis.costPerUnit} onChange={(v) => setHypothesis(p => ({ ...p, costPerUnit: v }))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">Costos Fijos ($)</label>
              <input 
                type="range" min="0" max="20000" step="500"
                value={hypothesis.fixedCosts}
                onChange={(e) => setHypothesis(p => ({ ...p, fixedCosts: parseInt(e.target.value) }))}
                className="w-full accent-primary h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-bold text-on-surface-variant/50">
                <span>$0</span>
                <span className="text-primary font-headline text-xs">${hypothesis.fixedCosts.toLocaleString()}</span>
                <span>$20,000</span>
              </div>
            </div>
            <div className="pt-6 border-t border-surface-container-high flex justify-between items-end">
              <div>
                <p className="text-sm font-semibold text-primary mb-1">Utilidad Hipótesis</p>
                <motion.p key={hypothesisProfit} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="text-4xl font-headline font-extrabold">
                  ${hypothesisProfit.toLocaleString()}
                </motion.p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">Margen Proy.</p>
                <p className="text-xl font-headline font-bold text-primary">{hypothesisMargin.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      {/* Footer */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-surface-container-low rounded-xl p-8 flex flex-col lg:flex-row items-center gap-12"
      >
        <div className="flex-1 space-y-4">
          <h4 className="font-headline text-2xl font-extrabold">Delta de Rentabilidad</h4>
          <p className="text-on-surface-variant leading-relaxed text-lg">
            Comparando estos escenarios se muestra un potencial <strong className="text-primary">{Math.abs(profitIncreasePercent).toFixed(0)}% {profitIncreasePercent >= 0 ? 'de aumento' : 'de disminución'}</strong> en la utilidad neta. 
            Esto es impulsado por el {hypothesis.salesVolume > baseline.salesVolume ? 'aumento' : 'cambio'} de volumen de {Math.abs(hypothesis.salesVolume - baseline.salesVolume)} unidades y los ajustes en precios y costos.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <button 
              onClick={handleSave}
              disabled={saving || saved}
              className={`px-8 py-3 rounded-full font-headline text-sm font-bold shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2 ${
                saved ? 'bg-secondary-container text-secondary' : 'bg-primary text-white shadow-primary/20 hover:scale-105'
              }`}
            >
              {saved ? <Check size={16} /> : <Save size={16} />}
              {saved ? '¡Guardado!' : saving ? 'Guardando...' : 'Guardar Escenario'}
            </button>
            <button 
              onClick={() => {
                const csv = `Concepto,Actual,Hipótesis\nVolumen,${baseline.salesVolume},${hypothesis.salesVolume}\nPrecio,${baseline.unitPrice},${hypothesis.unitPrice}\nCosto/Unidad,${baseline.costPerUnit},${hypothesis.costPerUnit}\nCostos Fijos,${baseline.fixedCosts},${hypothesis.fixedCosts}\nUtilidad,${baselineProfit},${hypothesisProfit}\nMargen,${baselineMargin.toFixed(1)}%,${hypothesisMargin.toFixed(1)}%`;
                const blob = new Blob([csv], { type: 'text/csv' });
                const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'escenario.csv'; a.click();
              }}
              className="px-8 py-3 bg-surface-container-high text-on-surface rounded-full font-headline text-sm font-bold hover:bg-surface-container-highest transition-colors active:scale-95 cursor-pointer"
            >
              Exportar CSV
            </button>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-end justify-around h-72 bg-surface-container-lowest rounded-xl p-8 shadow-inner relative">
          <div className="flex flex-col items-center gap-4 w-24">
            <div className="relative w-full flex flex-col items-center">
              <motion.div initial={{ height: 0 }} animate={{ height: 160 }} className="bg-secondary w-16 rounded-t-xl" />
              <span className="absolute -top-8 text-xs font-bold font-headline">${baselineProfit.toLocaleString()}</span>
            </div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Actual</span>
          </div>
          <div className="flex flex-col items-center gap-4 w-24">
            <div className="relative w-full flex flex-col items-center">
              <motion.div 
                initial={{ height: 0 }} 
                animate={{ height: Math.max(8, (hypothesisProfit / Math.max(1, Math.abs(baselineProfit))) * 160) }} 
                className="bg-gradient-to-t from-primary to-primary-container w-16 rounded-t-xl"
              />
              <span className="absolute -top-8 text-xs font-bold font-headline text-primary">${hypothesisProfit.toLocaleString()}</span>
            </div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Hipótesis</span>
          </div>
          <div className="hidden xl:flex flex-col justify-center items-center h-full border-l-2 border-dashed border-on-surface/10 pl-8 space-y-2">
            <motion.div key={profitDelta} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className={`${profitDelta >= 0 ? 'text-secondary' : 'text-primary'} flex items-center gap-1 font-headline font-extrabold text-2xl`}>
              {profitDelta >= 0 ? <Plus size={20} /> : <Minus size={20} />}
              ${Math.abs(profitDelta).toLocaleString()}
            </motion.div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase text-center max-w-[100px]">Diferencia en Utilidad Neta</span>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
