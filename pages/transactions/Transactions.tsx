import React, { useState } from 'react';
import { useData, Transaction } from '../../lib/dataContext';
import { FilterIcon, TrashIcon, TrendingUpIcon } from '../../components/ui/Icons';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

export const Transactions = () => {
  const { transactions, deleteTransaction, loading } = useData();
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  // Group by date logic
  const grouped = filteredTransactions.reduce((groups, transaction) => {
    // Safety check for date in case of bad data
    if (!transaction.date) return groups;
    
    const dateStr = transaction.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  if (loading) {
      return <div className="p-6 text-center text-slate-400 dark:text-slate-500">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 transition-colors">
      <header className="bg-white dark:bg-slate-900 px-6 py-4 shadow-sm sticky top-0 z-30 transition-colors border-b border-slate-100 dark:border-slate-800">
         <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Transactions</h1>
         
         {/* Filters */}
         <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            <button 
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterType === 'all' ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
            >
              Tout
            </button>
            <button 
              onClick={() => setFilterType('expense')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterType === 'expense' ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
            >
              Dépenses
            </button>
            <button 
              onClick={() => setFilterType('income')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterType === 'income' ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
            >
              Revenus
            </button>
         </div>
      </header>

      <main className="px-4 py-6">
        {Object.keys(grouped).length === 0 ? (
          <div className="text-center mt-20">
             <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                <FilterIcon className="text-slate-400" />
             </div>
             <p className="text-slate-500 dark:text-slate-400">Aucune transaction trouvée.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, items]) => (
            <div key={date} className="mb-6 animate-in fade-in duration-500">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 ml-2">{date}</h3>
              <div className="space-y-3">
                {items.map(t => (
                  <div 
                    key={t.id} 
                    onClick={() => setSelectedTransaction(t)}
                    className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex justify-between items-center active:bg-slate-50 dark:active:bg-slate-800 cursor-pointer transition-colors"
                  >
                     <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg ${t.type === 'income' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                          {t.category === 'Alimentation' ? '🍔' : 
                           t.category === 'Transport' ? '🚗' : 
                           t.category === 'Loisirs' ? '🍿' : 
                           t.category === 'Salaire' ? '💰' : '📄'}
                       </div>
                       <div className="min-w-0">
                         <p className="font-semibold text-slate-900 dark:text-white truncate">{t.title}</p>
                         <p className="text-xs text-slate-500 dark:text-slate-400">{t.category}</p>
                       </div>
                     </div>
                     <span className={`font-bold whitespace-nowrap ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-white'}`}>
                       {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()} €
                     </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>

      {/* Transaction Detail/Action Modal */}
      <Modal 
        isOpen={!!selectedTransaction} 
        onClose={() => setSelectedTransaction(null)} 
        title="Détails"
      >
        {selectedTransaction && (
          <div className="space-y-6">
             <div className="text-center py-6">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${selectedTransaction.type === 'income' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                   <TrendingUpIcon className={`w-8 h-8 ${selectedTransaction.type === 'expense' && 'rotate-180'}`} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {selectedTransaction.type === 'expense' && '-'}
                  {selectedTransaction.amount} €
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{selectedTransaction.title}</p>
             </div>

             <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                   <p className="text-slate-500 dark:text-slate-400 mb-1">Catégorie</p>
                   <p className="font-semibold text-slate-900 dark:text-white">{selectedTransaction.category}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                   <p className="text-slate-500 dark:text-slate-400 mb-1">Date</p>
                   <p className="font-semibold text-slate-900 dark:text-white">{selectedTransaction.date.toLocaleDateString()}</p>
                </div>
             </div>

             <div className="pt-4 flex gap-3">
                <Button 
                   variant="outline" 
                   className="border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:border-red-900/50 hover:border-red-300"
                   onClick={() => {
                     deleteTransaction(selectedTransaction.id);
                     setSelectedTransaction(null);
                   }}
                >
                   <TrashIcon className="w-5 h-5 mr-2" /> Supprimer
                </Button>
                <Button onClick={() => setSelectedTransaction(null)}>Fermer</Button>
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
};