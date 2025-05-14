import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Mail,
  Lock, 
  Camera,
  Eye,
  EyeOff,
  Save
} from 'lucide-react';
import { useAuth } from '../auth/authContext';
import { updateUserById } from '@/services/userapi';
import { toast } from 'react-toastify';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SettingsPage = () => {
  const { user, token, setUser } = useAuth();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  
  // États pour le formulaire unique
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  // État pour l'image
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);
  
  // État pour montrer/cacher le mot de passe
  const [showPassword, setShowPassword] = useState(false);

  // Charger les données utilisateur
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: ''
      });
      setImagePreview(user.imageurl || '');
    }
  }, [user]);

  // Nettoyage des URLs d'aperçu
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Gestionnaire de soumission du formulaire
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Le nom ne peut pas être vide');
      return;
    }

    setLoading(true);
    try {
      const updateData = new FormData();
      updateData.append('name', formData.name);
      
      // Ajouter le mot de passe seulement s'il est fourni
      if (formData.password) {
        if (formData.password.length < 6) {
          toast.error('Le mot de passe doit contenir au moins 6 caractères');
          setLoading(false);
          return;
        }
        updateData.append('password', formData.password);
      }
      
      // Ajouter l'image si elle a été modifiée
      if (imageFile) {
        updateData.append('file', imageFile);
      }

      const updatedUser = await updateUserById(user._id, updateData, token);
      setUser(updatedUser);
      setImageFile(null); // Réinitialiser le fichier après mise à jour
      setFormData(prev => ({...prev, password: ''})); // Réinitialiser le mot de passe
      
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner un fichier image');
        return;
      }
      
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      setImageFile(file);
    }
  };

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
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex items-center mb-8 bg-white p-6 rounded-xl shadow-md">
          <h1 className="text-2xl font-bold text-gray-800">Paramètres du compte</h1>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-8">
          <div className="flex flex-col md:flex-row items-center gap-8 mb-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage 
                  src={imagePreview || "https://github.com/shadcn.png"} 
                  alt={formData.name}
                  className="object-cover"
                />
                <AvatarFallback className="text-3xl bg-gray-100">
                  {formData.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              
              <label 
                htmlFor="profile-image" 
                className="absolute bottom-0 right-0 p-2 rounded-full cursor-pointer 
                  bg-primary text-white hover:bg-primary/90
                  transition-all duration-200"
              >
                <Camera className="h-4 w-4" />
                <input 
                  ref={fileInputRef}
                  id="profile-image" 
                  type="file" 
                  accept="image/*" 
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            <div className="flex-grow w-full space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4" />
                  Nom
                </Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  placeholder="Votre nom"
                  className="focus:ring-primary"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input 
                  id="email" 
                  value={formData.email} 
                  disabled
                  className="opacity-60"
                />
                <p className="text-xs text-gray-500">
                  L'email ne peut pas être modifié
                </p>
              </div>

              <div className="grid gap-2 mb-4">
                <Label htmlFor="password" className="flex items-center gap-2 text-gray-600">
                  <Lock className="h-4 w-4" />
                  Mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                    placeholder="Nouveau mot de passe (laisser vide pour ne pas modifier)"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={loading}
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer les modifications
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;