import { useState } from 'react';
import React from 'react';
import {
  Wallet,
  TrendingUp,
  ShieldCheck,
  Gauge,
  CheckCircle,
  Info,
  Download,
  Upload,
  PieChart,
  TrendingDown,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { useFinancials } from "../5_hooks/useFinancials";

// --- Sub-components (isolated for DashboardPage) ---

interface SummaryCardProps {
  title: string;
  value: string;
  unit?: string;
  subtitle: string;
  footerIcon: LucideIcon;
  footerText: string;
  icon: LucideIcon;
  variant?: "secondary" | "tertiary" | "primary";
}

function StatCard({ 
  title, 
  value, 
  unit, 
  subtitle, 
  footerIcon: FooterIcon, 
  footerText, 
  icon: Icon,
  variant = "primary"
}: SummaryCardProps) {
  const colorMap = {
    primary: "text-on-surface",
    secondary: "text-secondary",
    tertiary: "text-primary-container", // Mapped tertiary to primary-container since it's the closest existing token
  };

  const footerColorMap = {
    primary: "text-primary",
    secondary: "text-secondary",
    tertiary: "text-primary-container",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_20px_48px_rgba(43,21,26,0.04)] relative overflow-hidden group border border-surface-container-high/10"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={96} strokeWidth={1.5} />
      </div>
      
      <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-4 opacity-70">
        {title}
      </p>
      
      <h2 className={`text-4xl font-headline font-black ${colorMap[variant]} mb-2 flex items-baseline gap-1`}>
        {value} {unit && <span className="text-xl font-bold opacity-60">{unit}</span>}
      </h2>
      
      <p className="text-sm text-on-surface-variant/70 font-medium">
        {subtitle}
      </p>
      
      <div className={`mt-6 flex items-center gap-2 ${footerColorMap[variant]} text-sm font-bold`}>
        <FooterIcon size={16} />
        <span>{footerText}</span>
      </div>
    </motion.div>
  );
}

