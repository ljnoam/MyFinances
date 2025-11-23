import React, { useState, useMemo } from 'react';
import { useData } from '../../lib/dataContext';
import { BarChart, DonutChart } from '../../components/ui/Charts';
import { ChevronDownIcon, CalendarIcon } from '../../components/ui/Icons';

export const Stats = () => {
  const { transactions } = useData();
  const [view, setView] = useState<'month' | 'year'>('month');

  // Filter Logic
  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  // Calculate Total Expense for the View
  const totalExpense = useMemo(() => {
      // In a real app, you would filter by the selected Month/Year
      // Here we simulate by taking latest transactions for 'month' view
      const slice = view === 'month' ? expenseTransactions.slice(0, 30) : expenseTransactions;
      return slice.reduce((acc, t) => acc + t.amount, 0);
  }, [view, expenseTransactions]);

  // Bar Data (Mock logic kept simple but styled)
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28 relative font-sans">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/20 pointer-events-none"></div>

      <header className="px-6 pt-6 pb-2 sticky top-0 z-30 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-lg">
        <div className="flex justify-between items-center mb-6">
             <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Analyses</h1>
             <div className="flex bg-slate-200/50 dark:bg-slate-800 p-1 rounded-xl">
               <button 
                 onClick={() => setView('month')}
                 className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all shadow-sm ${view === 'month' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 shadow-none bg-transparent'}`}
               >
                 Mois
               </button>
               <button 
                 onClick={() => setView('year')}
                 className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all shadow-sm ${view === 'year' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 shadow-none bg-transparent'}`}
               >
                 Année
               </button>
            </div>
        </div>

        {/* Total Summary Card */}
        <div className="bg-slate-900 dark:bg-indigo-600 rounded-[2rem] p-6 text-white shadow-xl shadow-slate-200/50 dark:shadow-black/20 relative overflow-hidden mb-2">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 opacity-80">
                    <CalendarIcon className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">
                        {view === 'month' ? 'Ce mois-ci' : 'Cette année'}
                    </span>
                </div>
                <h2 className="text-4xl font-bold tracking-tight mb-1">
                    {totalExpense.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €
                </h2>
                <p className="text-sm opacity-60 font-medium">Total des dépenses</p>
            </div>
        </div>
      </header>

      <main className="px-5 py-4 space-y-6">

        {/* Charts Container */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
           <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    Activité
                </h3>
           </div>
           <div className="mt-2">
              <BarChart data={barData} height={200} />
           </div>
        </div>

        {/* Breakdown Container */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
           <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                Répartition
           </h3>
           
           {sortedCategories.length > 0 ? (
               <div className="flex flex-col gap-8">
                  {/* Donut centered */}
                  <div className="flex justify-center py-4">
                      <DonutChart data={sortedCategories} />
                  </div>

                  {/* List */}
                  <div className="space-y-5">
                     {sortedCategories.map((c, i) => {
                        const maxVal = Math.max(...sortedCategories.map(s => s.value));
                        const percent = Math.round((c.value / totalExpense) * 100);
                        
                        return (
                        <div key={i} className="group">
                           <div className="flex items-center justify-between mb-2">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold" style={{ backgroundColor: `${c.color}20`, color: c.color }}>
                                    {c.label.substring(0, 1)}
                                  </div>
                                  <div>
                                      <p className="text-sm font-bold text-slate-900 dark:text-white">{c.label}</p>
                                      <p className="text-[10px] text-slate-400 font-medium">{percent}% du total</p>
                                  </div>
                               </div>
                               <span className="text-sm font-bold text-slate-900 dark:text-white">{c.value.toLocaleString()} €</span>
                           </div>
                           {/* Custom Progress Bar */}
                           <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                 <div 
                                    className="h-full rounded-full transition-all duration-1000 ease-out" 
                                    style={{ 
                                        width: `${(c.value / maxVal) * 100}%`, 
                                        backgroundColor: c.color,
                                        boxShadow: `0 0 10px ${c.color}60`
                                    }} 
                                 />
                           </div>
                        </div>
                     )})}
                  </div>
               </div>
           ) : (
             <div className="text-center py-10">
                 <p className="text-slate-400 text-sm">Aucune donnée disponible.</p>
             </div>
           )}
        </div>
      </main>
    </div>
  );
};