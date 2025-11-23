import React, { useState } from 'react';
import { useData } from '../../lib/dataContext';
import { LightbulbIcon, TrendingUpIcon, EditIcon } from '../../components/ui/Icons';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const Insights = () => {
  const { budgets, insights, loading, updateBudget } = useData();
  const [editingBudget, setEditingBudget] = useState<{id: string, category: string, limit: number} | null>(null);
  const [newLimit, setNewLimit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditClick = (budget: any) => {
    setEditingBudget(budget);
    setNewLimit(budget.limit.toString());
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingBudget || !newLimit) return;

      setIsSubmitting(true);
      try {
          await updateBudget(editingBudget.category, parseFloat(newLimit));
          setEditingBudget(null);
      } catch (error) {
          console.error("Failed to update budget", error);
      } finally {
          setIsSubmitting(false);
      }
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
           <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="bg-card px-6 py-4 shadow-sm sticky top-0 z-30 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">Budget & Insights</h1>
      </header>

      <main className="px-4 py-6 space-y-8 max-w-lg mx-auto">
        {/* Section Insights / Alertes */}
        <section>
            <h3 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider ml-1">Analyses Intelligentes</h3>
            <div className="space-y-4">
                {insights.length > 0 ? (
                insights.map((insight) => (
                    <div 
                        key={insight.id} 
                        className={`border rounded-2xl p-5 flex gap-4 shadow-sm transition-all duration-300 animate-in slide-in-from-bottom-2 ${
                            insight.type === 'alert' ? 'bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30' : 
                            insight.type === 'success' ? 'bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30' : 
                            'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30'
                        }`}
                    >
                    <div className={`p-2 h-10 w-10 rounded-full flex items-center justify-center shrink-0 bg-card shadow-sm ${
                        insight.type === 'alert' ? 'text-red-600' : 
                        insight.type === 'success' ? 'text-green-600' : 
                        'text-blue-600'
                    }`}>
                        <LightbulbIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h3 className={`font-bold text-sm mb-1 ${
                                insight.type === 'alert' ? 'text-red-900 dark:text-red-200' : 
                                insight.type === 'success' ? 'text-green-900 dark:text-green-200' : 
                                'text-blue-900 dark:text-blue-200'
                            }`}>
                                {insight.title}
                            </h3>
                            {insight.metric && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-background border border-border ${
                                    insight.type === 'alert' ? 'text-red-700 dark:text-red-300' : 
                                    insight.type === 'success' ? 'text-green-700 dark:text-green-300' : 
                                    'text-blue-700 dark:text-blue-300'
                                }`}>
                                    {insight.metric}
                                </span>
                            )}
                        </div>
                        <p className={`text-sm leading-relaxed ${
                            insight.type === 'alert' ? 'text-red-800 dark:text-red-300' : 
                            insight.type === 'success' ? 'text-green-800 dark:text-green-300' : 
                            'text-blue-800 dark:text-blue-300'
                        }`}>
                        {insight.message}
                        </p>
                    </div>
                    </div>
                ))
                ) : (
                    <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border border-border">
                        <TrendingUpIcon className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                        <p className="text-sm font-medium">Rien à signaler pour l'instant.</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">Vos finances semblent stables !</p>
                    </div>
                )}
            </div>
        </section>

        {/* Section Budgets */}
        <section>
           <div className="flex justify-between items-end mb-4 px-1">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Suivi Mensuel</h3>
                <span className="text-xs font-medium text-foreground bg-secondary px-3 py-1 rounded-full border border-border">
                    {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </span>
           </div>
           
           <div className="space-y-4">
             {budgets.map((budget) => {
                const percent = Math.min(100, budget.pct * 100);
                const isOver = budget.spent > budget.limit;
                const statusColor = isOver ? 'bg-destructive' : percent > 80 ? 'bg-orange-500' : 'bg-primary';
                
                return (
                  <div key={budget.id} className="bg-card p-5 rounded-2xl shadow-sm border border-border group relative">
                     <div className="flex justify-between items-end mb-3">
                        <div>
                           <div className="flex items-center gap-2 mb-1.5">
                                <span className={`w-2.5 h-2.5 rounded-full ${statusColor}`}></span>
                                <p className="font-bold text-foreground text-lg">{budget.category}</p>
                           </div>
                           <p className="text-xs text-muted-foreground font-medium">
                               {isOver 
                                ? `Dépassement de ${(budget.spent - budget.limit).toLocaleString()}€` 
                                : `Reste ${Math.max(0, budget.limit - budget.spent).toLocaleString()}€`
                               }
                           </p>
                        </div>
                        <div className="text-right">
                            <span className={`font-bold block text-lg ${isOver ? 'text-destructive' : 'text-foreground'}`}>
                            {budget.spent.toLocaleString()}€ 
                            </span>
                            <span className="text-muted-foreground text-xs font-medium">sur {budget.limit.toLocaleString()}€</span>
                        </div>
                     </div>
                     
                     <div className="w-full bg-secondary h-3 rounded-full overflow-hidden mt-1">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ease-out ${statusColor}`}
                          style={{ width: `${percent}%` }}
                        />
                     </div>

                     {/* Edit Button - Visible on hover or always on mobile? Better always visible but subtle */}
                     <button 
                        onClick={() => handleEditClick(budget)}
                        className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        aria-label="Modifier le budget"
                     >
                        <EditIcon className="w-4 h-4" />
                     </button>
                  </div>
                );
             })}
           </div>
        </section>
      </main>

      {/* Edit Budget Modal */}
      <Modal 
        isOpen={!!editingBudget} 
        onClose={() => setEditingBudget(null)} 
        title="Modifier le budget"
      >
          <form onSubmit={handleUpdateSubmit} className="space-y-6">
              <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Catégorie</p>
                  <div className="p-3 bg-secondary rounded-xl font-bold text-foreground">
                      {editingBudget?.category}
                  </div>
              </div>

              <div className="space-y-2">
                 <label className="text-sm text-muted-foreground">Limite Mensuelle (€)</label>
                 <Input 
                    type="number" 
                    value={newLimit}
                    onChange={(e) => setNewLimit(e.target.value)}
                    placeholder="Ex: 500"
                    autoFocus
                 />
                 <div className="flex justify-between text-xs text-muted-foreground px-1">
                    <span>0€</span>
                    <span>1000€+</span>
                 </div>
                 <input 
                    type="range" 
                    min="0" 
                    max="2000" 
                    step="10"
                    value={newLimit}
                    onChange={(e) => setNewLimit(e.target.value)}
                    className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                 />
              </div>

              <div className="pt-2">
                  <Button type="submit" isLoading={isSubmitting}>Enregistrer</Button>
              </div>
          </form>
      </Modal>
    </div>
  );
};