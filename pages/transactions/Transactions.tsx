import React, { useState } from 'react';
import { useData, Transaction } from '../../lib/dataContext';
import { FilterIcon, TrashIcon, TrendingUpIcon, SearchIcon, CalendarIcon, EditIcon, PlusIcon } from '../../components/ui/Icons';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const Transactions = () => {
  const { transactions, deleteTransaction, loading, categories, addCategory, deleteCategory } = useData();
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Filtering Logic
  const filteredTransactions = transactions.filter(t => {
    const matchesType = filterType === 'all' ? true : t.type === filterType;
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Group by date logic
  const grouped = filteredTransactions.reduce((groups, transaction) => {
    if (!transaction.date) return groups;
    
    // Format: "Aujourd'hui", "Hier", ou "Lundi 12 Oct."
    const date = new Date(transaction.date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateStr = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    
    if (date.toDateString() === today.toDateString()) dateStr = "Aujourd'hui";
    else if (date.toDateString() === yesterday.toDateString()) dateStr = "Hier";

    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  const handleAddCategory = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCategoryName.trim()) return;
      await addCategory(newCategoryName.trim());
      setNewCategoryName('');
  };

  if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28 font-sans relative">
      
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/40 dark:bg-indigo-900/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute top-40 left-0 w-40 h-40 bg-purple-100/40 dark:bg-purple-900/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      {/* Header Sticky */}
      <header className="sticky top-0 z-30 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50 px-6 pt-6 pb-4">
         <div className="flex justify-between items-center mb-4">
             <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Historique</h1>
             <button 
                onClick={() => setIsCategoryModalOpen(true)}
                className="px-3 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
             >
                <EditIcon className="w-4 h-4" />
                Catégories
             </button>
         </div>

         {/* Search & Filter Bar */}
         <div className="space-y-3">
             {/* Search */}
             <div className="relative">
                <input 
                    type="text" 
                    placeholder="Rechercher une transaction..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border-none rounded-2xl shadow-sm text-sm focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 dark:text-white"
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
             </div>

             {/* Filter Pills */}
             <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                {[
                    { id: 'all', label: 'Tout' },
                    { id: 'expense', label: 'Dépenses' },
                    { id: 'income', label: 'Revenus' }
                ].map((f) => (
                    <button 
                    key={f.id}
                    onClick={() => setFilterType(f.id as any)}
                    className={`
                        px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300
                        ${filterType === f.id 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 scale-105' 
                            : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700 hover:bg-slate-50'}
                    `}
                    >
                    {f.label}
                    </button>
                ))}
             </div>
         </div>
      </header>

      <main className="px-5 py-4">
        {Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <FilterIcon className="w-8 h-8 text-slate-300 dark:text-slate-600" />
             </div>
             <p className="text-slate-900 dark:text-white font-medium text-lg">Aucune transaction</p>
             <p className="text-slate-500 text-sm mt-1">Essayez de modifier vos filtres.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, items]) => (
            <div key={date} className="mb-8 last:mb-0 relative group-date">
              <div className="sticky top-[160px] z-10 inline-block mb-3 ml-1">
                  <span className="bg-slate-200/50 dark:bg-slate-800/80 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border border-white/20 dark:border-white/5">
                      {date}
                  </span>
              </div>
              
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden divide-y divide-slate-50 dark:divide-slate-800/50">
                {items.map((t) => (
                  <div 
                    key={t.id} 
                    onClick={() => setSelectedTransaction(t)}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group active:scale-[0.98] duration-200"
                  >
                     <div className="flex items-center gap-4">
                       <div className={`
                            w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm transition-transform group-hover:scale-110 duration-300
                            ${t.type === 'income' 
                                ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 text-green-600' 
                                : 'bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-slate-800 dark:to-slate-700 text-slate-600 dark:text-slate-300'}
                       `}>
                          {t.category.includes('Alimentation') ? '🍔' : 
                           t.category.includes('Transport') ? '🚗' : 
                           t.category.includes('Loisirs') ? '🍿' : 
                           t.category.includes('Santé') ? '💊' :
                           t.category.includes('Shopping') ? '🛍️' :
                           t.category.includes('Salaire') ? '💰' : 
                           t.category.includes('Logement') ? '🏠' : '📄'}
                       </div>
                       <div>
                         <p className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{t.title}</p>
                         <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{t.category}</p>
                       </div>
                     </div>
                     <div className="text-right">
                        <span className={`block font-bold text-sm tracking-tight ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-white'}`}>
                            {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                        </span>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>

      {/* Modern Receipt Modal */}
      <Modal 
        isOpen={!!selectedTransaction} 
        onClose={() => setSelectedTransaction(null)} 
        title=""
      >
        {selectedTransaction && (
          <div className="relative pt-2">
             {/* Receipt Header Style */}
             <div className="flex flex-col items-center pb-8 border-b border-dashed border-slate-300 dark:border-slate-700 relative">
                {/* Visual Notch */}
                <div className="absolute -left-10 -bottom-3 w-6 h-6 bg-slate-500 rounded-full dark:bg-slate-950 opacity-0 md:opacity-0"></div> 
                <div className="absolute -right-10 -bottom-3 w-6 h-6 bg-slate-500 rounded-full dark:bg-slate-950 opacity-0 md:opacity-0"></div>

                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mb-4 shadow-lg ${
                    selectedTransaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-white border border-slate-100 text-slate-700'
                }`}>
                    {selectedTransaction.category.includes('Alimentation') ? '🍔' : 
                     selectedTransaction.category.includes('Transport') ? '🚗' : 
                     selectedTransaction.category.includes('Salaire') ? '💰' : 
                     selectedTransaction.category.includes('Shopping') ? '🛍️' : '📄'}
                </div>
                
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {selectedTransaction.type === 'expense' && '-'}
                  {selectedTransaction.amount.toLocaleString()} €
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">{selectedTransaction.title}</p>
                <div className="mt-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                    {selectedTransaction.type === 'income' ? 'Revenu' : 'Dépense'}
                </div>
             </div>

             {/* Receipt Body */}
             <div className="pt-8 space-y-4">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Catégorie</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{selectedTransaction.category}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Date</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                        {selectedTransaction.date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Heure</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                        {selectedTransaction.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Status</span>
                    <span className="flex items-center gap-1.5 font-semibold text-green-600 dark:text-green-400">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Complété
                    </span>
                 </div>
             </div>

             <div className="pt-8 flex flex-col gap-3">
                <Button 
                   variant="outline" 
                   className="w-full border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/20 py-3.5"
                   onClick={() => {
                     deleteTransaction(selectedTransaction.id);
                     setSelectedTransaction(null);
                   }}
                >
                   <TrashIcon className="w-4 h-4 mr-2" /> Supprimer la transaction
                </Button>
             </div>
          </div>
        )}
      </Modal>

      {/* Manage Categories Modal */}
      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title="Gérer les Catégories">
          <div className="space-y-6 pt-2 h-[60vh] flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {categories.map(cat => (
                      <div key={cat} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                          <span className="font-medium text-slate-900 dark:text-white">{cat}</span>
                          <button 
                            onClick={() => deleteCategory(cat)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            title="Supprimer"
                          >
                              <TrashIcon className="w-4 h-4" />
                          </button>
                      </div>
                  ))}
              </div>

              <form onSubmit={handleAddCategory} className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex gap-2">
                      <Input 
                        placeholder="Nouvelle catégorie..." 
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="mb-0 dark:bg-slate-800 dark:text-white dark:border-slate-700"
                      />
                      <Button type="submit" className="w-auto px-4" disabled={!newCategoryName.trim()}>
                          <PlusIcon className="w-5 h-5" />
                      </Button>
                  </div>
              </form>
          </div>
      </Modal>
    </div>
  );
};