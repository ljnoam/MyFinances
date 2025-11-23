import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import { ChevronRightIcon } from '../../components/ui/Icons';

// -- Page Header for PWA Navigation --
const PageHeader = ({ title, backTo }: { title: string, backTo?: string }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // If user is not logged in, force back to login/home instead of profile
    const effectiveBackTo = user ? (backTo || '/profile') : '/login';

    return (
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-2">
            <button 
                onClick={() => navigate(effectiveBackTo)}
                className="flex items-center text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:opacity-80 transition-opacity"
            >
                <ChevronRightIcon className="w-5 h-5 rotate-180" />
                Retour
            </button>
            <h1 className="text-base font-bold text-slate-900 dark:text-white flex-1 text-center pr-12 truncate">{title}</h1>
        </div>
    );
};

const Layout = ({ title, date, children, backTo }: { title: string, date: string, children: React.ReactNode, backTo?: string }) => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
    <PageHeader title={title} backTo={backTo} />
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">Mise à jour : {date}</p>
        <div className="prose dark:prose-invert prose-slate max-w-none text-sm leading-relaxed text-justify">
            {children}
        </div>
      </div>
    </div>
  </div>
);

export const PrivacyPolicy = () => (
  <Layout title="Confidentialité" date="23 Novembre 2025">
    <h3 className="text-lg font-bold mt-6 mb-2 text-slate-900 dark:text-white">1. Collecte des données</h3>
    <p>Nous collectons uniquement les données strictement nécessaires au fonctionnement de l'application : votre email, votre identifiant unique, et les données financières que vous saisissez (transactions, budgets). Ces données sont stockées de manière sécurisée sur les serveurs de Google Firebase en Europe.</p>
    
    <h3 className="text-lg font-bold mt-6 mb-2 text-slate-900 dark:text-white">2. Utilisation des données</h3>
    <p>Vos données ne sont utilisées que pour vous fournir le service de suivi financier. Nous ne revendons, n'échangeons et ne transférons aucune de vos données personnelles à des tiers à des fins commerciales.</p>
    
    <h3 className="text-lg font-bold mt-6 mb-2 text-slate-900 dark:text-white">3. Vos droits (RGPD)</h3>
    <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de portabilité et d'effacement de vos données. Vous pouvez exercer ces droits directement depuis votre espace Profil ou en nous contactant.</p>
  </Layout>
);

export const Terms = () => (
  <Layout title="Conditions d'utilisation" date="23 Novembre 2025">
    <h3 className="text-lg font-bold mt-6 mb-2 text-slate-900 dark:text-white">1. Objet</h3>
    <p>Les présentes CGU régissent l'utilisation de l'application MyFinance Tracker. L'accès à l'application implique l'acceptation sans réserve de ces conditions.</p>
    
    <h3 className="text-lg font-bold mt-6 mb-2 text-slate-900 dark:text-white">2. Responsabilité</h3>
    <p>L'application est un outil d'aide à la gestion. Nous ne saurions être tenus responsables des décisions financières prises sur la base des informations fournies par l'application. L'utilisateur est seul responsable de la confidentialité de ses identifiants.</p>
  </Layout>
);

export const Security = () => (
  <Layout title="Sécurité" date="23 Novembre 2025">
    <div className="space-y-6">
      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800">
        <h4 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2">🔒 Chiffrement</h4>
        <p className="text-indigo-800 dark:text-indigo-200">Toutes les communications entre votre appareil et nos serveurs sont chiffrées via HTTPS (TLS 1.2+). Vos données sont chiffrées au repos dans nos bases de données.</p>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800">
        <h4 className="font-bold text-green-900 dark:text-green-300 mb-2">🛡️ Isolation</h4>
        <p className="text-green-800 dark:text-green-200">Nous utilisons des règles de sécurité strictes (Firestore Rules) garantissant que seul VOTRE compte peut lire ou écrire VOS données. Aucune fuite croisée entre utilisateurs n'est possible.</p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
        <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-2">🇪🇺 Souveraineté</h4>
        <p className="text-blue-800 dark:text-blue-200">L'infrastructure repose sur Google Cloud Platform, avec une conformité aux standards ISO 27001 et SOC 2.</p>
      </div>
    </div>
  </Layout>
);