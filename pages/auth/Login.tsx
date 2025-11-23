import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useNavigate, Link } from 'react-router-dom';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirection gérée par le composant de protection de route, 
      // mais on peut forcer la navigation pour être sûr
      navigate('/');
    } catch (err: any) {
      console.error(err);
      let message = "Une erreur est survenue lors de la connexion.";
      if (err.code === 'auth/invalid-credential') {
        message = "Email ou mot de passe incorrect.";
      } else if (err.code === 'auth/too-many-requests') {
        message = "Trop de tentatives. Veuillez réessayer plus tard.";
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 bg-slate-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Bon retour !</h1>
          <p className="text-slate-500">Connectez-vous pour gérer vos finances.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input
            type="email"
            label="Email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <div className="space-y-1">
             <Input
              type="password"
              label="Mot de passe"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="flex justify-end">
              <button type="button" className="text-xs text-indigo-600 font-medium">
                Mot de passe oublié ?
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <Button type="submit" isLoading={loading}>
            Se connecter
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
};