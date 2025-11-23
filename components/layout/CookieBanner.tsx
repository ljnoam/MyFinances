import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { useSettings } from '../../lib/settingsContext';
import { useAuth } from '../../lib/authContext';

export const CookieBanner = () => {
  const { user } = useAuth();
  const { settings, acceptCookies, loading } = useSettings();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Logic:
    // 1. If loading settings, wait.
    // 2. If user logged in: Check Firestore (settings.cookie_consent).
    // 3. If user NOT logged in: Check LocalStorage.
    
    if (loading && user) return;

    const localConsent = localStorage.getItem('cookie_consent') === 'true';
    const remoteConsent = settings?.cookie_consent === true;

    if (user) {
        if (!remoteConsent) setIsVisible(true);
    } else {
        if (!localConsent) setIsVisible(true);
    }
  }, [user, settings, loading]);

  const handleAccept = async () => {
    await acceptCookies();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 animate-in slide-in-from-bottom-full duration-500">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-slate-600 dark:text-slate-300 text-center sm:text-left">
          <p>
            Nous utilisons des cookies essentiels pour assurer le bon fonctionnement de l'application et la sécurité de vos données. 
            <a href="#/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline ml-1">En savoir plus</a>.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={handleAccept} className="w-full sm:w-auto py-2 text-sm">
            J'accepte
          </Button>
        </div>
      </div>
    </div>
  );
};