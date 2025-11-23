import React, { useState } from 'react';
import { useData } from '../../lib/dataContext';
import { PlusIcon, WalletIcon } from '../../components/ui/Icons';
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 transition-colors">
      <header className="bg-white dark:bg-slate-900 px-6 py-4 shadow-sm sticky top-0 z-30 flex justify-between items-center border-b border-slate-100 dark:border-slate-800 transition-colors">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Épargne</h1>
        <button 
            onClick={() => setIsNewGoalOpen(true)}
            className="text-indigo-600 dark:text-indigo-400 p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors"
        >
            <PlusIcon className="w-6 h-6" />
        </button>
      </header>

      <main className="px-4 py-6 grid gap-6 md:grid-cols-2">
        {savingsGoals.length === 0 && (
             <div className="col-span-full text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
                 <WalletIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                 <p className="text-slate-500 dark:text-slate-400">Aucun objectif d'épargne.</p>
                 <button onClick={() => setIsNewGoalOpen(true)} className="text-indigo-600 dark:text-indigo-400 font-bold mt-2 text-sm hover:underline">Créer le premier</button>
             </div>
        )}
        {savingsGoals.map(goal => {
           const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
           
           return (
             <div key={goal.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group transition-colors">
                <div className="flex justify-between items-start mb-4">
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${goal.color} bg-opacity-10 dark:bg-opacity-20 text-slate-900 dark:text-white`}>
                      {goal.icon}
                   </div>
                   <button 
                     onClick={() => setSelectedGoal(goal.id)}
                     className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                   >
                     + Ajouter
                   </button>
                </div>
                
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{goal.name}</h3>
                <div className="flex justify-between text-sm mb-3">
                   <span className="text-slate-500 dark:text-slate-400 font-medium">{goal.currentAmount}€ / {goal.targetAmount}€</span>
                   <span className="text-indigo-600 dark:text-indigo-400 font-bold">{percent}%</span>
                </div>
                
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                   <div 
                     className={`h-full ${goal.color} transition-all duration-1000 ease-out`} 
                     style={{ width: `${percent}%` }}
                   />
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
        <form onSubmit={handleAddSavings} className="space-y-4">
           <div className="text-center mb-6">
              <span className="text-4xl">💰</span>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Combien voulez-vous mettre de côté ?</p>
           </div>
           <Input 
             type="number" 
             placeholder="Montant (ex: 50)" 
             value={addAmount} 
             onChange={e => setAddAmount(e.target.value)}
             autoFocus
             required
             className="dark:bg-slate-800 dark:text-white dark:border-slate-700"
           />
           <Button type="submit" isLoading={loadingAction}>Confirmer</Button>
        </form>
      </Modal>

      {/* Modal New Goal */}
      <Modal isOpen={isNewGoalOpen} onClose={() => setIsNewGoalOpen(false)} title="Nouvel Objectif">
          <form onSubmit={handleCreateGoal} className="space-y-4">
              <Input 
                label="Nom de l'objectif"
                placeholder="Ex: Voiture"
                value={newGoalName}
                onChange={e => setNewGoalName(e.target.value)}
                required
                className="dark:bg-slate-800 dark:text-white dark:border-slate-700"
              />
              <Input 
                label="Montant cible (€)"
                type="number"
                placeholder="Ex: 5000"
                value={newGoalTarget}
                onChange={e => setNewGoalTarget(e.target.value)}
                required
                className="dark:bg-slate-800 dark:text-white dark:border-slate-700"
              />
              <Button type="submit" isLoading={loadingAction}>Créer l'objectif</Button>
          </form>
      </Modal>
    </div>
  );
};