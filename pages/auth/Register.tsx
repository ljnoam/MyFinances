import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, setDoc, writeBatch } from 'firebase/firestore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { useNavigate, Link } from 'react-router-dom';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Consent States
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptAnalytics, setAcceptAnalytics] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptTerms) {
        setError("Vous devez accepter les conditions d'utilisation.");
        return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      // 2. Batch write for Profile and Settings
      const batch = writeBatch(db);
      
      const userRef = doc(db, "users", user.uid);
      batch.set(userRef, {
        uid: user.uid,
        name: name,
        email: email,
        createdAt: new Date().toISOString(),
        currency: 'EUR'
      });

      const settingsRef = doc(db, "users", user.uid, "settings", "preferences");
      batch.set(settingsRef, {
          accept_cgu: true,
          accept_privacy: true,
          analytics_opt_in: acceptAnalytics,
          marketing_opt_in: false,
          created_at: new Date().toISOString()
      });

      await batch.commit();

      navigate('/');
    } catch (err: any) {
      console.error(err);
      let message = "Une erreur est survenue lors de l'inscription.";
      if (err.code === 'auth/email-already-in-use') message = "Cet email est déjà utilisé.";
      if (err.code === 'auth/weak-password') message = "Le mot de passe doit contenir au moins 6 caractères.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Créer un compte</h1>
          <p className="text-slate-500 dark:text-slate-400">Commencez à suivre vos dépenses intelligemment.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
           <Input
            type="text"
            label="Nom complet"
            placeholder="Jean Dupont"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          
          <Input
            type="email"
            label="Email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <Input
            type="password"
            label="Mot de passe"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          <div className="space-y-3 pt-2">
            <Checkbox 
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                label={
                    <span>J'accepte les <Link to="/terms" className="text-indigo-600 dark:text-indigo-400 hover:underline" target="_blank">CGU</Link> et la <Link to="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline" target="_blank">Politique de Confidentialité</Link>.</span>
                }
            />
             <Checkbox 
                checked={acceptAnalytics}
                onChange={(e) => setAcceptAnalytics(e.target.checked)}
                label="J'accepte l'analyse anonyme de mes données (optionnel)."
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm rounded-lg border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}

          <Button type="submit" isLoading={loading}>
            S'inscrire
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};