import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings, 
  Lock, 
  Bell, 
  Shield, 
  LogOut, 
  Edit, 
  Check, 
  X,
  Camera
} from 'lucide-react';
import { useAuth } from '../auth/authContext';
import { updateUserById } from '@/services/userapi';

const SettingsPage = () => {
  const { user, token, logout, setUser } = useAuth();
  
  // État pour le profil avec valeurs par défaut
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: '/api/placeholder/150/150'
  });

  // États pour les différentes sections
  const [editMode, setEditMode] = useState(false);
  const [notifications, setNotifications] = useState({
    emailNotifs: true,
    courseUpdates: true,
    weeklyDigest: false
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Charger les données utilisateur lorsque le composant est monté ou l'utilisateur change
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        avatar: user.imageurl || '/api/placeholder/150/150'
      });
      
      // Si l'utilisateur a des préférences de notification, les charger
      if (user.notifications) {
        setNotifications({
          emailNotifs: user.notifications.emailNotifs || true,
          courseUpdates: user.notifications.courseUpdates || true,
          weeklyDigest: user.notifications.weeklyDigest || false
        });
      }
      
      // Si l'utilisateur a des paramètres de sécurité, les charger
      if (user.security) {
        setSecurity({
          twoFactorAuth: user.security.twoFactorAuth || false
        });
      }
    }
  }, [user]);

  // Gestionnaires de mise à jour
  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Créer un objet FormData pour l'envoi de fichiers
      const formData = new FormData();
      formData.append('name', profile.name);
      formData.append('email', profile.email);
      formData.append('bio', profile.bio);
      
      // Si avatar est modifié et n'est pas une URL (c'est un blob)
      if (profile.avatarFile) {
        formData.append('image', profile.avatarFile);
      }
      
      // Mettre à jour l'utilisateur
      const updatedUser = await updateUserById(user._id, formData, token);
      
      // Mettre à jour l'état global de l'utilisateur
      setUser(updatedUser);
      
      // Afficher un message de succès
      setSuccess('Profil mis à jour avec succès');
      setEditMode(false);
      setLoading(false);
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError('Erreur lors de la mise à jour du profil');
      setLoading(false);
      console.error('Erreur:', err);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Sauvegarder le fichier pour l'envoi ultérieur
      setProfile(prev => ({
        ...prev,
        avatarFile: file
      }));
      
      // Créer une URL d'aperçu pour l'affichage immédiat
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({
          ...prev,
          avatar: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNotificationUpdate = async (key, value) => {
    try {
      setLoading(true);
      
      // Mettre à jour l'état local
      const updatedNotifications = {
        ...notifications,
        [key]: value
      };
      setNotifications(updatedNotifications);
      
      // Préparer les données pour la mise à jour
      const updateData = {
        notifications: updatedNotifications
      };
      
      // Mettre à jour l'utilisateur dans la base de données
      const updatedUser = await updateUserById(user._id, updateData, token);
      
      // Mettre à jour l'état global de l'utilisateur
      setUser(updatedUser);
      
      setLoading(false);
      setSuccess('Préférences de notification mises à jour');
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError('Erreur lors de la mise à jour des notifications');
      setLoading(false);
      console.error('Erreur:', err);
    }
  };

  const handleSecurityUpdate = async (key, value) => {
    try {
      setLoading(true);
      
      // Mettre à jour l'état local
      const updatedSecurity = {
        ...security,
        [key]: value
      };
      setSecurity(updatedSecurity);
      
      // Préparer les données pour la mise à jour
      const updateData = {
        security: updatedSecurity
      };
      
      // Mettre à jour l'utilisateur dans la base de données
      const updatedUser = await updateUserById(user._id, updateData, token);
      
      // Mettre à jour l'état global de l'utilisateur
      setUser(updatedUser);
      
      setLoading(false);
      setSuccess('Paramètres de sécurité mis à jour');
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError('Erreur lors de la mise à jour des paramètres de sécurité');
      setLoading(false);
      console.error('Erreur:', err);
    }
  };

  // Section Paramètres de Profil
  const ProfileSection = () => (
    <div className="bg-white shadow-lg rounded-xl p-8 mb-6 transition-all duration-200 hover:shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <User className="text-blue-600" size={24} />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Paramètres de Profil</h2>
        </div>
        {!editMode ? (
          <button 
            onClick={() => setEditMode(true)}
            className="bg-blue-50 text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition-colors duration-200"
            aria-label="Modifier le profil"
            disabled={loading}
          >
            <Edit size={20} />
          </button>
        ) : (
          <div className="space-x-2 flex">
            <button 
              onClick={handleProfileUpdate}
              className="bg-green-50 text-green-600 hover:bg-green-100 p-2 rounded-lg transition-colors duration-200"
              aria-label="Confirmer les changements"
              disabled={loading}
            >
              <Check size={20} />
            </button>
            <button 
              onClick={() => setEditMode(false)}
              className="bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded-lg transition-colors duration-200"
              aria-label="Annuler les changements"
              disabled={loading}
            >
              <X size={20} />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 mb-4 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 text-green-600 p-3 mb-4 rounded-lg">
          {success}
        </div>
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="relative group">
          <div className="overflow-hidden rounded-full w-28 h-28 bg-gray-100 border-4 border-white shadow-md">
            <img 
              src={profile.avatar} 
              alt="Avatar de profil" 
              className="w-full h-full object-cover"
            />
          </div>
          {editMode && (
            <label 
              htmlFor="avatarUpload"
              className="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-blue-700 transition-colors duration-200"
            >
              <Camera size={18} />
              <input 
                type="file" 
                id="avatarUpload"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={loading}
              />
            </label>
          )}
        </div>

        <div className="flex-grow w-full">
          {!editMode ? (
            <>
              <h3 className="text-xl font-semibold text-gray-800">{profile.name}</h3>
              <p className="text-blue-600">{profile.email}</p>
              <p className="text-gray-500 mt-3 italic">{profile.bio || 'Aucune biographie ajoutée'}</p>
            </>
          ) : (
            <div className="space-y-4 w-full">
              <input 
                type="text" 
                value={profile.name}
                onChange={(e) => setProfile(prev => ({...prev, name: e.target.value}))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Nom"
                disabled={loading}
              />
              <input 
                type="email" 
                value={profile.email}
                onChange={(e) => setProfile(prev => ({...prev, email: e.target.value}))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Email"
                disabled={loading}
              />
              <textarea 
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({...prev, bio: e.target.value}))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                placeholder="Bio"
                rows={3}
                disabled={loading}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Section Notifications
  const NotificationsSection = () => (
    <div className="bg-white shadow-lg rounded-xl p-8 mb-6 transition-all duration-200 hover:shadow-xl">
      <div className="flex items-center space-x-4 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Bell className="text-blue-600" size={24} />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Préférences de Notification</h2>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors duration-200">
          <div>
            <span className="font-medium text-gray-800">Notifications par email</span>
            <p className="text-sm text-gray-500">Recevez des mises à jour par email</p>
          </div>
          <Switch 
            checked={notifications.emailNotifs}
            onChange={() => handleNotificationUpdate('emailNotifs', !notifications.emailNotifs)}
            disabled={loading}
          />
        </div>

        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors duration-200">
          <div>
            <span className="font-medium text-gray-800">Mises à jour de cours</span>
            <p className="text-sm text-gray-500">Notifications pour les nouveaux contenus</p>
          </div>
          <Switch 
            checked={notifications.courseUpdates}
            onChange={() => handleNotificationUpdate('courseUpdates', !notifications.courseUpdates)}
            disabled={loading}
          />
        </div>

        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors duration-200">
          <div>
            <span className="font-medium text-gray-800">Digest hebdomadaire</span>
            <p className="text-sm text-gray-500">Résumé de votre activité chaque semaine</p>
          </div>
          <Switch 
            checked={notifications.weeklyDigest}
            onChange={() => handleNotificationUpdate('weeklyDigest', !notifications.weeklyDigest)}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );

  // Section Sécurité
  const SecuritySection = () => (
    <div className="bg-white shadow-lg rounded-xl p-8 mb-6 transition-all duration-200 hover:shadow-xl">
      <div className="flex items-center space-x-4 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Shield className="text-blue-600" size={24} />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Paramètres de Sécurité</h2>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors duration-200">
          <div>
            <h3 className="font-medium text-gray-800">Authentification à deux facteurs</h3>
            <p className="text-sm text-gray-500">
              Sécurisez votre compte avec une couche supplémentaire de protection
            </p>
          </div>
          <Switch 
            checked={security.twoFactorAuth}
            onChange={() => handleSecurityUpdate('twoFactorAuth', !security.twoFactorAuth)}
            disabled={loading}
          />
        </div>

        <button 
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
          onClick={() => {/* Navigation vers la page de changement de mot de passe */}}
          disabled={loading}
        >
          <Lock size={18} />
          Changer le mot de passe
        </button>
      </div>
    </div>
  );

  // Composant Switch personnalisé
  const Switch = ({ checked, onChange, disabled }) => (
    <label className={`relative inline-flex items-center ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <input 
        type="checkbox" 
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
  );

  // Si l'utilisateur n'est pas chargé, afficher un indicateur de chargement
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center mb-8 bg-white p-6 rounded-xl shadow-md">
          <div className="bg-blue-500 p-3 rounded-lg mr-4">
            <Settings className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Paramètres du compte</h1>
        </div>

        <div className="grid gap-6">
          <ProfileSection />
          <NotificationsSection />
          <SecuritySection />

          <div className="bg-white shadow-lg rounded-xl p-8 transition-all duration-200 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-red-100 p-2 rounded-lg">
                  <LogOut className="text-red-600" size={24} />
                </div>
                <span className="font-medium text-gray-800">Déconnexion</span>
              </div>
              <button 
                className="bg-red-600 text-white px-5 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                onClick={logout}
                disabled={loading}
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;