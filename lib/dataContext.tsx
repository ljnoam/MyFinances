import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  doc, 
  Timestamp, 
  setDoc,
  getDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './authContext';

// --- Types ---
export type TransactionType = 'expense' | 'income';
// On passe à un type string pour permettre les catégories personnalisées
export type Category = string; 

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: Date;
  title: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
  color: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number; // Calculated field
  pct: number;   // Calculated field
}

export interface Insight {
  id: string;
  type: 'alert' | 'success' | 'info';
  title: string;
  message: string;
  metric?: string;
  date: Date;
}

interface DataContextType {
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  budgets: Budget[];
  insights: Insight[];
  categories: string[];
  loading: boolean;
  addTransaction: (t: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (t: Transaction) => Promise<void>;
  addSavingsGoal: (g: Omit<SavingsGoal, 'id' | 'currentAmount'>) => Promise<void>;
  addToSavings: (id: string, amount: number) => Promise<void>;
  updateBudget: (category: string, limit: number) => Promise<void>;
  addCategory: (category: string) => Promise<void>;
  deleteCategory: (category: string) => Promise<void>;
  stats: {
    income: number;
    expense: number;
    balance: number;
  };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};

const DEFAULT_CATEGORIES = ['Alimentation', 'Transport', 'Loisirs', 'Logement', 'Santé', 'Salaire', 'Shopping', 'Autre'];

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [rawBudgets, setRawBudgets] = useState<{id: string, category: string, limit: number}[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  
  // Granular loading states
  const [isUserInitialized, setIsUserInitialized] = useState(false);
  const [txLoading, setTxLoading] = useState(true);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [budgetsLoading, setBudgetsLoading] = useState(true);
  const [catsLoading, setCatsLoading] = useState(true);

  // 1. Initialize User Document (Sequence Start)
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      // Cleanup if logged out
      setTransactions([]);
      setSavingsGoals([]);
      setRawBudgets([]);
      setCategories(DEFAULT_CATEGORIES);
      setIsUserInitialized(false);
      setTxLoading(true);
      setGoalsLoading(true);
      setBudgetsLoading(true);
      setCatsLoading(true);
      return;
    }

    let mounted = true;

