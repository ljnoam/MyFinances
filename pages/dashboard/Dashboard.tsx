import React, { useState } from 'react';
import { useAuth } from '../../lib/authContext';
import { useData, TransactionType, Category } from '../../lib/dataContext';
import { PlusIcon, TrendingUpIcon } from '../../components/ui/Icons';
import { DonutChart } from '../../components/ui/Charts';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { user } = useAuth();
  const { stats, transactions, addTransaction, loading } = useData();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Alimentation');
  const [type, setType] = useState<TransactionType>('expense');

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !title) return;
    
    setIsSubmitting(true);
    try {
        await addTransaction({
          amount: parseFloat(amount),
          title,
          category,
          type,
          date: new Date()
        });
        setIsAddModalOpen(false);
        // Reset form
        setAmount('');
        setTitle('');
    } catch (error) {
        console.error("Error adding transaction", error);
    } finally {
        setIsSubmitting(false);
    }
  };

  // Préparer données Donut
  const currentMonth = new Date().getMonth();
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense' && t.date.getMonth() === currentMonth)
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const donutData = Object.entries(expensesByCategory).map(([label, value], index) => ({
    label,
    value,
    color: ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'][index % 5]
  }));

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
             <div className="animate-pulse flex flex-col items-center">
                 <div className="h-12 w-12 bg-indigo-200 rounded-full mb-4"></div>
                 <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
             </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 px-6 py-4 shadow-sm flex justify-between items-center sticky top-0 z-30 transition-colors">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Bonjour,</p>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.displayName || 'Utilisateur'}</h2>
        </div>
        <Link to="/profile" className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800 hover:scale-105 transition-transform">
          {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
        </Link>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Main Card */}
        <div className="bg-indigo-600 dark:bg-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden transition-colors">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <TrendingUpIcon className="w-32 h-32" />
          </div>
          <p className="text-indigo-100 mb-2 font-medium">Solde actuel</p>
          <h3 className="text-4xl font-bold tracking-tight mb-6">
            {stats.balance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </h3>
          <div className="flex gap-4">
             <div className="bg-indigo-500/50 p-3 rounded-2xl flex-1 backdrop-blur-sm">
                <p className="text-xs text-indigo-100 mb-1">Revenus</p>
                <p className="text-lg font-semibold flex items-center">
                   <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                   +{stats.income.toLocaleString()}
                </p>
             </div>
             <div className="bg-indigo-500/50 p-3 rounded-2xl flex-1 backdrop-blur-sm">
                <p className="text-xs text-indigo-100 mb-1">Dépenses</p>
                <p className="text-lg font-semibold flex items-center">
                   <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                   -{stats.expense.toLocaleString()}
                </p>
             </div>
          </div>
        </div>

        {/* Charts & Highlights */}
        <section>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Dépenses du mois</h3>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
            {donutData.length > 0 ? (
                <>
                <DonutChart data={donutData} />
                <div className="mt-6 grid grid-cols-2 gap-2">
                {donutData.map((d, i) => (
                    <div key={i} className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: d.color }}></span>
                    <span className="flex-1 truncate">{d.label}</span>
                    <span className="font-medium">{Math.round(d.value)}€</span>
                    </div>
                ))}
                </div>
                </>
            ) : (
                <div className="py-8 text-center text-slate-400 text-sm">
                    Pas encore de dépenses ce mois-ci.
                </div>
            )}
          </div>
        </section>

        {/* Recent Transactions */}
        <section>
           <div className="flex justify-between items-end mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Récemment</h3>
              <a href="#/transactions" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Voir tout</a>
           </div>
           <div className="space-y-3">
             {transactions.slice(0, 5).map(t => (
               <div key={t.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex justify-between items-center transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${t.type === 'income' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                       {t.type === 'income' ? <TrendingUpIcon className="w-5 h-5" /> : <TrendingUpIcon className="w-5 h-5 transform rotate-180" />}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{t.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t.date.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`font-bold ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-slate-100'}`}>
                    {t.type === 'income' ? '+' : '-'}{t.amount} €
                  </span>
               </div>
             ))}
             {transactions.length === 0 && (
                <p className="text-center text-slate-400 py-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    Aucune transaction récente
                </p>
             )}
           </div>
        </section>
      </main>

      {/* FAB (Floating Action Button) */}
      <button 
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-20 right-6 bg-slate-900 dark:bg-indigo-600 text-white p-4 rounded-full shadow-lg shadow-slate-400 dark:shadow-indigo-900/50 hover:scale-105 active:scale-95 transition-all z-40"
      >
        <PlusIcon className="w-6 h-6" />
      </button>

      {/* Modal Ajout */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Nouvelle Transaction">
        <form onSubmit={handleAddSubmit} className="space-y-4">
           {/* Type Select */}
           <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6">
              <button
                type="button"
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${type === 'expense' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                onClick={() => setType('expense')}
              >
                Dépense
              </button>
              <button
                type="button"
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${type === 'income' ? 'bg-white dark:bg-slate-700 shadow-sm text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}
                onClick={() => setType('income')}
              >
                Revenu
              </button>
           </div>

           <div>
             <label className="text-xs text-slate-500 font-bold uppercase ml-1">Montant</label>
             <div className="relative mt-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">€</span>
                <input 
                  type="number" 
                  step="0.01"
                  value={amount} 
                  onChange={e => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-2xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00"
                  required
                  autoFocus
                />
             </div>
           </div>

           <Input 
             label="Titre" 
             placeholder="Ex: McDonald's" 
             value={title} 
             onChange={e => setTitle(e.target.value)} 
             required 
             className="dark:bg-slate-800 dark:text-white dark:border-slate-700"
           />

           <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Catégorie</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value as Category)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                {['Alimentation', 'Transport', 'Loisirs', 'Logement', 'Santé', 'Salaire', 'Shopping', 'Autre'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
           </div>

           <div className="pt-4">
             <Button type="submit" isLoading={isSubmitting}>Ajouter</Button>
           </div>
        </form>
      </Modal>
    </div>
  );
};