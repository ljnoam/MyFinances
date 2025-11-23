import React, { useState } from 'react';
import { useData } from '../../lib/dataContext';
import { PlusIcon, WalletIcon, TargetIcon, ChevronRightIcon } from '../../components/ui/Icons';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const Savings = () => {
  const { savingsGoals, addToSavings, addSavingsGoal } = useData();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState('');
  
  const [isNewGoalOpen, setIsNewGoalOpen] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  const handleAddSavings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGoal && addAmount) {
      setLoadingAction(true);
      await addToSavings(selectedGoal, parseFloat(addAmount));
      setLoadingAction(false);
      setSelectedGoal(null);
      setAddAmount('');
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoadingAction(true);
      await addSavingsGoal({
          name: newGoalName,
          targetAmount: parseFloat(newGoalTarget),
          icon: '🎯',
          color: 'bg-indigo-500'
      });
      setLoadingAction(false);
      setIsNewGoalOpen(false);
      setNewGoalName('');
      setNewGoalTarget('');
  };

  const totalSaved = savingsGoals.reduce((acc, goal) => acc + goal.currentAmount, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28 font-sans relative">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-full h-[300px] bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-900/10 pointer-events-none -z-10"></div>
      
      <header className="px-6 pt-6 pb-2 sticky top-0 z-30 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-lg">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Épargne</h1>
            <button 
                onClick={() => setIsNewGoalOpen(true)}
                className="w-10 h-10 rounded-full bg-indigo-600 text-white shadow-lg shadow-slate-200 dark:shadow-black/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
            >
                <PlusIcon className="w-5 h-5" />
            </button>
        </div>

        {/* Total Savings Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-6 text-white shadow-xl shadow-slate-200/50 dark:shadow-black/20 mb-6 relative overflow-hidden">
             {/* Decor */}
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
             <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/30 rounded-full blur-xl"></div>
             
             <div className="relative z-10 text-center">
                 <p className="text-blue-100 text-sm font-medium mb-1">Total Épargné</p>
                 <h2 className="text-4xl font-extrabold tracking-tight mb-2">
                     {totalSaved.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €
                 </h2>
                 <div className="inline-flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-xs backdrop-blur-md">
                     <TargetIcon className="w-3 h-3" />
                     <span>{savingsGoals.length} Objectif{savingsGoals.length > 1 ? 's' : ''} en cours</span>
                 </div>
             </div>
        </div>
      </header>

      <main className="px-5 space-y-4">
        {savingsGoals.length === 0 && (
             <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
                 <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <WalletIcon className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                 </div>
                 <p className="text-slate-900 dark:text-white font-bold text-lg mb-1">Aucun objectif</p>
                 <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Commencez à épargner pour vos rêves.</p>
                 <Button onClick={() => setIsNewGoalOpen(true)} className="w-auto px-6">Créer un objectif</Button>
             </div>
        )}
        
        {savingsGoals.map(goal => {
           const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
           const isComplete = percent >= 100;

           return (
             <div key={goal.id} className="group bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5">
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${goal.color} bg-opacity-10 dark:bg-opacity-20 text-slate-900 dark:text-white`}>
                            {goal.icon}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{goal.name}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Cible : {goal.targetAmount.toLocaleString()} €</p>
                        </div>
                   </div>
                   <button 
                     onClick={() => setSelectedGoal(goal.id)}
                     className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center hover:bg-indigo-100 dark:hover:bg-slate-700 transition-colors"
                   >
                     <PlusIcon className="w-5 h-5" />
                   </button>
                </div>
                
                <div className="mb-2 flex justify-between items-end">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                        {goal.currentAmount.toLocaleString()} <span className="text-sm font-medium text-slate-400">€</span>
                    </span>
                    <span className={`font-bold text-sm ${isComplete ? 'text-green-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
                        {percent}%
                    </span>
                </div>
                
                <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                   <div 
                     className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${isComplete ? 'bg-green-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`} 
                     style={{ width: `${percent}%` }}
                   >
                       {/* Shimmer effect */}
                       <div className="absolute top-0 left-0 w-full h-full bg-white/30 animate-[shimmer_2s_infinite] skew-x-12 translate-x-[-150%]"></div>
                   </div>
                </div>
             </div>
           );
        })}
      </main>

      {/* Modal Add Money */}
      <Modal 
        isOpen={!!selectedGoal} 
        onClose={() => setSelectedGoal(null)} 
        title="Ajouter à l'épargne"
      >
        <form onSubmit={handleAddSavings} className="space-y-6 pt-2">
           <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  💰
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium">Combien voulez-vous mettre de côté ?</p>
           </div>
           
           <div className="relative">
             <Input 
                type="number" 
                placeholder="0" 
                value={addAmount} 
                onChange={e => setAddAmount(e.target.value)}
                autoFocus
                required
                className="text-center text-3xl font-bold h-16 dark:bg-slate-800 dark:text-white dark:border-slate-700"
             />
             <span className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-bold">€</span>
           </div>

           <Button type="submit" isLoading={loadingAction} className="h-12 text-lg">
               Confirmer l'ajout
           </Button>
        </form>
      </Modal>

      {/* Modal New Goal */}
      <Modal isOpen={isNewGoalOpen} onClose={() => setIsNewGoalOpen(false)} title="Nouvel Objectif">
          <form onSubmit={handleCreateGoal} className="space-y-5 pt-2">
              <Input 
                label="Nom de l'objectif"
                placeholder="Ex: Voyage Japon, Nouvelle Voiture..."
                value={newGoalName}
                onChange={e => setNewGoalName(e.target.value)}
                required
                className="dark:bg-slate-800 dark:text-white dark:border-slate-700"
              />
              <Input 
                label="Montant cible (€)"
                type="number"
                placeholder="Ex: 2000"
                value={newGoalTarget}
                onChange={e => setNewGoalTarget(e.target.value)}
                required
                className="dark:bg-slate-800 dark:text-white dark:border-slate-700"
              />
              <div className="pt-2">
                  <Button type="submit" isLoading={loadingAction} className="h-12">Créer l'objectif</Button>
              </div>
          </form>
      </Modal>
    </div>
  );
};