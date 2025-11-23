import React, { useState } from 'react';
import { useData } from '../../lib/dataContext';
import { BarChart, DonutChart } from '../../components/ui/Charts';

export const Stats = () => {
  const { transactions } = useData();
  const [view, setView] = useState<'month' | 'year'>('month');

  // Filter Logic (Simplified for Mock)
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  // Bar Data: Last 6 transactions mapped to bars for visual effect
  // In real app, map by month
  const barData = transactions.slice(0, 7).map(t => ({
      label: new Date(t.date).getDate().toString(),
      value: t.amount
  })).reverse();

  // Category Breakdown
  const expensesByCategory = expenseTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .map(([label, value], i) => ({
      label, 
      value,
      color: ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'][i % 5] || '#cbd5e1'
    }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 transition-colors">
      <header className="bg-white dark:bg-slate-900 px-6 py-4 shadow-sm transition-colors border-b border-slate-100 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analyses</h1>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Toggle Month/Year */}
        <div className="bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex transition-colors">
           <button 
             onClick={() => setView('month')}
             className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${view === 'month' ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400'}`}
           >
             Mensuel
           </button>
           <button 
             onClick={() => setView('year')}
             className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${view === 'year' ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400'}`}
           >
             Annuel
           </button>
        </div>

        {/* Bar Chart Overview */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
           <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-6 uppercase tracking-wider">Flux de trésorerie</h3>
           <BarChart data={barData} height={180} />
        </div>

        {/* Top Expenses */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
           <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-6 uppercase tracking-wider">Top Catégories</h3>
           {sortedCategories.length > 0 ? (
               <div className="flex flex-col md:flex-row items-center gap-8">
                  <DonutChart data={sortedCategories} />
                  <div className="w-full space-y-4">
                     {sortedCategories.map((c, i) => (
                        <div key={i} className="flex items-center justify-between">
                           <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: c.color }} />
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{c.label}</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900 dark:text-white">{c.value.toLocaleString()}€</span>
                              <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                 <div className="h-full rounded-full" style={{ width: `${(c.value / Math.max(...sortedCategories.map(s => s.value))) * 100}%`, backgroundColor: c.color }} />
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
           ) : (
             <p className="text-center text-slate-400 py-8">Aucune donnée pour cette période</p>
           )}
        </div>
      </main>
    </div>
  );
};