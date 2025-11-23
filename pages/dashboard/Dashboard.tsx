import React, { useState } from 'react';
import { useAuth } from '../../lib/authContext';
import { useData, TransactionType, Category } from '../../lib/dataContext';
import { 
  PlusIcon, 
  EyeIcon, 
  EyeOffIcon, 
  ArrowUpRightIcon, 
  ArrowDownLeftIcon,
  ChevronRightIcon
} from '../../components/ui/Icons';
import { DonutChart } from '../../components/ui/Charts';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { user } = useAuth();
  const { stats, transactions, addTransaction, categories, loading } = useData();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // UI State
  const [showBalance, setShowBalance] = useState(true);

  // Form State
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>(categories[0] || 'Alimentation');
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
        setAmount('');
        setTitle('');
    } catch (error) {
        console.error("Error adding transaction", error);
    } finally {
        setIsSubmitting(false);
    }
  };

  // Prepare Donut Data
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
    color: ['#818cf8', '#f472b6', '#34d399', '#fbbf24', '#a78bfa', '#60a5fa', '#c084fc'][index % 7]
  }));

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
             <div className="animate-pulse flex flex-col items-center">
                 <div className="h-12 w-12 bg-indigo-200/50 rounded-full mb-4"></div>
                 <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
             </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 relative overflow-x-hidden font-sans">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-indigo-50/50 dark:bg-indigo-900/10 -z-10 rounded-b-[40px] pointer-events-none"></div>
      <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute top-[100px] left-[-50px] w-48 h-48 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl -z-10"></div>

      {/* Header */}
      <header className="px-6 py-5 flex justify-between items-center sticky top-0 z-30 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
            <Link to="/profile" className="relative group">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px]">
                    <div className="h-full w-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                                {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
                            </span>
                        )}
                    </div>
                </div>
            </Link>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Bon retour,</p>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {user?.displayName ? user.displayName.split(' ')[0] : 'Utilisateur'}
              </h2>
            </div>
        </div>
      </header>

      <main className="px-5 space-y-8 mt-2">
        {/* Main Card */}
        <div className="relative w-full rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-6 text-white shadow-xl shadow-slate-200/50 dark:shadow-black/20 overflow-hidden group">
            
            {/* Glass Effect Overlay */}
            <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-[1px]"></div>
            
            {/* Decorative Circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-indigo-200 text-sm font-medium mb-1 flex items-center gap-2">
                            Solde total
                            <button 
                                onClick={() => setShowBalance(!showBalance)}
                                className="opacity-70 hover:opacity-100 transition-opacity"
                            >
                                {showBalance ? <EyeIcon className="w-4 h-4" /> : <EyeOffIcon className="w-4 h-4" />}
                            </button>
                        </p>
                        <h3 className="text-4xl font-extrabold tracking-tight">
                            {showBalance ? (
                                stats.balance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                            ) : (
                                '••••••'
                            )}
                        </h3>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div className="bg-black/20 rounded-2xl p-3 backdrop-blur-md border border-white/5 flex items-center justify-between group-hover:bg-black/30 transition-colors">
                        <div>
                            <div className="flex items-center gap-1.5 mb-1">
                                <div className="p-1 bg-green-400/20 rounded-full">
                                    <ArrowDownLeftIcon className="w-3 h-3 text-green-300" />
                                </div>
                                <span className="text-xs text-indigo-100 font-medium">Revenus</span>
                            </div>
                            <p className="text-lg font-bold">
                                {showBalance ? `+${stats.income.toLocaleString()}` : '••••'}
                            </p>
                        </div>
                     </div>

                     <div className="bg-black/20 rounded-2xl p-3 backdrop-blur-md border border-white/5 flex items-center justify-between group-hover:bg-black/30 transition-colors">
                        <div>
                            <div className="flex items-center gap-1.5 mb-1">
                                <div className="p-1 bg-red-400/20 rounded-full">
                                    <ArrowUpRightIcon className="w-3 h-3 text-red-300" />
                                </div>
                                <span className="text-xs text-indigo-100 font-medium">Dépenses</span>
                            </div>
                            <p className="text-lg font-bold">
                                {showBalance ? `-${stats.expense.toLocaleString()}` : '••••'}
                            </p>
                        </div>
                     </div>
                </div>
            </div>
        </div>

        {/* Quick Actions (Visual Only) */}
        <div className="flex justify-between gap-4 px-2">
            <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex flex-col items-center gap-2 group w-full"
            >
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800 group-active:scale-95 transition-all">
                    <PlusIcon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Ajouter</span>
            </button>
            <Link to="/stats" className="flex flex-col items-center gap-2 group w-full">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-800 group-active:scale-95 transition-all">
                    <ArrowUpRightIcon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Analyse</span>
            </Link>
             <Link to="/savings" className="flex flex-col items-center gap-2 group w-full">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-800 group-active:scale-95 transition-all">
                    <ArrowDownLeftIcon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Épargne</span>
            </Link>
        </div>

        {/* Analytics Section */}
        <section>
          <div className="flex justify-between items-center mb-4 px-1">
             <h3 className="text-lg font-bold text-slate-900 dark:text-white">Dépenses</h3>
             <Link to="/stats" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:opacity-80">
                Détails
             </Link>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-[0_2px_20px_-10px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {donutData.length > 0 ? (
                <>
                <div className="relative">
                    <DonutChart data={donutData} />
                </div>
                <div className="flex-1 pl-6 space-y-3">
                    {donutData.slice(0, 3).map((d, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate max-w-[80px]">{d.label}</span>
                            </div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{Math.round(d.value)}€</span>
                        </div>
                    ))}
                    {donutData.length > 3 && (
                        <p className="text-[10px] text-slate-400 text-center pt-1">+ {donutData.length - 3} autres</p>
                    )}
                </div>
                </>
            ) : (
                <div className="w-full text-center py-4 text-slate-400 text-sm">
                    Pas encore de dépenses.
                </div>
            )}
          </div>
        </section>

        {/* Recent Transactions */}
        <section className="pb-8">
           <div className="flex justify-between items-end mb-4 px-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Récemment</h3>
              <Link to="/transactions" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 hover:gap-1 transition-all">
                Voir tout <ChevronRightIcon className="w-4 h-4" />
              </Link>
           </div>
           
           <div className="flex flex-col gap-3">
             {transactions.slice(0, 5).map(t => (
               <div key={t.id} className="group bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex justify-between items-center transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.99]">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg shadow-sm ${
                        t.type === 'income' 
                        ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                       {t.category.includes('Alimentation') ? '🍔' : 
                        t.category.includes('Transport') ? '🚗' : 
                        t.category.includes('Loisirs') ? '🍿' : 
                        t.category.includes('Santé') ? '💊' :
                        t.category.includes('Shopping') ? '🛍️' :
                        t.category.includes('Salaire') ? '💰' : '📄'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{t.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{t.category} • {t.date.toLocaleDateString(undefined, {day: 'numeric', month: 'short'})}</p>
                    </div>
                  </div>
                  <span className={`font-bold text-sm tracking-tight ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-slate-100'}`}>
                    {t.type === 'income' ? '+' : '-'}{t.amount} €
                  </span>
               </div>
             ))}
             {transactions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                        <PlusIcon className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Aucune transaction</p>
                </div>
             )}
           </div>
        </section>
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-24 right-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-4 rounded-full shadow-lg shadow-black/20 hover:scale-110 active:scale-90 transition-all z-40 flex items-center justify-center"
      >
        <PlusIcon className="w-6 h-6" />
      </button>

      {/* Modal Ajout */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Nouvelle Transaction">
        <form onSubmit={handleAddSubmit} className="space-y-6 pt-2">
           <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
              <button
                type="button"
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${type === 'expense' ? 'bg-white dark:bg-slate-700 shadow-sm text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
                onClick={() => setType('expense')}
              >
                Dépense
              </button>
              <button
                type="button"
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${type === 'income' ? 'bg-white dark:bg-slate-700 shadow-sm text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
                onClick={() => setType('income')}
              >
                Revenu
              </button>
           </div>

           <div className="text-center">
             <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 block">Montant</label>
             <div className="relative inline-block w-full max-w-[200px]">
                <input 
                  type="number" 
                  step="0.01"
                  value={amount} 
                  onChange={e => setAmount(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-slate-200 dark:border-slate-700 py-2 text-center text-4xl font-extrabold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder-slate-300"
                  placeholder="0"
                  required
                  autoFocus
                />
                <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 text-slate-400 text-xl font-bold">€</span>
             </div>
           </div>

           <div className="space-y-4">
               <Input 
                label="Titre" 
                placeholder="Ex: Supermarché" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
                className="dark:bg-slate-800 dark:text-white dark:border-slate-700"
                />

                <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Catégorie</label>
                    <select 
                        value={category} 
                        onChange={e => setCategory(e.target.value as Category)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 appearance-none"
                    >
                        {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
           </div>

           <div className="pt-4">
             <Button type="submit" isLoading={isSubmitting} className="h-14 text-lg">
                Confirmer
             </Button>
           </div>
        </form>
      </Modal>
    </div>
  );
};