    const initUser = async () => {
      const userRef = doc(db, 'users', user.uid);
      try {
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          await setDoc(userRef, { 
            email: user.email, 
            createdAt: new Date().toISOString() 
          });
        }
        if (mounted) setIsUserInitialized(true);
      } catch (err: any) {
        console.error("Error initializing user:", err);
        if (err.code === 'permission-denied') {
            if (mounted) {
                setTxLoading(false);
                setGoalsLoading(false);
                setBudgetsLoading(false);
                setCatsLoading(false);
            }
        }
      }
    };
    initUser();

    return () => { mounted = false; };
  }, [user, authLoading]);

  // 2. Sync Transactions
  useEffect(() => {
    if (!user || !isUserInitialized) return;

    const q = query(
      collection(db, 'users', user.uid, 'transactions'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date)
        };
      }) as Transaction[];
      setTransactions(docs);
      setTxLoading(false);
    }, (err) => {
      console.error("Transactions listener error:", err);
      setTxLoading(false); 
    });

    return () => unsubscribe();
  }, [user, isUserInitialized]);

  // 3. Sync Savings Goals
  useEffect(() => {
    if (!user || !isUserInitialized) return;

    const q = collection(db, 'users', user.uid, 'savings_goals');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SavingsGoal[];
      setSavingsGoals(docs);
      setGoalsLoading(false);
    }, (err) => {
      console.error("Savings listener error:", err);
      setGoalsLoading(false);
    });

    return () => unsubscribe();
  }, [user, isUserInitialized]);

  // 4. Sync Budgets
  useEffect(() => {
    if (!user || !isUserInitialized) return;

    const q = collection(db, 'users', user.uid, 'budgets');
    const unsubscribe = onSnapshot(q, async (snapshot) => {
        const docs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as {id: string, category: string, limit: number}[];
        
        if (docs.length === 0 && !snapshot.metadata.fromCache) {
             const batch = writeBatch(db);
             const defaults = [
                 { category: 'Alimentation', limit: 400 },
                 { category: 'Loisirs', limit: 150 },
                 { category: 'Transport', limit: 100 },
                 { category: 'Shopping', limit: 200 },
             ];
             defaults.forEach(d => {
                 const ref = doc(db, 'users', user.uid, 'budgets', d.category);
                 batch.set(ref, d);
             });
             try {
                await batch.commit();
             } catch(e) { console.warn("Could not create default budgets", e); }
        } else {
            setRawBudgets(docs);
        }
        setBudgetsLoading(false);
    }, (err) => {
      console.error("Budgets listener error:", err);
      setBudgetsLoading(false);
    });
    return () => unsubscribe();
  }, [user, isUserInitialized]);

  // 5. Sync Categories (Stored in settings doc)
  useEffect(() => {
    if (!user || !isUserInitialized) return;
    const catsRef = doc(db, 'users', user.uid, 'settings', 'categories');
    
    const unsubscribe = onSnapshot(catsRef, async (snap) => {
        if (snap.exists()) {
            const data = snap.data();
            if (data.list && Array.isArray(data.list)) {
                setCategories(data.list);
            }
        } else {
            // Create default if not exists
            try {
                await setDoc(catsRef, { list: DEFAULT_CATEGORIES });
                setCategories(DEFAULT_CATEGORIES);
            } catch (e) {
                console.warn("Could not init categories", e);
            }
        }
        setCatsLoading(false);
    }, (err) => {
        console.error("Categories fetch error", err);
        setCatsLoading(false);
    });

    return () => unsubscribe();
  }, [user, isUserInitialized]);


  // --- CRUD Operations ---

  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'transactions'), {
      ...t,
      date: Timestamp.fromDate(t.date)
    });
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
  };

  const updateTransaction = async (t: Transaction) => {
    if (!user) return;
    const { id, ...data } = t;
    await updateDoc(doc(db, 'users', user.uid, 'transactions', id), {
      ...data,
      date: Timestamp.fromDate(data.date)
    });
  };

  const addSavingsGoal = async (g: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'savings_goals'), {
      ...g,
      currentAmount: 0
    });
  };

  const addToSavings = async (id: string, amount: number) => {
    if (!user) return;
    const goalRef = doc(db, 'users', user.uid, 'savings_goals', id);
    const goal = savingsGoals.find(g => g.id === id);
    if (goal) {
      await updateDoc(goalRef, {
        currentAmount: goal.currentAmount + amount
      });
    }
  };

  const updateBudget = async (category: string, limit: number) => {
      if (!user) return;
      if (limit < 0) {
        // Implies deletion logic if handled by caller, but keeping clean update here.
        // For deletion, use direct deleteDoc in component or separate method if needed.
        // We will stick to standard setDoc which creates or overwrites.
        await deleteDoc(doc(db, 'users', user.uid, 'budgets', category));
      } else {
        await setDoc(doc(db, 'users', user.uid, 'budgets', category), {
            category,
            limit
        });
      }
  };

  const addCategory = async (category: string) => {
      if (!user) return;
      if (categories.includes(category)) return;
      const newList = [...categories, category];
      await setDoc(doc(db, 'users', user.uid, 'settings', 'categories'), { list: newList }, { merge: true });
  };

  const deleteCategory = async (category: string) => {
      if (!user) return;
      const newList = categories.filter(c => c !== category);
      await setDoc(doc(db, 'users', user.uid, 'settings', 'categories'), { list: newList }, { merge: true });
  };


  // --- ENGINE: Calculated Logic ---

  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const calculatedBudgets = useMemo(() => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const monthlySpending = transactions
        .filter(t => 
            t.type === 'expense' && 
            t.date.getMonth() === currentMonth && 
            t.date.getFullYear() === currentYear
        )
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

      return rawBudgets.map(b => ({
          ...b,
          spent: monthlySpending[b.category] || 0,
          pct: b.limit > 0 ? (monthlySpending[b.category] || 0) / b.limit : 0
      }));
  }, [transactions, rawBudgets]);

  const insights = useMemo(() => {
      const results: Insight[] = [];
      const now = new Date();
      
      const getMonthTotal = (monthOffset: number) => {
          const targetDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
          return transactions
            .filter(t => 
                t.type === 'expense' && 
                t.date.getMonth() === targetDate.getMonth() && 
                t.date.getFullYear() === targetDate.getFullYear()
            )
            .reduce((acc, t) => acc + t.amount, 0);
      };

      const currentMonthTotal = getMonthTotal(0);
      
      // 1. Budget Alerts
      calculatedBudgets.forEach(b => {
          if (b.spent > b.limit) {
              results.push({
                  id: `budget-over-${b.category}`,
                  type: 'alert',
                  title: 'Budget dépassé',
                  message: `Vous avez dépassé votre budget ${b.category} de ${(b.spent - b.limit).toFixed(0)}€.`,
                  metric: `${Math.round(b.pct * 100)}%`,
                  date: now
              });
          } else if (b.pct > 0.8) {
               results.push({
                  id: `budget-warn-${b.category}`,
                  type: 'info',
                  title: 'Attention Budget',
                  message: `Vous avez consommé 80% de votre budget ${b.category}.`,
                  metric: `${(b.limit - b.spent).toFixed(0)}€ restants`,
                  date: now
              });
          }
      });

      // 2. Spending Trends
      const lastMonthTotal = getMonthTotal(1);
      const twoMonthsAgoTotal = getMonthTotal(2);
      const threeMonthsAgoTotal = getMonthTotal(3);
      const average3Months = (lastMonthTotal + twoMonthsAgoTotal + threeMonthsAgoTotal) / 3;

      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const currentDay = now.getDate();
      
      if (currentDay > 5 && average3Months > 0) {
          const projection = (currentMonthTotal / currentDay) * daysInMonth;
          const diffVsAvg = projection - average3Months;
          
          if (projection > average3Months * 1.2) {
              results.push({
                  id: 'high-spending',
                  type: 'alert',
                  title: 'Dépenses élevées',
                  message: `Vos dépenses prévues (${projection.toFixed(0)}€) sont 20% plus élevées que votre moyenne habituelle.`,
                  metric: `+${Math.round((diffVsAvg/average3Months)*100)}%`,
                  date: now
              });
          } else if (projection < average3Months * 0.8) {
               results.push({
                  id: 'good-saving',
                  type: 'success',
                  title: 'Bonnes économies',
                  message: `Continuez comme ça ! Vous dépensez moins que d'habitude.`,
                  metric: `-${Math.round((1 - projection/average3Months)*100)}%`,
                  date: now
              });
          }
      }

      return results;
  }, [calculatedBudgets, transactions]);

  // Combined loading state
  const globalLoading = authLoading || (user ? (txLoading || goalsLoading || budgetsLoading || catsLoading) : false);

  return (
    <DataContext.Provider value={{
      transactions,
      savingsGoals,
      budgets: calculatedBudgets,
      insights,
      categories,
      loading: globalLoading,
      addTransaction,
      deleteTransaction,
      updateTransaction,
      addSavingsGoal,
      addToSavings,
      updateBudget,
      addCategory,
      deleteCategory,
      stats
    }}>
      {children}
    </DataContext.Provider>
  );
};