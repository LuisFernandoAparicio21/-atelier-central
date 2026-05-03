import { useState, useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';
import type { TransactionType, Transaction, FlowActivity } from '../1_domain/Transaction';

/* ─── Drawer Configuration per Action Type ─── */

interface ChipOption {
  label: string;
  value: string;
  effect: '+' | '-';
}

interface DrawerVariant {
  title: string;
  subtitle: string;
  colorClass: string;
  bgClass: string;
  accentBorder: string;
  chipLabel: string;
  chips: ChipOption[];
  extraFields: ExtraField[];
  flowActivity: FlowActivity;
}

interface ExtraField {
  name: string;
  label: string;
  placeholder: string;
  required: boolean;
  type?: 'text' | 'select';
  options?: string[];
}

const DRAWER_VARIANTS: Record<TransactionType, DrawerVariant> = {
  income: {
    title: 'Entró Dinero',
    subtitle: 'Registrar ingreso operativo',
    colorClass: 'text-secondary',
    bgClass: 'bg-secondary-container',
    accentBorder: 'border-secondary',
    chipLabel: 'Origen',
    chips: [
      { label: 'Mostrador', value: 'mostrador', effect: '+' },
      { label: 'WhatsApp', value: 'whatsapp', effect: '+' },
      { label: 'Eventos', value: 'eventos', effect: '+' },
    ],
    extraFields: [
      {
        name: 'paymentMethod',
        label: 'Método de Pago',
        placeholder: '',
        required: true,
        type: 'select',
        options: ['Efectivo', 'Tarjeta', 'Transferencia'],
      },
      {
        name: 'note',
        label: 'Nota',
        placeholder: 'Ej. Ramo de rosas rojas...',
        required: false,
      },
    ],
    flowActivity: 'operativa',
  },
  expense: {
    title: 'Salió Dinero',
    subtitle: 'Registrar gasto operativo',
    colorClass: 'text-primary',
    bgClass: 'bg-primary-fixed',
    accentBorder: 'border-primary',
    chipLabel: 'Categoría',
    chips: [
      { label: 'Surtir Flor', value: 'flor', effect: '-' },
      { label: 'Sueldos', value: 'sueldos', effect: '-' },
      { label: 'Servicios', value: 'servicios', effect: '-' },
      { label: 'Mermas', value: 'mermas', effect: '-' },
    ],
    extraFields: [
      {
        name: 'note',
        label: 'Nota explicativa',
        placeholder: 'Ej. Pago de luz del mes...',
        required: false,
      },
    ],
    flowActivity: 'operativa',
  },
  investment: {
    title: 'Equipos y Mobiliario',
    subtitle: 'Activos fijos del negocio',
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-100',
    accentBorder: 'border-blue-500',
    chipLabel: 'Acción',
    chips: [
      { label: 'Compré Equipo', value: 'compra', effect: '-' },
      { label: 'Vendí Equipo', value: 'venta', effect: '+' },
    ],
    extraFields: [
      {
        name: 'entity',
        label: 'Descripción del Activo',
        placeholder: 'Ej. Vitrina exhibidora nueva...',
        required: true,
      },
    ],
    flowActivity: 'inversion',
  },
  financing: {
    title: 'Préstamos / Aportes',
    subtitle: 'Financiación del negocio',
    colorClass: 'text-yellow-700',
    bgClass: 'bg-yellow-100',
    accentBorder: 'border-yellow-500',
    chipLabel: 'Acción',
    chips: [
      { label: 'Recibí Préstamo/Capital', value: 'recibido', effect: '+' },
      { label: 'Pagué Deuda', value: 'pago', effect: '-' },
    ],
    extraFields: [
      {
        name: 'entity',
        label: 'Entidad',
        placeholder: 'Ej. Banco, socio, familiar...',
        required: true,
      },
    ],
    flowActivity: 'financiacion',
  },
};

const iconForChip: Record<string, string> = {
  mostrador: 'store',
  whatsapp: 'chat',
  eventos: 'flower',
  flor: 'flower',
  sueldos: 'card',
  servicios: 'wrench',
  mermas: 'truck',
  compra: 'wrench',
  venta: 'store',
  recibido: 'bank',
  pago: 'bank',
};

/* ─── Props ─── */

interface DrawerProps {
  isOpen: boolean;
  type: TransactionType;
  onClose: () => void;
  onSubmit: (tx: Omit<Transaction, 'id'>) => void;
}

/* ─── Component ─── */

export default function Drawer({ isOpen, type, onClose, onSubmit }: DrawerProps) {
  const variant = DRAWER_VARIANTS[type];
  const [selectedChip, setSelectedChip] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [extraValues, setExtraValues] = useState<Record<string, string>>({});
  const [isFixed, setIsFixed] = useState(false);
  const [closing, setClosing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const amountRef = useRef<HTMLInputElement>(null);

  // Reset state when drawer opens
  useEffect(() => {
    if (isOpen) {
      setSelectedChip('');
      setAmount('');
      setExtraValues({});
      setIsFixed(false);
      setClosing(false);
      setSubmitted(false);
      // Auto-focus amount field with a small delay for animation
      setTimeout(() => amountRef.current?.focus(), 400);
    }
  }, [isOpen, type]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 250);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    // Only allow one decimal point
    const parts = val.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setAmount(val);
  };

  const isValid = () => {
    if (!selectedChip) return false;
    if (!amount || parseFloat(amount) <= 0) return false;
    for (const field of variant.extraFields) {
      if (field.required && !extraValues[field.name]?.trim()) return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!isValid()) return;

    const chipConfig = variant.chips.find(c => c.value === selectedChip);
    if (!chipConfig) return;

    const numAmount = parseFloat(amount);
    const signedAmount = chipConfig.effect === '+' ? numAmount : -numAmount;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();

    const tx: Omit<Transaction, 'id'> = {
      title: chipConfig.label,
      description: variant.title,
      amount: signedAmount,
      type,
      flowActivity: variant.flowActivity,
      category: variant.title,
      subcategory: chipConfig.value,
      time: timeStr,
      date: now,
      icon: iconForChip[chipConfig.value] || 'store',
      note: extraValues['note'] || undefined,
      paymentMethod: extraValues['paymentMethod'] || undefined,
      entity: extraValues['entity'] || undefined,
      ...(type === 'expense' && { isFixed }),
    };

    setSubmitted(true);
    setTimeout(() => {
      onSubmit(tx);
      handleClose();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/30 z-50 drawer-overlay"
        onClick={handleClose}
      />
      
      {/* Panel */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-surface z-50 shadow-2xl flex flex-col drawer-panel ${closing ? 'closing' : ''}`}>
        {/* Header */}
        <div className={`p-6 ${variant.bgClass} relative overflow-hidden`}>
          <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-white/50 to-transparent" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-black font-headline ${variant.colorClass}`}>{variant.title}</h2>
              <p className="text-sm opacity-70 mt-1">{variant.subtitle}</p>
            </div>
            <button 
              onClick={handleClose}
              className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center hover:bg-white/80 transition-colors cursor-pointer"
            >
              <X size={20} className={variant.colorClass} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Chip Selector */}
          <div>
            <label className="text-sm font-bold text-on-surface/60 uppercase tracking-widest block mb-3">{variant.chipLabel}</label>
            <div className="flex flex-wrap gap-3">
              {variant.chips.map(chip => (
                <button
                  key={chip.value}
                  onClick={() => setSelectedChip(chip.value)}
                  className={`chip px-5 py-3 rounded-full text-sm font-bold transition-all cursor-pointer ${
                    selectedChip === chip.value
                      ? `${variant.bgClass} ${variant.colorClass} selected ring-2 ${variant.accentBorder}`
                      : 'bg-surface-container-high text-on-surface/60 hover:bg-surface-container-highest'
                  }`}
                >
                  {chip.label}
                  <span className="ml-1 opacity-50 text-xs">[{chip.effect}]</span>
                </button>
              ))}
            </div>
          </div>

          {/* Fixed vs Variable Toggle (only for expenses) */}
          {type === 'expense' && (
            <div className="bg-surface-container-low rounded-xl p-4 border border-on-surface/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-on-surface/80">¿Se repite este gasto?</p>
                  <p className="text-xs text-on-surface/50 mt-1">
                    {isFixed
                      ? '✓ Costo fijo (renta, sueldos, servicios...)'
                      : 'Costo variable (flores, embalaje...)'}
                  </p>
                </div>
                <button
                  onClick={() => setIsFixed(!isFixed)}
                  className={`relative w-14 h-8 rounded-full transition-all cursor-pointer ${
                    isFixed ? 'bg-secondary' : 'bg-on-surface/20'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      isFixed ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="text-sm font-bold text-on-surface/60 uppercase tracking-widest block mb-3">Monto</label>
            <div className={`flex items-center border-2 rounded-2xl px-6 py-4 transition-colors ${amount ? variant.accentBorder : 'border-on-surface/10'} bg-surface-container-lowest`}>
              <span className="text-4xl font-black font-headline text-on-surface/30 mr-2">$</span>
              <input
                ref={amountRef}
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                className="amount-input flex-1 text-4xl bg-transparent text-on-surface w-full"
              />
            </div>
          </div>

          {/* Extra Field(s) */}
          {variant.extraFields.map(field => (
            <div key={field.name}>
              <label className="text-sm font-bold text-on-surface/60 uppercase tracking-widest block mb-3">
                {field.label}
                {field.required && <span className="text-primary ml-1">*</span>}
              </label>
              {field.type === 'select' && field.options ? (
                <div className="flex flex-wrap gap-2">
                  {field.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setExtraValues(v => ({ ...v, [field.name]: opt }))}
                      className={`chip px-4 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all ${
                        extraValues[field.name] === opt
                          ? `${variant.bgClass} ${variant.colorClass} ring-2 ${variant.accentBorder}`
                          : 'bg-surface-container-high text-on-surface/60'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  value={extraValues[field.name] || ''}
                  onChange={e => setExtraValues(v => ({ ...v, [field.name]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-on-surface/10 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="p-6 border-t border-on-surface/5">
          <button
            onClick={handleSubmit}
            disabled={!isValid() || submitted}
            className={`w-full py-4 rounded-xl font-bold text-lg font-headline transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              submitted
                ? 'bg-secondary text-white scale-95'
                : isValid()
                  ? 'bg-gradient-to-r from-primary to-primary-container text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95'
                  : 'bg-surface-container-high text-on-surface/30 cursor-not-allowed'
            }`}
          >
            {submitted ? (
              <>
                <Check size={24} className="animate-bounce" />
                <span>¡Registrado!</span>
              </>
            ) : (
              <span>Registrar Movimiento</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
