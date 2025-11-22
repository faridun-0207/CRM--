
import React, { useState, useMemo } from 'react';
import { Transaction, Processing, Expense } from '../types';
import { ArrowDown, ArrowUp, Factory, Trash2, Filter, ArrowUpDown, ChevronUp, ChevronDown, Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Translation } from '../translations';

interface TransactionTableProps {
  date: string;
  transactions: Transaction[];
  processing: Processing[];
  expenses: Expense[];
  allMaterials: string[];
  onDelete: (type: 'trans' | 'proc' | 'exp', id: number) => void;
  t: Translation;
  themeColor: string;
}

type SortKey = 'time' | 'type' | 'details' | 'value';
type SortDirection = 'asc' | 'desc';

export const TransactionTable: React.FC<TransactionTableProps> = ({ 
  date, transactions, processing, expenses, allMaterials, onDelete, t, themeColor 
}) => {
  // State for Filtering
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [matFilter, setMatFilter] = useState<string>('all');

  // State for Sorting
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'time',
    direction: 'desc'
  });

  // Merge and Process Data
  const processedData = useMemo(() => {
    // 1. Merge
    let allItems = [
      ...transactions.map(t => ({ ...t, kind: 'trans' as const })),
      ...processing.map(p => ({ ...p, kind: 'proc' as const })),
      ...expenses.map(e => ({ ...e, kind: 'exp' as const }))
    ];

    // 2. Filter
    allItems = allItems.filter(item => {
      // Type Filter
      if (typeFilter !== 'all') {
        if (typeFilter === 'buy' && (item.kind !== 'trans' || (item as Transaction).type !== 'buy')) return false;
        if (typeFilter === 'sell' && (item.kind !== 'trans' || (item as Transaction).type !== 'sell')) return false;
        if (typeFilter === 'proc' && item.kind !== 'proc') return false;
        if (typeFilter === 'exp' && item.kind !== 'exp') return false;
      }

      // Material Filter
      if (matFilter !== 'all') {
        if (item.kind === 'trans') {
          if ((item as Transaction).mat !== matFilter) return false;
        } else if (item.kind === 'proc') {
          const p = item as Processing;
          if (p.from !== matFilter && p.to !== matFilter) return false;
        } else {
          // Hide expenses when specific material is selected
          return false;
        }
      }

      return true;
    });

    // 3. Sort
    return allItems.sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      switch (sortConfig.key) {
        case 'time':
          valA = a.time;
          valB = b.time;
          break;
        case 'type':
          // Custom sort order for types
          const getTypeStr = (i: typeof a) => 
            i.kind === 'proc' ? 'B' : i.kind === 'exp' ? 'D' : (i as Transaction).type === 'buy' ? 'A' : 'C';
          valA = getTypeStr(a);
          valB = getTypeStr(b);
          break;
        case 'details':
          if (a.kind === 'trans') valA = (a as Transaction).mat;
          else if (a.kind === 'proc') valA = (a as Processing).from;
          else valA = (a as Expense).cat;
          
          if (b.kind === 'trans') valB = (b as Transaction).mat;
          else if (b.kind === 'proc') valB = (b as Processing).from;
          else valB = (b as Expense).cat;
          break;
        case 'value':
          // Calculate numeric value for sorting (Expenses are negative, Buys negative, Sales positive)
          const getNumVal = (i: typeof a) => {
            if (i.kind === 'exp') return -(i as Expense).amt;
            if (i.kind === 'trans') {
              const t = i as Transaction;
              return t.type === 'buy' ? -t.total : t.total;
            }
            return 0; // Processing has no monetary value in this table
          };
          valA = getNumVal(a);
          valB = getNumVal(b);
          break;
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [transactions, processing, expenses, typeFilter, matFilter, sortConfig]);

  const handleSort = (key: SortKey) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortConfig.key !== column) return <ArrowUpDown size={14} className="text-slate-300 opacity-0 group-hover:opacity-50" />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp size={14} className={`text-${themeColor}-600`} />
      : <ChevronDown size={14} className={`text-${themeColor}-600`} />;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col max-h-[600px]">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="font-semibold text-slate-700 flex items-center gap-2">
           {t.tableTitle} <span className="text-slate-400 font-normal text-sm">({format(parseISO(date), 'dd.MM.yyyy')})</span>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-2 text-sm">
          <div className="relative">
            <Filter size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={`pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 outline-none focus:border-${themeColor}-500`}
              style={{ colorScheme: 'light' }}
            >
              <option value="all">{t.filterAllTypes}</option>
              <option value="buy">{t.filterBuy}</option>
              <option value="sell">{t.filterSell}</option>
              <option value="proc">{t.filterProc}</option>
              <option value="exp">{t.filterExp}</option>
            </select>
          </div>

          <div className="relative max-w-[150px]">
             <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
             <select 
                value={matFilter}
                onChange={(e) => setMatFilter(e.target.value)}
                className={`pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 outline-none focus:border-${themeColor}-500 w-full truncate`}
                style={{ colorScheme: 'light' }}
              >
                <option value="all">{t.filterAllMats}</option>
                {allMaterials.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto custom-scrollbar flex-1">
        {processedData.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            {t.tableNoData}
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10">
              <tr>
                <th 
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                  onClick={() => handleSort('time')}
                >
                  <div className="flex items-center gap-1">{t.colTime} <SortIcon column="time" /></div>
                </th>
                <th 
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                  onClick={() => handleSort('type')}
                >
                   <div className="flex items-center gap-1">{t.colType} <SortIcon column="type" /></div>
                </th>
                <th 
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                  onClick={() => handleSort('details')}
                >
                   <div className="flex items-center gap-1">{t.colDetails} <SortIcon column="details" /></div>
                </th>
                <th 
                  className="px-4 py-3 text-right cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                  onClick={() => handleSort('value')}
                >
                   <div className="flex items-center justify-end gap-1">{t.colSum} <SortIcon column="value" /></div>
                </th>
                <th className="px-4 py-3 text-right w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedData.map((item) => {
                // Render Logic
                let icon, badgeClass, details, valueClass, valueText, badgeText;
                
                if (item.kind === 'proc') {
                  const p = item as Processing & { kind: 'proc' };
                  icon = <Factory size={16} />;
                  badgeClass = 'bg-amber-100 text-amber-700';
                  badgeText = t.filterProc;
                  details = (
                    <div>
                      <span className="font-medium text-slate-700">{p.from}</span>
                      <span className="text-slate-400 mx-1">→</span>
                      <span className={`font-medium text-${themeColor}-600`}>{p.to}</span>
                      <div className="text-xs text-slate-400">{p.qtyIn}кг → {p.qtyOut}кг</div>
                    </div>
                  );
                  valueClass = 'text-slate-400';
                  valueText = '-';
                } else if (item.kind === 'exp') {
                  const e = item as Expense & { kind: 'exp' };
                  icon = <ArrowDown size={16} />;
                  badgeClass = 'bg-rose-100 text-rose-700';
                  badgeText = t.filterExp;
                  details = (
                    <div>
                      <div className="font-medium text-slate-700">{e.cat}</div>
                      <div className="text-xs text-slate-400">{e.desc}</div>
                    </div>
                  );
                  valueClass = 'text-rose-600 font-semibold';
                  valueText = `-${e.amt.toLocaleString()}`;
                } else {
                  const tr = item as Transaction & { kind: 'trans' };
                  const isBuy = tr.type === 'buy';
                  icon = isBuy ? <ArrowDown size={16} /> : <ArrowUp size={16} />;
                  badgeClass = isBuy ? `bg-${themeColor}-100 text-${themeColor}-700` : 'bg-blue-100 text-blue-700';
                  badgeText = isBuy ? t.filterBuy : t.filterSell;
                  if (tr.method === 'debt') {
                     badgeClass = 'bg-orange-100 text-orange-700';
                     badgeText = t.optDebt.replace('⚠️ ', '');
                  }

                  details = (
                    <div>
                      <div className="font-medium text-slate-700">{tr.mat}</div>
                      <div className="text-xs text-slate-500">{tr.client} {tr.method === 'debt' && '(Не оплачено)'}</div>
                    </div>
                  );
                  valueClass = isBuy ? `text-${themeColor}-600 font-semibold` : 'text-blue-600 font-semibold';
                  valueText = `${isBuy ? '-' : '+'}${tr.total.toLocaleString()}`;
                }

                return (
                  <tr key={`${item.kind}-${item.id}`} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap font-mono text-xs">{item.time}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
                        {icon}
                        {badgeText}
                      </span>
                    </td>
                    <td className="px-4 py-3">{details}</td>
                    <td className={`px-4 py-3 text-right ${valueClass}`}>{valueText}</td>
                    <td className="px-4 py-3 text-right">
                      <button 
                          onClick={() => onDelete(item.kind, item.id)}
                          className="text-slate-300 hover:text-rose-500 transition-colors"
                          title={t.confirmDel}
                      >
                          <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
