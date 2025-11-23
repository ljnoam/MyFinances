import React, { useState, useRef } from 'react';
import { useAuth } from '../../lib/authContext';
import { useTheme } from '../../lib/themeContext';
import { useSettings } from '../../lib/settingsContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Toggle } from '../../components/ui/Toggle';
import { ChevronDownIcon, EditIcon } from '../../components/ui/Icons';
import { Link } from 'react-router-dom';

const AccordionItem = ({ title, children, isOpen, onClick }: { title: string, children: React.ReactNode, isOpen: boolean, onClick: () => void }) => {
  return (
    <div className="border-b border-border last:border-0">
      <button 
        onClick={onClick}
        className="w-full flex items-center justify-between py-4 px-1 text-left hover:bg-secondary/50 transition-colors rounded-lg"
      >
        <span className="font-medium text-foreground">{title}</span>
        <ChevronDownIcon className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
        <div className="pt-2 pb-2 px-1 text-sm text-muted-foreground">
          {children}
        </div>
      </div>
    </div>
  );
};

export const Profile = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { settings, updateSettings, updateUserProfile, exportData, deleteAccount } = useSettings();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  // Edit Profile States
  const [editName, setEditName] = useState(user?.displayName || '');
  const [editFile, setEditFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user || !settings) return null;

  const joinDate = new Date(settings.created_at).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric'
  });

  const toggleAccordion = (id: string) => {
      setOpenAccordion(openAccordion === id ? null : id);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile(editName, editFile);
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Avatar Logic: 1. Preview, 2. Settings URL, 3. Initials
  const avatarSrc = previewUrl || settings.avatar_url || user.photoURL;

  return (
    <div className="min-h-screen pb-32 pt-6 px-4 space-y-8 max-w-lg mx-auto">
      
      {/* 2.1 Header Profil */}
      <div className="bg-card text-card-foreground rounded-2xl p-6 shadow-sm border border-border flex flex-col items-center text-center relative">
        <button 
            onClick={() => {
                setEditName(user.displayName || '');
                setEditFile(null);
                setPreviewUrl(null);
                setShowEditModal(true);
            }}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-primary transition-colors"
        >
            <EditIcon className="w-5 h-5" />
        </button>

        <div className="relative mb-4">
            {avatarSrc ? (
                <img 
                    src={avatarSrc} 
                    alt="Avatar" 
                    className="h-24 w-24 rounded-full object-cover border-2 border-primary/20"
                />
            ) : (
                <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center text-primary text-3xl font-bold border-2 border-primary/20">
                    {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                </div>
            )}
        </div>

        <h2 className="text-2xl font-bold tracking-tight">{settings.display_name || user.displayName || 'Utilisateur'}</h2>
        <p className="text-muted-foreground font-medium">{user.email}</p>
        <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
          Membre depuis {joinDate}
        </div>
      </div>

      {/* 2.2 Préférences */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider ml-1">Préférences</h3>
        <div className="bg-card text-card-foreground rounded-2xl shadow-sm border border-border p-5 space-y-4">
            <Toggle 
              checked={theme === 'dark'} 
              onChange={toggleTheme} 
              label="Mode Sombre" 
              description="Basculer entre l'apparence claire et sombre" 
            />
            <div className="h-px bg-border w-full" />
            <Toggle 
              checked={settings.analytics_opt_in} 
              onChange={(v) => updateSettings({ analytics_opt_in: v })} 
              label="Analyses & Améliorations" 
              description="Partager des statistiques anonymes pour nous aider" 
            />
        </div>
      </div>

      {/* 2.3 Centre de Confidentialité */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider ml-1">Confidentialité & Données</h3>
        <div className="bg-card text-card-foreground rounded-2xl shadow-sm border border-border px-5 py-2">
            
            <AccordionItem 
                title="Politique de confidentialité" 
                isOpen={openAccordion === 'privacy'} 
                onClick={() => toggleAccordion('privacy')}
            >
                <div className="space-y-3">
                    <p>Vos données sont stockées de manière sécurisée et chiffrée. Nous ne vendons pas vos informations.</p>
                    <Link to="/privacy" className="text-primary font-semibold hover:underline block">
                        Lire le document complet
                    </Link>
                </div>
            </AccordionItem>

            <AccordionItem 
                title="Conditions d'utilisation" 
                isOpen={openAccordion === 'terms'} 
                onClick={() => toggleAccordion('terms')}
            >
                <div className="space-y-3">
                    <p>En utilisant MyFinance, vous acceptez nos conditions de service régissant l'utilisation de la plateforme.</p>
                    <Link to="/terms" className="text-primary font-semibold hover:underline block">
                        Lire les CGU
                    </Link>
                </div>
            </AccordionItem>

            <AccordionItem 
                title="Exporter mes données" 
                isOpen={openAccordion === 'export'} 
                onClick={() => toggleAccordion('export')}
            >
                <div className="space-y-3">
                    <p>Récupérez une copie complète de vos transactions, budgets et paramètres au format JSON standard.</p>
                    <Button variant="outline" onClick={exportData} className="w-full justify-center">
                        Télécharger l'archive JSON
                    </Button>
                </div>
            </AccordionItem>
            
            <div className="border-b border-border last:border-0">
                <button 
                    onClick={() => toggleAccordion('delete')}
                    className="w-full flex items-center justify-between py-4 px-1 text-left hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors rounded-lg group"
                >
                    <span className="font-medium text-red-600 group-hover:text-red-700">Supprimer mon compte</span>
                    <ChevronDownIcon className={`w-4 h-4 text-red-300 transition-transform duration-200 ${openAccordion === 'delete' ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openAccordion === 'delete' ? 'max-h-96 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
                    <div className="pt-2 pb-2 px-1 text-sm text-muted-foreground">
                        <p className="mb-3 text-red-500">Zone de danger : Cette action est irréversible.</p>
                        <Button 
                            variant="primary" 
                            className="w-full bg-red-600 hover:bg-red-700 text-white shadow-red-200 dark:shadow-none"
                            onClick={() => setShowDeleteModal(true)}
                        >
                            Supprimer définitivement
                        </Button>
                    </div>
                </div>
            </div>

        </div>
      </div>

      {/* 2.4 Logout */}
      <div className="pt-4">
        <Button 
            variant="secondary" 
            onClick={logout} 
            className="w-full py-4 rounded-xl text-base font-medium shadow-sm border border-border bg-card hover:bg-secondary text-foreground"
        >
            Se déconnecter
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-4">MyFinance Tracker v1.2.0 (PWA)</p>
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Modifier le profil">
        <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="flex flex-col items-center gap-4">
                <div 
                    className="relative w-24 h-24 rounded-full bg-secondary flex items-center justify-center overflow-hidden cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {(previewUrl || settings.avatar_url) ? (
                        <img src={previewUrl || settings.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-2xl font-bold text-muted-foreground">
                             {editName ? editName[0].toUpperCase() : 'U'}
                        </span>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <EditIcon className="text-white w-6 h-6" />
                    </div>
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/png, image/jpeg" 
                />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm text-primary font-medium">
                    Changer la photo
                </button>
            </div>

            <Input 
                label="Nom d'utilisateur"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
            />

            <Button type="submit" isLoading={isSaving}>Sauvegarder</Button>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Supprimer le compte">
         <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-red-800 dark:text-red-200 text-sm border border-red-100 dark:border-red-900/30">
                Attention : Cette action est irréversible. Toutes vos données seront effacées.
            </div>
            <p className="text-sm text-muted-foreground">
                Pour confirmer, veuillez taper <strong>SUPPRIMER</strong> ci-dessous.
            </p>
            <input 
               type="text" 
               className="w-full border border-input rounded-lg p-2 bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
               placeholder="SUPPRIMER"
               value={deleteInput}
               onChange={e => setDeleteInput(e.target.value)}
            />
            <Button 
                variant="primary" 
                className="bg-red-600 hover:bg-red-700 text-white w-full shadow-lg shadow-red-200 dark:shadow-none"
                disabled={deleteInput !== 'SUPPRIMER'}
                onClick={deleteAccount}
            >
                Confirmer la suppression
            </Button>
         </div>
      </Modal>
    </div>
  );
};