
import React from 'react';
import { StockMap } from '../types';
import { Package } from 'lucide-react';
import { Translation } from '../translations';

interface StockBadgesProps {
  stock: StockMap;
  t: Translation;
  themeColor: string;
}

export const StockBadges: React.FC<StockBadgesProps> = ({ stock, t, themeColor }) => {
  // Fix: Cast v to number
  const hasStock = Object.values(stock).some(v => (v as number) > 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6">
      <div className="flex items-center gap-2 mb-3 text-slate-800 font-semibold">
        <Package size={18} className={`text-${themeColor}-600`} />
        <h3>{t.stockTitle}</h3>
      </div>
      
      {!hasStock ? (
        <p className="text-sm text-slate-400">{t.stockEmpty}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {Object.entries(stock).map(([key, val]) => {
            // Fix: Cast val to number
            const value = val as number;
            if (value <= 0) return null;
            return (
              <div key={key} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex flex-col min-w-[100px]">
                <span className="text-xs text-slate-500 uppercase font-semibold truncate max-w-[120px]" title={key}>{key}</span>
                <span className="text-lg font-bold text-slate-800">{value.toFixed(1)} <span className="text-xs font-normal text-slate-400">кг</span></span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};