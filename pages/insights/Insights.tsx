import React, { useState, useEffect } from 'react';
import { useData } from '../../lib/dataContext';
import { LightbulbIcon, TrendingUpIcon, EditIcon, AlertTriangleIcon, CheckCircleIcon, TargetIcon, PlusIcon, TrashIcon } from '../../components/ui/Icons';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const Insights = () => {
  const { budgets, insights, loading, updateBudget, categories, addCategory } = useData();
  
  // State for Managing Budgets
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [editedBudgets, setEditedBudgets] = useState<{category: string, limit: string}[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for adding a new budget line in the modal
  const [newBudgetCat, setNewBudgetCat] = useState('');
  const [newBudgetLimit, setNewBudgetLimit] = useState('');

  // Init local state when modal opens
  useEffect(() => {
      if (isManageModalOpen) {
          const mapped = budgets.map(b => ({
              category: b.category,
              limit: b.limit.toString()
          }));
          setEditedBudgets(mapped);
      }
  }, [isManageModalOpen, budgets]);

  const handleInputChange = (index: number, value: string) => {
      const copy = [...editedBudgets];
      copy[index].limit = value;
      setEditedBudgets(copy);
  };

  const handleDeleteBudget = (index: number) => {
      const copy = [...editedBudgets];
      // Mark for deletion by removing from list. 
      // Note: Actual DB deletion happens on save if we track diffs, 
      // or we can set limit to -1 to signal deletion in our updateBudget logic.
      // For simplicity in UI, we remove it from UI list. 
      // To sync with DB, we need to know which ones were removed.
      // Let's change strategy: Update immediately or track deletions?
      // Strategy: We will process the full list on save. If a category from original `budgets` is missing in `editedBudgets`, we delete it.
      copy.splice(index, 1);
      setEditedBudgets(copy);
  };

  const handleAddBudgetLine = async () => {
      if (!newBudgetCat || !newBudgetLimit) return;
      
      // If category doesn't exist globally, add it
      if (!categories.includes(newBudgetCat)) {
          await addCategory(newBudgetCat);
      }

      setEditedBudgets(prev => [...prev, { category: newBudgetCat, limit: newBudgetLimit }]);
      setNewBudgetCat('');
      setNewBudgetLimit('');
  };

  const handleSaveAll = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
          // 1. Update or Create current edited budgets
          const updatePromises = editedBudgets.map(b => {
              const limit = parseFloat(b.limit);
              if (!isNaN(limit)) {
                  return updateBudget(b.category, limit);
              }
              return Promise.resolve();
          });

          // 2. Find deleted budgets (present in original `budgets` but missing in `editedBudgets`)
          const currentCategoryNames = editedBudgets.map(b => b.category);
          const deletePromises = budgets
            .filter(b => !currentCategoryNames.includes(b.category))
            .map(b => updateBudget(b.category, -1)); // -1 triggers deletion in DataContext

          await Promise.all([...updatePromises, ...deletePromises]);
          setIsManageModalOpen(false);
      } catch (error) {
          console.error("Failed to update budgets", error);
      } finally {
          setIsSubmitting(false);
      }
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
           <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32 font-sans relative">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-purple-50 to-transparent dark:from-purple-900/10 pointer-events-none -z-10"></div>

      <header className="px-6 pt-6 pb-2 sticky top-0 z-30 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-lg">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6">Budget & Conseils</h1>
      </header>

      <main className="px-5 space-y-8 pb-6">
        {/* Section Insights / Alertes */}
        <section>
            <div className="flex items-center gap-2 mb-4 px-1">
                <LightbulbIcon className="w-5 h-5 text-yellow-500" />
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assistant Intelligent</h3>
            </div>
            
            <div className="space-y-4">
                {insights.length > 0 ? (
                insights.map((insight) => {
                    let Icon = LightbulbIcon;
                    let bgClass = 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30';
                    let iconBgClass = 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300';
                    let textClass = 'text-blue-900 dark:text-blue-100';
                    let descClass = 'text-blue-700 dark:text-blue-300';
                    let metricClass = 'bg-blue-200/50 text-blue-800 dark:bg-blue-800/50 dark:text-blue-200';

                    if (insight.type === 'alert') {
                        Icon = AlertTriangleIcon;
                        bgClass = 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30';
                        iconBgClass = 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300';
                        textClass = 'text-red-900 dark:text-red-100';
                        descClass = 'text-red-700 dark:text-red-300';
                        metricClass = 'bg-red-200/50 text-red-800 dark:bg-red-800/50 dark:text-red-200';
                    } else if (insight.type === 'success') {
                        Icon = CheckCircleIcon;
                        bgClass = 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30';
                        iconBgClass = 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300';
                        textClass = 'text-emerald-900 dark:text-emerald-100';
                        descClass = 'text-emerald-700 dark:text-emerald-300';
                        metricClass = 'bg-emerald-200/50 text-emerald-800 dark:bg-emerald-800/50 dark:text-emerald-200';
                    }

                    return (
                        <div 
                            key={insight.id} 
                            className={`border rounded-[1.5rem] p-5 flex gap-4 shadow-sm transition-all duration-300 animate-in slide-in-from-bottom-2 ${bgClass}`}
                        >
                            <div className={`p-2.5 h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${iconBgClass}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className={`font-bold text-sm truncate pr-2 ${textClass}`}>
                                        {insight.title}
                                    </h3>
                                    {insight.metric && (
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${metricClass}`}>
                                            {insight.metric}
                                        </span>
                                    )}
                                </div>
                                <p className={`text-sm leading-relaxed ${descClass}`}>
                                    {insight.message}
                                </p>
                            </div>
                        </div>
                    );
                })
                ) : (
                    <div className="text-center py-10 text-slate-400 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-dashed border-slate-200 dark:border-slate-800">
                        <TrendingUpIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-medium text-slate-500">Aucune alerte pour le moment.</p>
                        <p className="text-xs text-slate-400 mt-1">Vos finances semblent stables !</p>
                    </div>
                )}
            </div>
        </section>

        {/* Section Budgets */}
        <section>
           <div className="flex justify-between items-center mb-4 px-1">
                <div className="flex items-center gap-2">
                    <TargetIcon className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Suivi Mensuel</h3>
                </div>
                <button 
                    onClick={() => setIsManageModalOpen(true)}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-1"
                >
                    <EditIcon className="w-3 h-3" /> Gérer
                </button>
           </div>
           
           <div className="space-y-4">
             {budgets.map((budget) => {
                const percent = Math.min(100, budget.pct * 100);
                const isOver = budget.spent > budget.limit;
                
                // Colors
                let progressColor = 'bg-indigo-500';
                let trackColor = 'bg-slate-100 dark:bg-slate-800';
                let textColor = 'text-slate-900 dark:text-white';
                
                if (isOver) {
                    progressColor = 'bg-red-500';
                    trackColor = 'bg-red-50 dark:bg-red-900/20';
                    textColor = 'text-red-600 dark:text-red-400';
                } else if (percent > 85) {
                    progressColor = 'bg-orange-500';
                } else if (percent < 50) {
                    progressColor = 'bg-emerald-500';
                }

                return (
                  <div key={budget.id} className="bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-800 relative transition-transform active:scale-[0.99]">
                     <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${isOver ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'} dark:bg-slate-800 dark:text-slate-300`}>
                               {budget.category.includes('Alimentation') ? '🍔' : 
                                budget.category.includes('Transport') ? '🚗' : 
                                budget.category.includes('Loisirs') ? '🍿' : 
                                budget.category.includes('Shopping') ? '🛍️' : '🏷️'}
                           </div>
                           <div>
                               <p className={`font-bold ${textColor}`}>{budget.category}</p>
                               <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                   {isOver 
                                    ? <span className="text-red-500 font-bold">Budget dépassé !</span>
                                    : <span>Reste <span className="font-bold text-slate-700 dark:text-slate-300">{Math.max(0, budget.limit - budget.spent).toLocaleString()}€</span></span>
                                   }
                               </p>
                           </div>
                        </div>
                        <div className="text-right">
                            <span className={`font-bold block text-lg ${isOver ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                                {Math.round(percent)}%
                            </span>
                        </div>
                     </div>
                     
                     <div className={`w-full h-4 rounded-full overflow-hidden ${trackColor}`}>
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ease-out relative ${progressColor}`}
                          style={{ width: `${percent}%` }}
                        >
                            {/* Striped pattern overlay for texture */}
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem]"></div>
                        </div>
                     </div>
                     
                     <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        <span>0 €</span>
                        <span>{budget.limit.toLocaleString()} €</span>
                     </div>
                  </div>
                );
             })}
           </div>
        </section>
      </main>

      {/* Manage Budgets Modal */}
      <Modal 
        isOpen={isManageModalOpen} 
        onClose={() => setIsManageModalOpen(false)} 
        title="Gérer les Budgets"
      >
          <div className="flex flex-col h-[60vh]">
              {/* List */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-4 pt-2">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                    Ajustez vos plafonds ou supprimez des budgets existants.
                </p>
                {editedBudgets.length > 0 ? (
                    editedBudgets.map((b, i) => (
                        <div key={b.category} className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${i * 50}ms` }}>
                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-lg">
                                {b.category.includes('Alimentation') ? '🍔' : 
                                b.category.includes('Transport') ? '🚗' : 
                                b.category.includes('Loisirs') ? '🍿' : 
                                b.category.includes('Shopping') ? '🛍️' : '🏷️'}
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">{b.category}</label>
                                <div className="relative">
                                    <input 
                                        type="number"
                                        value={b.limit}
                                        onChange={(e) => handleInputChange(i, e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 pl-3 pr-8 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">€</span>
                                </div>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => handleDeleteBudget(i)}
                                className="mt-5 p-2 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-slate-400 py-4">Aucun budget défini.</p>
                )}
              </div>
              
              {/* Add New Line */}
              <div className="py-4 border-t border-slate-100 dark:border-slate-800 mt-2">
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-2">Ajouter un budget</p>
                  <div className="flex gap-2">
                      <select 
                        value={newBudgetCat}
                        onChange={(e) => setNewBudgetCat(e.target.value)}
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none"
                      >
                          <option value="">Choisir catégorie...</option>
                          {categories.filter(c => !editedBudgets.find(eb => eb.category === c)).map(c => (
                              <option key={c} value={c}>{c}</option>
                          ))}
                          {/* Allow entering custom if not in list (simplified UI: just rely on existing cats for now, 
                              or allow "Autre" which is in defaults. To add brand new, use Manage Categories) */}
                      </select>
                      <input 
                        type="number" 
                        placeholder="Limit" 
                        value={newBudgetLimit}
                        onChange={(e) => setNewBudgetLimit(e.target.value)}
                        className="w-24 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 dark:text-white outline-none"
                      />
                      <button 
                        type="button" 
                        onClick={handleAddBudgetLine}
                        disabled={!newBudgetCat || !newBudgetLimit}
                        className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg px-3 disabled:opacity-50"
                      >
                          <PlusIcon className="w-5 h-5" />
                      </button>
                  </div>
              </div>

              {/* Save Footer */}
              <div className="sticky bottom-0 bg-white dark:bg-slate-900 pt-3">
                 <Button onClick={handleSaveAll} isLoading={isSubmitting} className="h-12 text-lg">
                     Enregistrer tout
                 </Button>
              </div>
          </div>
      </Modal>
    </div>
  );
};