function CostComparison({ transactions, costCategories, balanceSheetItems, categoryFilter = '', onCategoryFilterChange }: { transactions: any[]; costCategories: any[]; balanceSheetItems: any[]; categoryFilter?: string; onCategoryFilterChange?: (filter: string) => void }) {
  const [activeTab, setActiveTab] = React.useState<'income' | 'expense' | 'costs'>('costs');
  const [periodGranularity, setPeriodGranularity] = React.useState<'day' | 'week' | 'month' | 'year'>('week');
  const [selectedDate, setSelectedDate] = React.useState(new Date('2026-04-28'));
  const [showCalendar, setShowCalendar] = React.useState(false);
  const [hoveredWeekStart, setHoveredWeekStart] = React.useState<Date | null>(null);

  const formatCurrency = (n: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(n);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getWeekStartFromDay = (year: number, month: number, day: number) => {
    const d = new Date(year, month, day);
    const dow = d.getDay();
    const diff = dow === 0 ? -6 : 1 - dow;
    d.setDate(d.getDate() + diff);
    d.setHours(0,0,0,0);
    return d;
  };

  const isSameWeek = (d1: Date, d2: Date) => {
    const w1 = getWeekStartFromDay(d1.getFullYear(), d1.getMonth(), d1.getDate());
    const w2 = getWeekStartFromDay(d2.getFullYear(), d2.getMonth(), d2.getDate());
    return w1.getTime() === w2.getTime();
  };

  // Move state up or use a separate component to avoid re-renders unmounting the calendar
  const [calNavDate, setCalNavDate] = React.useState(new Date());

  const WeekPickerCalendar = () => {
    const daysInMonth = getDaysInMonth(calNavDate);
    const firstDay = getFirstDayOfMonth(calNavDate);
    const days: (number | null)[] = [
      ...Array.from({ length: firstDay }, () => null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    const rows: (number | null)[][] = [];
    for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7));
    while (rows[rows.length - 1]?.length < 7) rows[rows.length - 1].push(null);

    return (
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="absolute top-12 left-0 bg-surface-container-lowest rounded-2xl shadow-xl border border-on-surface/10 p-5 z-50 w-72"
      >
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCalNavDate(new Date(calNavDate.getFullYear(), calNavDate.getMonth() - 1))}
            className="p-1.5 hover:bg-surface-container-high rounded-lg transition cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="font-bold text-on-surface text-sm capitalize">
            {calNavDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={() => setCalNavDate(new Date(calNavDate.getFullYear(), calNavDate.getMonth() + 1))}
            className="p-1.5 hover:bg-surface-container-high rounded-lg transition cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {['L','M','X','J','V','S','D'].map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-on-surface/40 py-1">{d}</div>
          ))}
        </div>

        <div className="flex flex-col gap-0.5">
          {rows.map((row, rowIdx) => {
            const firstRealDay = row.find(d => d !== null);
            const rowWeekStart = firstRealDay
              ? getWeekStartFromDay(calNavDate.getFullYear(), calNavDate.getMonth(), firstRealDay as number)
              : null;
            const isHovered = rowWeekStart && hoveredWeekStart && rowWeekStart.getTime() === hoveredWeekStart.getTime();
            const isSelected = rowWeekStart && isSameWeek(selectedDate, rowWeekStart);

            return (
              <div
                key={rowIdx}
                className={`grid grid-cols-7 rounded-lg cursor-pointer transition-all ${
                  isSelected ? 'bg-secondary/20' : isHovered ? 'bg-surface-container-high' : ''
                }`}
                onMouseEnter={() => rowWeekStart && setHoveredWeekStart(rowWeekStart)}
                onMouseLeave={() => setHoveredWeekStart(null)}
                onClick={() => {
                  if (rowWeekStart) {
                    setSelectedDate(new Date(rowWeekStart));
                    setShowCalendar(false);
                  }
                }}
              >
                {row.map((day, di) => (
                  <div
                    key={di}
                    className={`text-center text-sm py-1.5 font-medium ${
                      day === null ? 'text-transparent' :
                      isSelected ? 'text-secondary font-bold' :
                      'text-on-surface/70'
                    }`}
                  >
                    {day ?? '·'}
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        <p className="text-center text-[10px] text-on-surface/40 mt-3">Haz clic en una fila para seleccionar la semana</p>
      </motion.div>
    );
  };



  // Map expense subcategories to cost categories
  const categorizeExpense = (subcategory: string): string => {
    const map: Record<string, string> = {
      sueldos:   'Remuneraciones',
      nomina:    'Remuneraciones',
      flor:      'Insumos (Flores, Base, etc.)',
      insumos:   'Insumos (Flores, Base, etc.)',
      mermas:    'Insumos (Flores, Base, etc.)',
      renta:     'Renta Local',
      local:     'Renta Local',
      servicios: 'Servicios (Luz, Agua, Tel)',
      luz:       'Servicios (Luz, Agua, Tel)',
      transporte:'Transporte / Envíos',
      envios:    'Transporte / Envíos',
    };
    return map[subcategory?.toLowerCase()] || 'Otros';
  };

  // Group actual expenses by category
  const actualByCategory: Record<string, number> = {};
  costCategories.forEach(cat => {
    actualByCategory[cat.name] = transactions
      .filter(t => t.type === 'expense' && categorizeExpense(t.subcategory) === cat.name)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  });

  const totalBudgetMonthly = costCategories.reduce((sum, cat) => sum + cat.budgetMonthly, 0);
  const totalActual = Object.values(actualByCategory).reduce((sum, v) => sum + v, 0);
  const variance = totalActual - totalBudgetMonthly;
  const variancePercent = totalBudgetMonthly > 0 ? ((variance / totalBudgetMonthly) * 100).toFixed(1) : 0;

  // Filter categories by search
  const filteredCategories = costCategories.filter(cat =>
    categoryFilter.trim() === '' || cat.name.toLowerCase().includes(categoryFilter.toLowerCase())
  );

  return (
    <section className="bg-surface-container-low rounded-2xl p-8 mb-12 border border-surface-container-high/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <PieChart size={20} />
        </div>
        <div className="flex-1">
          <h3 className="font-headline font-bold text-2xl text-on-surface/80">
            Estado Financiero Detallado
          </h3>
          <p className="text-sm text-on-surface/50 mt-1">Ingresos, egresos y análisis de costos</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-8 border-b border-on-surface/10">
        {[
          { id: 'costs', label: '💰 Presupuesto vs Costos' },
          { id: 'income', label: '📥 Ingresos' },
          { id: 'expense', label: '📤 Egresos' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 font-bold text-sm transition-all border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'text-primary border-primary'
                : 'text-on-surface/50 border-transparent hover:text-on-surface/70'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Summary Cards - Costs Tab Only */}
      {activeTab === 'costs' && <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-surface-container-lowest rounded-xl p-5 border border-on-surface/10">
          <p className="text-xs text-on-surface/60 font-bold uppercase mb-2">Presupuesto Mensual</p>
          <p className="text-2xl font-headline font-black text-on-surface">{formatCurrency(totalBudgetMonthly)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-surface-container-lowest rounded-xl p-5 border border-on-surface/10">
          <p className="text-xs text-on-surface/60 font-bold uppercase mb-2">Costos Reales</p>
          <p className="text-2xl font-headline font-black text-on-surface">{formatCurrency(totalActual)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`rounded-xl p-5 border ${variance > 0 ? 'bg-primary/10 border-primary/30' : 'bg-secondary/10 border-secondary/30'}`}>
          <p className="text-xs font-bold uppercase mb-2 flex items-center gap-2">
            {variance > 0 ? <TrendingUp size={14} className="text-primary" /> : <TrendingDown size={14} className="text-secondary" />}
            <span className={variance > 0 ? 'text-primary' : 'text-secondary'}>Diferencia</span>
          </p>
          <p className={`text-2xl font-headline font-black ${variance > 0 ? 'text-primary' : 'text-secondary'}`}>
            {variance > 0 ? '+' : ''}{formatCurrency(variance)}
          </p>
          <p className={`text-xs mt-1 ${variance > 0 ? 'text-primary/70' : 'text-secondary/70'}`}>
            {variance > 0 ? '↑ Sobre presupuesto' : '↓ Bajo presupuesto'} ({variancePercent}%)
          </p>
        </motion.div>
      </div>
      }

      {/* Content by Tab */}
      {activeTab === 'income' && (() => {
        const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

        // Get the Monday of the week that contains selectedDate
        const getWeekStart = (date: Date) => {
          const d = new Date(date);
          const day = d.getDay();
          const diff = day === 0 ? -6 : 1 - day; // Monday-based
          d.setDate(d.getDate() + diff);
          d.setHours(0, 0, 0, 0);
          return d;
        };

        const weekStart = getWeekStart(selectedDate);
        const weekDays = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(weekStart);
          d.setDate(weekStart.getDate() + i);
          return d;
        });

        const weekEnd = weekDays[6];
        const allIncome = transactions.filter(t => t.type === 'income');
        const weekIncome = allIncome.filter(t => {
          const d = new Date(t.date);
          d.setHours(0,0,0,0);
          return d >= weekStart && d <= weekEnd;
        });

        const weekTotal = weekIncome.reduce((s, t) => s + Math.abs(t.amount), 0);
        const totalAllIncome = allIncome.reduce((s, t) => s + Math.abs(t.amount), 0);

        const prevWeek = () => {
          const d = new Date(selectedDate);
          d.setDate(d.getDate() - 7);
          setSelectedDate(d);
          setCalNavDate(new Date(d)); // fix: sync calendar nav
          setShowCalendar(false);
        };
        const nextWeek = () => {
          const d = new Date(selectedDate);
          d.setDate(d.getDate() + 7);
          setSelectedDate(d);
          setCalNavDate(new Date(d)); // fix: sync calendar nav
          setShowCalendar(false);
        };

        // Financial indicators (calculated from all transactions)
        const totalIncomeMonth = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Math.abs(t.amount), 0);
        const totalExpensesMonth = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0);
        const utilidadNeta = totalIncomeMonth - totalExpensesMonth;
        // Balance sheet from Supabase balance_sheet_items
        const activos = balanceSheetItems.filter(i => i.side === 'activo');
        const pasivos = balanceSheetItems.filter(i => i.side === 'pasivo');
        const activoCirculante = {
          efectivo:         activos.find(i => i.label.toLowerCase().includes('efectivo'))?.amount ?? 0,
          inventario:       activos.find(i => i.label.toLowerCase().includes('inventario'))?.amount ?? 0,
          cuentasPorCobrar: activos.find(i => i.label.toLowerCase().includes('cobrar'))?.amount ?? 0,
        };
        const pasivoCirculante = {
          proveedores:      pasivos.find(i => i.label.toLowerCase().includes('proveedor'))?.amount ?? 0,
          serviciosPorPagar:pasivos.find(i => i.label.toLowerCase().includes('servicio'))?.amount ?? 0,
          deudaCortoPlano:  pasivos.find(i => i.label.toLowerCase().includes('deuda'))?.amount ?? 0,
        };
        const totalActivo = activos.reduce((s, i) => s + i.amount, 0);
        const totalPasivo = pasivos.reduce((s, i) => s + i.amount, 0);
        const liquidez = totalPasivo > 0 ? (totalActivo / totalPasivo) : 0;
        const pruebaAcida = totalPasivo > 0 ? ((totalActivo - activoCirculante.inventario) / totalPasivo) : 0;
        const rentabilidad = totalExpensesMonth > 0 ? ((utilidadNeta / totalExpensesMonth) * 100) : 0;

        const prevWeekTotal = (() => {
          const pw = new Date(weekStart);
          pw.setDate(pw.getDate() - 7);
          const pe = new Date(pw); pe.setDate(pe.getDate() + 6);
          return allIncome.filter(t => {
            const d = new Date(t.date); d.setHours(0,0,0,0);
            return d >= pw && d <= pe;
          }).reduce((s, t) => s + Math.abs(t.amount), 0);
        })();
        const weekDiff = prevWeekTotal > 0 ? ((weekTotal - prevWeekTotal) / prevWeekTotal * 100) : null;

        return (
          <div>
            {/* 3 KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* KPI 1 – Ingreso semanal */}
              <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/20 p-6">
                <div className="absolute right-4 top-4 opacity-10 text-secondary"><TrendingUp size={64} strokeWidth={1.5}/></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-secondary/80 mb-3">Ingreso semana actual</p>
                <p className="text-3xl font-headline font-black text-secondary mb-1">{formatCurrency(weekTotal)}</p>
                {weekDiff !== null && (
                  <p className={`text-xs font-bold flex items-center gap-1 ${weekDiff >= 0 ? 'text-secondary' : 'text-primary'}`}>
                    {weekDiff >= 0 ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                    {weekDiff >= 0 ? '+' : ''}{weekDiff.toFixed(1)}% vs semana anterior
                  </p>
                )}
                <p className="text-[10px] text-on-surface/40 mt-2">
                  {weekStart.toLocaleDateString('es-MX',{day:'2-digit',month:'short'})} – {weekEnd.toLocaleDateString('es-MX',{day:'2-digit',month:'short'})}
                </p>
              </motion.div>

              {/* KPI 2 – Ingreso mensual */}
              <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-container-highest to-surface-container-low border border-on-surface/10 p-6">
                <div className="absolute right-4 top-4 opacity-10"><Wallet size={64} strokeWidth={1.5}/></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface/60 mb-3">Total mensual</p>
                <p className="text-3xl font-headline font-black text-on-surface mb-1">{formatCurrency(totalAllIncome)}</p>
                <p className="text-xs text-on-surface/50 font-medium mt-2">
                  {allIncome.length} {allIncome.length === 1 ? 'venta registrada' : 'ventas registradas'}
                </p>
              </motion.div>

              {/* KPI 3 – Utilidad neta */}
              <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.16 }}
                className={`relative overflow-hidden rounded-2xl border p-6 ${
                  utilidadNeta >= 0
                    ? 'bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border-emerald-500/20'
                    : 'bg-gradient-to-br from-primary/15 to-primary/5 border-primary/20'
                }`}>
                <div className={`absolute right-4 top-4 opacity-10 ${utilidadNeta >= 0 ? 'text-emerald-500' : 'text-primary'}`}>
                  {utilidadNeta >= 0 ? <ShieldCheck size={64} strokeWidth={1.5}/> : <TrendingDown size={64} strokeWidth={1.5}/>}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface/60 mb-3">Utilidad neta</p>
                <p className={`text-3xl font-headline font-black mb-1 ${utilidadNeta >= 0 ? 'text-emerald-600' : 'text-primary'}`}>
                  {utilidadNeta >= 0 ? '+' : ''}{formatCurrency(utilidadNeta)}
                </p>
                <p className={`text-xs font-bold mt-2 ${utilidadNeta >= 0 ? 'text-emerald-600/70' : 'text-primary/70'}`}>
                  {utilidadNeta >= 0 ? `Margen: ${totalAllIncome > 0 ? ((utilidadNeta/totalAllIncome)*100).toFixed(1) : 0}%` : 'Revisar egresos'}
                </p>
              </motion.div>
            </div>

            {/* Week picker nav */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <div className="relative">
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg hover:bg-secondary/90 transition-all cursor-pointer"
                >
                  <span className="opacity-80">📅</span> {weekStart.toLocaleDateString('es-MX',{day:'2-digit',month:'short'})} — {weekEnd.toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'})}
                </button>
                {showCalendar && WeekPickerCalendar()}
              </div>
              <button onClick={prevWeek} className="p-2 hover:bg-surface-container-high rounded-lg transition cursor-pointer border border-on-surface/10">
                <ChevronLeft size={16} />
              </button>
              <button onClick={nextWeek} className="p-2 hover:bg-surface-container-high rounded-lg transition cursor-pointer border border-on-surface/10">
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="rounded-2xl border border-on-surface/5 bg-surface-container-lowest overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="text-[10px] font-black uppercase tracking-widest text-on-surface/50 py-4 px-4 text-center w-32">Fecha</th>
                    <th className="text-[10px] font-black uppercase tracking-widest text-on-surface/50 py-4 px-4 text-center w-24">Cantidad</th>
                    <th className="text-[10px] font-black uppercase tracking-widest text-on-surface/50 py-4 px-4 text-left">Producto / Concepto</th>
                    <th className="text-[10px] font-black uppercase tracking-widest text-on-surface/50 py-4 px-4 text-right w-40">Precio de venta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-on-surface/5">
                  {weekDays.map((day) => {
                    const dayName = DAY_NAMES[day.getDay()];
                    const dateStr = day.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
                    const dayTransactions = weekIncome.filter(t => {
                      const d = new Date(t.date);
                      return d.getFullYear() === day.getFullYear() &&
                             d.getMonth() === day.getMonth() &&
                             d.getDate() === day.getDate();
                    });
                    const dayTotal = dayTransactions.reduce((s, t) => s + Math.abs(t.amount), 0);
                    const isSunday = day.getDay() === 0;

                    if (isSunday || dayTransactions.length === 0) {
                      return (
                        <tr key={dateStr} className={isSunday ? 'bg-surface-container-low/30' : ''}>
                          <td className="py-6 px-4 text-center border-r border-on-surface/5">
                            <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter mb-1 ${
                              isSunday ? 'bg-primary-fixed text-primary' : 'bg-surface-container-high text-on-surface/40'
                            }`}>
                              {dayName}
                            </div>
                            <div className="text-[10px] text-on-surface/30 font-bold">{dateStr}</div>
                          </td>
                          <td colSpan={3} className="py-6 px-4 text-center text-on-surface/30 italic font-medium">
                            {isSunday ? (
                              <div className="flex items-center justify-center gap-2">
                                <Info size={14} className="opacity-50" />
                                <span>El negocio no abre</span>
                              </div>
                            ) : 'Sin ventas registradas'}
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <React.Fragment key={dateStr}>
                        {dayTransactions.map((t, idx) => (
                          <tr key={`${dateStr}-${idx}`} className="group hover:bg-surface-container-low/40 transition-colors">
                            {idx === 0 && (
                              <td rowSpan={dayTransactions.length + 1} className="py-6 px-4 text-center align-middle border-r border-on-surface/5 bg-secondary/5">
                                <div className="inline-block px-3 py-1 rounded-full bg-secondary text-on-secondary text-[10px] font-black uppercase tracking-tighter mb-2">
                                  {dayName}
                                </div>
                                <div className="text-[10px] text-secondary/60 font-black">{dateStr}</div>
                              </td>
                            )}
                            <td className="py-4 px-4 text-center text-on-surface/50 font-bold">1</td>
                            <td className="py-4 px-4">
                              <p className="font-bold text-on-surface">{t.title}</p>
                              {t.description && <p className="text-[10px] text-on-surface/40 font-medium">{t.description}</p>}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <span className="font-headline font-black text-secondary text-base">{formatCurrency(Math.abs(t.amount))}</span>
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-secondary/5 border-t border-secondary/10">
                          <td colSpan={2} className="py-3 px-4 text-right">
                            <span className="text-[10px] font-black uppercase tracking-widest text-secondary/60">Ingreso del día</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-headline font-black text-secondary text-sm px-3 py-1 bg-white rounded-lg shadow-sm">
                              {formatCurrency(dayTotal)}
                            </span>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
                <tfoot className="bg-secondary text-on-secondary">
                  <tr>
                    <td colSpan={3} className="py-6 px-6 text-right">
                      <span className="text-xs font-black uppercase tracking-[0.2em] opacity-70">Acumulado Semanal</span>
                    </td>
                    <td className="py-6 px-6 text-right">
                      <span className="text-2xl font-headline font-black leading-none">
                        {formatCurrency(weekTotal)}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* ── Resumen Financiero Mensual ── */}
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-6 rounded-full bg-secondary"></div>
                <h4 className="font-headline font-bold text-xl text-on-surface">Resumen Financiero Mensual</h4>
              </div>
              <div className="rounded-2xl overflow-hidden border border-on-surface/10 shadow-sm">
                {/* Ingresos row */}
                <div className="flex items-center bg-emerald-50 border-b border-emerald-200/60 px-6 py-4">
                  <div className="flex-1">
                    <p className="font-bold text-emerald-800 text-sm">Total ingresos mensuales</p>
                  </div>
                  <div className="w-16 text-emerald-700 font-bold text-sm text-center">$</div>
                  <div className="w-40 text-right">
                    <span className="font-black text-emerald-700 text-lg">{formatCurrency(totalIncomeMonth)}</span>
                  </div>
                  <div className="w-48"></div>
                </div>
                {/* Egresos row */}
                <div className="flex items-center bg-red-50 border-b border-red-200/60 px-6 py-4">
                  <div className="flex-1">
                    <p className="font-bold text-red-700 text-sm">Total egresos mensuales</p>
                  </div>
                  <div className="w-16 text-red-600 font-bold text-sm text-center">$</div>
                  <div className="w-40 text-right">
                    <span className="font-black text-red-600 text-lg">{formatCurrency(totalExpensesMonth)}</span>
                  </div>
                  <div className="w-48"></div>
                </div>
                {/* Utilidad Neta */}
                <div className="flex items-center bg-surface-container-low border-b border-on-surface/10 px-6 py-4">
                  <div className="flex-1">
                    <p className="font-black text-on-surface text-sm">Utilidad Neta</p>
                  </div>
                  <div className="w-16 text-on-surface/60 font-bold text-sm text-center">$</div>
                  <div className="w-40 text-right">
                    <span className={`font-black text-lg ${utilidadNeta >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrency(utilidadNeta)}
                    </span>
                  </div>
                  <div className="w-48 pl-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${utilidadNeta >= 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                      {utilidadNeta >= 0 ? `Ganancia de ${formatCurrency(utilidadNeta)}` : `Pérdida de ${formatCurrency(Math.abs(utilidadNeta))}`}
                    </span>
                  </div>
                </div>

                {/* Indicadores */}
                {[
                  {
                    label: 'Liquidez',
                    value: liquidez.toFixed(2),
                    note: liquidez >= 1 ? 'Capacidad de pago suficiente' : 'Liquidez baja',
                    noteOk: liquidez >= 1,
                    indent: true,
                    highlight: false,
                  },
                  {
                    label: 'Prueba Ácida',
                    value: pruebaAcida.toFixed(2),
                    note: pruebaAcida >= 1 ? 'Independiente del inventario' : 'Depende del inventario',
                    noteOk: pruebaAcida >= 1,
                    indent: true,
                    highlight: false,
                  },
                  {
                    label: 'Rentabilidad',
                    value: `${rentabilidad.toFixed(2)}%`,
                    note: rentabilidad > 0 ? `El negocio es rentable un ${rentabilidad.toFixed(2)}%` : 'El negocio no es rentable',
                    noteOk: rentabilidad > 0,
                    indent: true,
                    highlight: true,
                  },
                ].map((row, i) => (
                  <div key={i} className={`flex items-center border-b border-on-surface/5 px-6 py-3.5 ${row.highlight ? 'bg-amber-50/50' : 'bg-surface-container-lowest'}`}>
                    <div className="flex-1">
                      <p className={`text-sm ${row.indent ? 'pl-4 text-on-surface/70' : 'font-bold text-on-surface'}`}>{row.label}</p>
                    </div>
                    <div className="w-16"></div>
                    <div className="w-40 text-right">
                      <span className="font-black text-on-surface text-base">{row.value}</span>
                    </div>
                    <div className="w-48 pl-4">
                      {row.highlight ? (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-700">{row.note}</span>
                      ) : (
                        <span className={`text-xs ${row.noteOk ? 'text-emerald-600' : 'text-red-500'}`}>{row.note}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Balance General ── */}
            <div className="mt-10 mb-2">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-6 rounded-full bg-primary"></div>
                <h4 className="font-headline font-bold text-xl text-on-surface">Balance General</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Activo */}
                <div className="rounded-2xl overflow-hidden border border-orange-200/60 shadow-sm">
                  <div className="bg-orange-400/80 px-5 py-3.5">
                    <p className="font-black text-white text-sm uppercase tracking-wider">Activo Circulante</p>
                  </div>
                  {[
                    { label: 'Efectivo en caja (del mes)', value: activoCirculante.efectivo },
                    { label: 'Inventario en stock', value: activoCirculante.inventario },
                    { label: 'Cuentas por cobrar', value: activoCirculante.cuentasPorCobrar },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center px-5 py-3 bg-orange-50/60 border-b border-orange-100">
                      <span className="text-sm text-on-surface/75">{row.label}</span>
                      <span className="font-bold text-on-surface text-sm">{formatCurrency(row.value)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center px-5 py-3.5 bg-orange-100/80">
                    <span className="font-black text-on-surface text-sm">Total Activo</span>
                    <span className="font-black text-orange-700 text-base">{formatCurrency(totalActivo)}</span>
                  </div>
                </div>

                {/* Pasivo */}
                <div className="rounded-2xl overflow-hidden border border-blue-200/60 shadow-sm">
                  <div className="bg-blue-400/80 px-5 py-3.5">
                    <p className="font-black text-white text-sm uppercase tracking-wider">Pasivo Circulante</p>
                  </div>
                  {[
                    { label: 'Proveedores', value: pasivoCirculante.proveedores },
                    { label: 'Servicios por pagar', value: pasivoCirculante.serviciosPorPagar },
                    { label: 'Deuda a corto plazo', value: pasivoCirculante.deudaCortoPlano },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center px-5 py-3 bg-blue-50/60 border-b border-blue-100">
                      <span className="text-sm text-on-surface/75">{row.label}</span>
                      <span className="font-bold text-on-surface text-sm">{formatCurrency(row.value)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center px-5 py-3.5 bg-blue-100/80">
                    <span className="font-black text-on-surface text-sm">Total Pasivo</span>
                    <span className="font-black text-blue-700 text-base">{formatCurrency(totalPasivo)}</span>
                  </div>
                </div>
              </div>

              {/* Capital neto = Activo - Pasivo */}
              <div className={`mt-4 rounded-xl px-6 py-4 flex items-center justify-between border ${
                totalActivo - totalPasivo >= 0
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <p className="font-bold text-on-surface text-sm">Capital de Trabajo Neto <span className="text-xs font-normal text-on-surface/50 ml-1">(Activo − Pasivo)</span></p>
                <p className={`font-black text-xl ${totalActivo - totalPasivo >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  {formatCurrency(totalActivo - totalPasivo)}
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {activeTab === 'expense' && (
        <div>
          {(() => {
            const expenseTransactions = transactions.filter(t => {
              if (t.type !== 'expense') return false;
              const tDate = new Date(t.date);
              return tDate.getFullYear() === selectedDate.getFullYear() && tDate.getMonth() === selectedDate.getMonth();
            }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
            const fixedTotal = expenseTransactions.filter(t => t.isFixed).reduce((sum, t) => sum + Math.abs(t.amount), 0);
            const variableTotal = expenseTransactions.filter(t => !t.isFixed).reduce((sum, t) => sum + Math.abs(t.amount), 0);

            const getDateGroup = (date: Date, granularity: 'day' | 'week' | 'month' | 'year'): string => {
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');

              if (granularity === 'day') return `${day}/${month}/${year}`;

              if (granularity === 'week') {
                const firstDay = new Date(date);
                firstDay.setDate(date.getDate() - date.getDay());
                const lastDay = new Date(firstDay);
                lastDay.setDate(firstDay.getDate() + 6);
                return `Semana: ${firstDay.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' })} - ${lastDay.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' })}`;
              }

              if (granularity === 'month') {
                return `${date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}`;
              }

              return `Año ${year}`;
            };

            const groupByPeriod = () => {
              const groups: Record<string, { transactions: typeof expenseTransactions; minDate: number }> = {};
              expenseTransactions.forEach(t => {
                const date = new Date(t.date);
                const key = getDateGroup(date, periodGranularity);
                if (!groups[key]) groups[key] = { transactions: [], minDate: date.getTime() };
                groups[key].transactions.push(t);
                groups[key].minDate = Math.min(groups[key].minDate, date.getTime());
              });

              const sorted = Object.entries(groups)
                .sort((a, b) => b[1].minDate - a[1].minDate)
                .map(([key, val]) => [key, val.transactions] as const);

              return Object.fromEntries(sorted);
            };

            const grouped = groupByPeriod();
            let acumulado = 0;

            return (
              <div>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-surface-container-lowest rounded-xl p-5 border border-on-surface/10">
                    <p className="text-xs text-on-surface/60 font-bold uppercase mb-2">Total Egresos</p>
                    <p className="text-2xl font-headline font-black text-primary">{formatCurrency(totalExpenses)}</p>
                    <p className="text-xs text-on-surface/50 mt-2">{expenseTransactions.length} transacciones</p>
                  </div>
                  <div className="bg-surface-container-lowest rounded-xl p-5 border border-on-surface/10">
                    <p className="text-xs text-on-surface/60 font-bold uppercase mb-2">Costos Fijos</p>
                    <p className="text-2xl font-headline font-black text-on-surface">{formatCurrency(fixedTotal)}</p>
                    <p className="text-xs text-on-surface/50 mt-2">{((fixedTotal/totalExpenses)*100).toFixed(0)}% del total</p>
                  </div>
                  <div className="bg-surface-container-lowest rounded-xl p-5 border border-on-surface/10">
                    <p className="text-xs text-on-surface/60 font-bold uppercase mb-2">Costos Variables</p>
                    <p className="text-2xl font-headline font-black text-secondary">{formatCurrency(variableTotal)}</p>
                    <p className="text-xs text-on-surface/50 mt-2">{((variableTotal/totalExpenses)*100).toFixed(0)}% del total</p>
                  </div>
                </div>

                {/* Calendar and Period Selector */}
                <div className="mb-6 flex items-center gap-3 flex-wrap">
                  <div className="relative">
                    <button
                      onClick={() => setShowCalendar(!showCalendar)}
                      className="px-4 py-2 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary/90 transition flex items-center gap-2 cursor-pointer"
                    >
                      <span className="opacity-80">📅</span> {selectedDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
                    </button>
                    {showCalendar && WeekPickerCalendar()}
                  </div>

                  <button
                    onClick={() => {
                      const d = new Date(selectedDate);
                      if (periodGranularity === 'day') d.setDate(d.getDate() - 1);
                      else if (periodGranularity === 'week') d.setDate(d.getDate() - 7);
                      else if (periodGranularity === 'month') d.setMonth(d.getMonth() - 1);
                      else d.setFullYear(d.getFullYear() - 1);
                      setSelectedDate(d);
                    }}
                    className="p-2 hover:bg-surface-container-high rounded-lg transition cursor-pointer border border-on-surface/10"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => {
                      const d = new Date(selectedDate);
                      if (periodGranularity === 'day') d.setDate(d.getDate() + 1);
                      else if (periodGranularity === 'week') d.setDate(d.getDate() + 7);
                      else if (periodGranularity === 'month') d.setMonth(d.getMonth() + 1);
                      else d.setFullYear(d.getFullYear() + 1);
                      setSelectedDate(d);
                    }}
                    className="p-2 hover:bg-surface-container-high rounded-lg transition cursor-pointer border border-on-surface/10"
                  >
                    <ChevronRight size={16} />
                  </button>

                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-on-surface/10 bg-surface-container-high/30">
                        <th className="text-left py-4 px-4 font-bold text-on-surface/80">#</th>
                        <th className="text-left py-4 px-4 font-bold text-on-surface/80">Concepto</th>
                        <th className="text-left py-4 px-4 font-bold text-on-surface/60">Categoría</th>
                        <th className="text-left py-4 px-4 font-bold text-on-surface/60">Descripción</th>
                        <th className="text-center py-4 px-4 font-bold text-on-surface/60">Tipo</th>
                        <th className="text-right py-4 px-4 font-bold text-on-surface/60">Monto</th>
                        <th className="text-right py-4 px-4 font-bold text-on-surface/60">% Total</th>
                        <th className="text-left py-4 px-4 font-bold text-on-surface/60">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenseTransactions.length === 0 ? (
                        <tr><td colSpan={8} className="py-8 px-4 text-center text-on-surface/50">Sin egresos registrados</td></tr>
                      ) : (
                        Object.entries(grouped).map((groupEntry, groupIdx) => {
                          const [groupLabel, groupTransactions] = groupEntry;
                          const groupTotal = groupTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
                          let rowNum = groupIdx > 0 ? Object.values(grouped).slice(0, groupIdx).reduce((sum, arr) => sum + arr.length, 0) + 1 : 1;

                          return (
                            <React.Fragment key={groupLabel}>
                              <tr className="bg-surface-container-high/20 border-b border-on-surface/10">
                                <td colSpan={8} className="py-3 px-4 font-bold text-on-surface/80 text-sm">
                                  {groupLabel}
                                </td>
                              </tr>
                              {groupTransactions.map((t, idx) => {
                                const percentage = totalExpenses > 0 ? ((Math.abs(t.amount) / totalExpenses) * 100).toFixed(1) : 0;
                                return (
                                  <motion.tr
                                    key={`${groupLabel}-${idx}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="border-b border-on-surface/5 hover:bg-surface-container-highest/50"
                                  >
                                    <td className="py-4 px-4 text-on-surface/50 font-bold">{rowNum++}</td>
                                    <td className="py-4 px-4 font-semibold text-on-surface">{t.title}</td>
                                    <td className="py-4 px-4 text-on-surface/70 text-xs font-medium">{t.category || '—'}</td>
                                    <td className="py-4 px-4 text-on-surface/60 text-xs">{t.description}</td>
                                    <td className="py-4 px-4 text-center"><span className={`text-xs font-bold px-2 py-1 rounded ${t.isFixed ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}`}>{t.isFixed ? 'Fijo' : 'Var'}</span></td>
                                    <td className="py-4 px-4 text-right font-bold text-primary">-{formatCurrency(Math.abs(t.amount))}</td>
                                    <td className="py-4 px-4 text-right text-on-surface/70 font-semibold">{percentage}%</td>
                                    <td className="py-4 px-4 text-on-surface/60 text-xs">{new Date(t.date).toLocaleDateString('es-MX')}</td>
                                  </motion.tr>
                                );
                              })}
                              <tr className="bg-surface-container-highest/20 border-b-2 border-on-surface/20">
                                <td colSpan={5} className="py-3 px-4 font-bold text-on-surface text-xs">Egresos de {groupLabel.toLowerCase()}</td>
                                <td className="py-3 px-4 text-right font-bold text-primary">{formatCurrency(groupTotal)}</td>
                                <td colSpan={2}></td>
                              </tr>
                            </React.Fragment>
                          );
                        })
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-on-surface/20 bg-surface-container-highest/30">
                        <td colSpan={5} className="py-4 px-4 font-black text-on-surface">TOTAL EGRESOS</td>
                        <td className="py-4 px-4 text-right font-black text-primary">{formatCurrency(totalExpenses)}</td>
                        <td className="py-4 px-4 text-right font-black text-on-surface">100%</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {activeTab === 'costs' && (
        <div>
          {/* Search Filter */}
          <input
            type="text"
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange?.(e.target.value)}
            placeholder="🔍 Buscar categoría..."
            className="mb-6 px-4 py-3 rounded-lg bg-surface-container-low border border-on-surface/10 text-sm w-full max-w-xs outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
          />

          {/* Detailed Table */}
          <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-on-surface/10">
              <th className="text-left py-4 px-4 font-bold text-on-surface/80">Categoría</th>
              <th className="text-right py-4 px-4 font-bold text-on-surface/60">Presupuesto</th>
              <th className="text-right py-4 px-4 font-bold text-on-surface/60">Realizado</th>
              <th className="text-right py-4 px-4 font-bold text-on-surface/60">Diferencia</th>
              <th className="text-right py-4 px-4 font-bold text-on-surface/60">% Var.</th>
              <th className="text-center py-4 px-4 font-bold text-on-surface/60">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map((cat, idx) => {
              const actual = actualByCategory[cat.name] || 0;
              const diff = actual - cat.budgetMonthly;
              const diffPercent = cat.budgetMonthly > 0 ? ((diff / cat.budgetMonthly) * 100).toFixed(0) : 0;
              const status = actual === 0 ? 'Sin movimiento' : diff > cat.budgetMonthly * 0.1 ? '⚠️ Sobre presupuesto' : diff < 0 ? '✓ Bajo presupuesto' : '✓ En línea';
              const statusColor = actual === 0 ? 'bg-on-surface/10 text-on-surface/50' : diff > cat.budgetMonthly * 0.1 ? 'bg-primary/20 text-primary' : diff < 0 ? 'bg-secondary/20 text-secondary' : 'bg-green-200/50 text-green-700';

              return (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b border-on-surface/5 hover:bg-surface-container-highest/50 transition-colors"
                >
                  <td className="py-4 px-4 font-semibold text-on-surface">
                    <span className="mr-2">{cat.icon}</span>
                    {cat.name}
                  </td>
                  <td className="py-4 px-4 text-right text-on-surface/70">{formatCurrency(cat.budgetMonthly)}</td>
                  <td className="py-4 px-4 text-right font-semibold text-on-surface">
                    {actual > 0 ? formatCurrency(actual) : '—'}
                  </td>
                  <td className={`py-4 px-4 text-right font-bold ${diff > 0 ? 'text-primary' : diff < 0 ? 'text-secondary' : 'text-on-surface/40'}`}>
                    {actual > 0 ? (diff > 0 ? '+' : '') + formatCurrency(diff) : '—'}
                  </td>
                  <td className={`py-4 px-4 text-right font-bold ${diff > 0 ? 'text-primary' : diff < 0 ? 'text-secondary' : 'text-on-surface/40'}`}>
                    {actual > 0 ? (diff > 0 ? '+' : '') + diffPercent + '%' : '—'}
                  </td>
                  <td className={`py-4 px-4 text-center text-xs font-bold px-2 py-1 rounded ${statusColor}`}>
                    {status}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-on-surface/20 bg-surface-container-highest/30">
              <td className="py-4 px-4 font-black text-on-surface">TOTAL</td>
              <td className="py-4 px-4 text-right font-black text-on-surface">{formatCurrency(totalBudgetMonthly)}</td>
              <td className="py-4 px-4 text-right font-black text-on-surface">{formatCurrency(totalActual)}</td>
              <td className={`py-4 px-4 text-right font-black ${variance > 0 ? 'text-primary' : variance < 0 ? 'text-secondary' : 'text-on-surface'}`}>
                {variance > 0 ? '+' : ''}{formatCurrency(variance)}
              </td>
              <td className={`py-4 px-4 text-right font-black ${variance > 0 ? 'text-primary' : variance < 0 ? 'text-secondary' : 'text-on-surface'}`}>
                {variance > 0 ? '+' : ''}{variancePercent}%
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
          </div>

          {/* Insight */}
          <div className="mt-6 bg-primary/5 rounded-xl p-4 border border-primary/10">
            <p className="text-sm text-on-surface/70">
              💡 <strong>Análisis:</strong>{' '}
              {totalActual === 0
                ? 'Registra gastos para ver cómo se comparan contra el presupuesto.'
                : variance > 0
                ? `Gastas ${formatCurrency(Math.abs(variance))} más que lo presupuestado. Revisa qué categorías exceden.`
                : `¡Excelente! Vas ${formatCurrency(Math.abs(variance))} bajo presupuesto este mes.`}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

interface ListItem {
  id: number;
  label: string;
  category: string;
  amount: string;
}

function FinancialList({ title, items, type }: { title: string; items: ListItem[]; type: "income" | "expense" }) {
  const isIncome = type === "income";
  const Icon = isIncome ? Download : Upload;
  const accentColor = isIncome ? "text-secondary" : "text-primary";
  const bgColor = isIncome ? "bg-secondary-container text-secondary" : "bg-primary-fixed text-primary";
  const containerBg = isIncome ? "bg-secondary-container" : "bg-primary-fixed";

  return (
    <div className="flex-1">
      <div className="flex items-center gap-3 mb-8">
        <div className={`w-10 h-10 rounded-full ${containerBg} flex items-center justify-center ${accentColor}`}>
          <Icon size={20} />
        </div>
        <h3 className="font-headline font-bold text-xl text-on-surface/90">{title}</h3>
      </div>

      <div className="space-y-4">
        {items.length === 0 && (
          <p className="text-sm text-on-surface/40 italic px-2">Sin registros aún.</p>
        )}
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: isIncome ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-5 bg-surface-container-lowest rounded-2xl group hover:shadow-md transition-all border border-surface-container-high/10"
          >
            <div className="flex items-center gap-4">
              <span className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center font-bold text-xs`}>
                {index + 1}
              </span>
              <div>
                <p className="font-bold text-on-surface">{item.label}</p>
                <p className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider opacity-60">
                  {item.category}
                </p>
              </div>
            </div>
            <span className={`text-xl font-headline font-black ${accentColor}`}>
              {isIncome ? "+" : "-"}{item.amount}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// --- Main Page Component ---

export default function DashboardPage() {
  const { transactions, costCategories, balanceSheetItems } = useFinancials();
  const [categoryFilter, setCategoryFilter] = useState('');
  const filteredTransactions = transactions;

  // Calculate totals
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const fne = totalIncome - totalExpense;

  // Calculate fixed vs variable
  const fixedCosts = filteredTransactions
    .filter(t => t.type === 'expense' && t.isFixed)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const variableCosts = filteredTransactions
    .filter(t => t.type === 'expense' && !t.isFixed)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Top 3 incomes
  const topIncomes = filteredTransactions
    .filter(t => t.type === 'income')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3)
    .map((t, idx) => ({
      id: idx,
      label: t.title,
      category: t.description,
      amount: t.amount.toLocaleString('es-MX', { maximumFractionDigits: 0 })
    }));

  // Top 3 expenses
  const topExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
    .slice(0, 3)
    .map((t, idx) => ({
      id: idx,
      label: t.title,
      category: `${t.description}${t.isFixed ? ' (Fijo)' : ' (Variable)'}`,
      amount: Math.abs(t.amount).toLocaleString('es-MX', { maximumFractionDigits: 0 })
    }));

  const fallbackIncomes = topIncomes;
  const fallbackExpenses = topExpenses;

  const burnRate = fixedCosts;
  const survival = totalIncome > 0 && burnRate > 0 ? (fne / burnRate).toFixed(1) : '—';

  return (
    <div className="pb-12 max-w-7xl mx-auto space-y-12">
      {/* Header Section */}
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-on-surface mb-2">
          Salud Financiera
        </h1>
        <p className="text-on-surface-variant font-medium opacity-70">
          Estado actual de la caja y proyecciones de supervivencia de Atelier Central.
        </p>
      </motion.section>

      {/* Top Row: Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard
          title="Caja Fuerte (FNE Actual)"
          value={Math.abs(fne).toLocaleString('es-MX', { maximumFractionDigits: 0 })}
          unit="MXN"
          subtitle="Ingresos - Egresos del mes"
          footerIcon={TrendingUp}
          footerText={fne > 0 ? "Flujo positivo" : fne < 0 ? "⚠️ Negativo" : "Sin movimiento"}
          icon={Wallet}
          variant={fne > 0 ? "secondary" : "primary"}
        />
        <StatCard
          title="Colchón de Vida"
          value={survival}
          unit="Meses"
          subtitle="Tiempo de operación garantizado sin ventas"
          footerIcon={CheckCircle}
          footerText={Number(survival) > 2 ? "Estado: Saludable" : "⚠️ En riesgo"}
          icon={ShieldCheck}
          variant={Number(survival) > 2 ? "tertiary" : "primary"}
        />
        <StatCard
          title="Velocidad de Gasto (Burn Rate)"
          value={burnRate.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
          unit="/mes"
          subtitle="Promedio de costos fijos"
          footerIcon={Info}
          footerText="Costos que siempre se pagan"
          icon={Gauge}
          variant="primary"
        />
      </section>

      {/* Middle Section: Cost Comparison */}
      <CostComparison transactions={filteredTransactions} costCategories={costCategories} balanceSheetItems={balanceSheetItems} categoryFilter={categoryFilter} onCategoryFilterChange={setCategoryFilter} />

      {/* Bottom Section: Lists */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <FinancialList
          title="Top 3 Entradas de Efectivo"
          items={fallbackIncomes}
          type="income"
        />
        <FinancialList
          title="Top 3 Fugas de Efectivo"
          items={fallbackExpenses}
          type="expense"
        />
      </section>

      {/* Artistic Visual Accent */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="mt-24 rounded-2xl overflow-hidden h-72 relative shadow-2xl flex items-center justify-center bg-primary"
      >
        <img 
          className="absolute w-full h-full object-cover mix-blend-overlay opacity-50" 
          alt="High-end florist workplace"
          src="https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=2774&auto=format&fit=crop"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent flex items-end p-10">
          <blockquote className="text-white max-w-lg">
            <p className="font-headline font-bold text-3xl leading-tight">
              "Donde las flores crecen, la prosperidad florece."
            </p>
            <footer className="text-xs font-bold opacity-80 uppercase tracking-[0.3em] mt-4">
              — Registro Botánico
            </footer>
          </blockquote>
        </div>
      </motion.section>
    </div>
  );
}
