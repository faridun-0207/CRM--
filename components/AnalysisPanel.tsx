
import React, { useMemo } from 'react';
import { Transaction, Expense } from '../types';
import { Translation } from '../translations';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface AnalysisPanelProps {
  transactions: Transaction[];
  expenses: Expense[];
  t: Translation;
  themeColor: string;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ transactions, expenses, t, themeColor }) => {
  // Stats Logic
  const salesByMat = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.filter(t => t.type === 'sell').forEach(t => {
      map[t.mat] = (map[t.mat] || 0) + t.total;
    });
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const expensesByCat = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => {
      map[e.cat] = (map[e.cat] || 0) + e.amt;
    });
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const maxSale = salesByMat.length > 0 ? salesByMat[0].value : 0;
  const maxExp = expensesByCat.length > 0 ? expensesByCat[0].value : 0;

  return (
    <div className="space-y-6 mb-6">
      {/* Sales Analysis */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-emerald-500" />
          {t.topSales}
        </h3>
        <div className="space-y-3">
          {salesByMat.length === 0 ? <p className="text-slate-400 text-sm">{t.tableNoData}</p> : 
           salesByMat.map(item => (
             <div key={item.name} className="relative">
               <div className="flex justify-between text-sm mb-1">
                 <span className="font-medium text-slate-700">{item.name}</span>
                 <span className="font-bold text-slate-900">{item.value.toLocaleString()} c.</span>
               </div>
               <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                 <div 
                   className={`h-full bg-${themeColor}-500 rounded-full`} 
                   style={{ width: `${(item.value / maxSale) * 100}%` }}
                 ></div>
               </div>
             </div>
           ))}
        </div>
      </div>

      {/* Expense Analysis */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingDown size={20} className="text-rose-500" />
          {t.topExpenses}
        </h3>
        <div className="space-y-3">
          {expensesByCat.length === 0 ? <p className="text-slate-400 text-sm">{t.tableNoData}</p> : 
           expensesByCat.map(item => (
             <div key={item.name} className="relative">
               <div className="flex justify-between text-sm mb-1">
                 <span className="font-medium text-slate-700">{item.name}</span>
                 <span className="font-bold text-slate-900">{item.value.toLocaleString()} c.</span>
               </div>
               <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-rose-400 rounded-full" 
                   style={{ width: `${(item.value / maxExp) * 100}%` }}
                 ></div>
               </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};
