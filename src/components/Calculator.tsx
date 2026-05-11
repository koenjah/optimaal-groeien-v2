import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface CalculatorProps {
  onCalculate?: (yearlyExtra: number) => void;
}

export const OmzetCalculator: React.FC<CalculatorProps> = ({ onCalculate }) => {
  const [orderValue, setOrderValue] = useState<string>('15000');
  const [closingRatio, setClosingRatio] = useState<string>('25');
  const [leadsPerMonth, setLeadsPerMonth] = useState<string>('8');
  const [branch, setBranch] = useState<string>('Maakindustrie');
  const [result, setResult] = useState<{
    currentMonthly: number;
    potentialMonthly: number;
    extraMonthly: number;
    extraYearly: number;
  } | null>(null);

  const calculate = () => {
    const val = parseFloat(orderValue) || 0;
    const ratio = parseFloat(closingRatio) || 0;
    const leads = parseFloat(leadsPerMonth) || 0;

    const currentMonthly = leads * (ratio / 100) * val;
    const potentialMonthly = currentMonthly * 1.30;
    const extraMonthly = potentialMonthly - currentMonthly;
    const extraYearly = extraMonthly * 12;

    setResult({
      currentMonthly,
      potentialMonthly,
      extraMonthly,
      extraYearly
    });

    if (onCalculate) {
      onCalculate(extraYearly);
    }
  };

  const formatEuro = (val: number) => {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div id="tool" className="bg-white p-8 lg:p-10 rounded-3xl shadow-3xl border border-slate-100 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-accent/10" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em]">Module: Growth_Calc_v4</div>
          <div className="flex gap-1">
             <div className="w-1 h-1 rounded-full bg-slate-200" />
             <div className="w-1 h-1 rounded-full bg-slate-200" />
             <div className="w-1 h-1 rounded-full bg-brand-accent/40" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="space-y-1.5">
            <label htmlFor="calc-ordervalue" className="text-[9px] font-display font-bold text-slate-600 uppercase tracking-widest">Orderwaarde</label>
            <div className="relative">
               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs">€</span>
               <input
                id="calc-ordervalue"
                type="number"
                value={orderValue}
                onChange={(e) => setOrderValue(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 p-3 pl-8 rounded-xl text-sm text-brand-primary font-bold focus:outline-none focus:border-brand-accent transition-all"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="calc-conversie" className="text-[9px] font-display font-bold text-slate-600 uppercase tracking-widest">Conversie (%)</label>
            <input
              id="calc-conversie"
              type="number"
              value={closingRatio}
              onChange={(e) => setClosingRatio(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm text-brand-primary font-bold focus:outline-none focus:border-brand-accent transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="calc-leads" className="text-[9px] font-display font-bold text-slate-600 uppercase tracking-widest">Leads / mnd</label>
            <input
              id="calc-leads"
              type="number"
              value={leadsPerMonth}
              onChange={(e) => setLeadsPerMonth(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm text-brand-primary font-bold focus:outline-none focus:border-brand-accent transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="calc-type" className="text-[9px] font-display font-bold text-slate-600 uppercase tracking-widest">Type</label>
            <select
              id="calc-type"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm text-brand-primary font-bold focus:outline-none focus:border-brand-accent transition-all appearance-none outline-none"
            >
              <option value="Maakindustrie">Maakindustrie</option>
              <option value="Logistiek">Logistiek</option>
              <option value="Bouw">Bouw</option>
              <option value="Engineering">Engineering</option>
            </select>
          </div>
        </div>

        <button 
          onClick={calculate}
          className="w-full bg-brand-primary text-white py-4 rounded-xl font-display font-bold text-sm shadow-xl shadow-brand-primary/10 hover:bg-brand-accent transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          Analyseer potentieel <ArrowRight size={16} />
        </button>

        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 pt-8 border-t border-slate-50"
            >
              <div className="flex justify-between items-end mb-6">
                 <div>
                    <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-1">Jaarlijkse Groei</div>
                    <div className="text-3xl font-display font-black text-brand-primary tracking-tighter">{formatEuro(result.extraYearly)}</div>
                 </div>
                 <div className="text-right">
                    <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-1">Maand Extra</div>
                    <div className="text-lg font-display font-bold text-brand-accent">{formatEuro(result.extraMonthly)}</div>
                 </div>
              </div>
              
              <div className="p-4 bg-brand-soft rounded-2xl border border-white">
                 <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                    * Gebaseerd op gemiddelde sector-data voor <span className="text-brand-primary font-bold">{branch}</span>.
                 </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
