import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";

export const CTASection = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Ici vous devriez appeler votre API d'inscription
      // const response = await axios.post('/api/register', formData);
      console.log("Form submitted:", formData);
      toast.success("Inscription réussie !");
      // Redirection après inscription réussie
      navigate("/home");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section className="w-full bg-blue-600 px-6 py-16 sm:px-10 md:px-20">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white">
          Rejoignez plus de 10 000 étudiants et enseignants
        </h2>
        <p className="mt-4 text-lg text-blue-100">
          Inscrivez-vous maintenant pour profiter de tous nos outils pédagogiques.
        </p>

        <div className="mt-10 bg-white rounded-xl p-8 shadow-lg max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="name" className="text-sm font-medium">
                Nom complet
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Votre nom complet"
                value={formData.name}
                onChange={handleChange}
                className="h-11 rounded-lg"
                required
              />
            </div>

            <div className="space-y-2 text-left">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={handleChange}
                className="h-11 rounded-lg"
                required
              />
            </div>

            <div className="space-y-2 text-left">
              <Label htmlFor="password" className="text-sm font-medium">
                Mot de passe
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Créez un mot de passe"
                value={formData.password}
                onChange={handleChange}
                className="h-11 rounded-lg"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-medium rounded-lg bg-blue-600 hover:bg-blue-700 mt-4"
              disabled={isLoading}
            >
              {isLoading ? "Inscription en cours..." : "Créer mon compte"}
            </Button>
          </form>

          <p className="mt-4 text-sm text-gray-600">
            En vous inscrivant, vous acceptez nos{" "}
            <button 
              type="button" 
              className="text-blue-600 hover:underline"
              onClick={() => navigate("/terms")}
            >
              Conditions d'utilisation
            </button>.
          </p>
        </div>
      </div>
    </section>
  );
};