import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/pages/auth/authContext";
import { toast } from "react-toastify";

const JoinCourse = () => {
  const { accessKey } = useParams();
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const joinCourse = async () => {
      try {
        if (!isAuthenticated) {
          // Si non authentifié, sauvegarder la clé et rediriger vers le login
          localStorage.setItem("joinCourseKey", accessKey);
          navigate("/login");
          return;
        }

        // Si authentifié, rejoindre directement le cours
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/course/join/${accessKey}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success(response.data.message || "Vous avez rejoint le cours avec succès!");
        navigate("/home");
      } catch (error) {
        console.error("Error joining course:", error);
        let errorMessage = "Une erreur est survenue";

        if (error.response) {
          switch (error.response.data.message) {
            case "Vous avez déjà rejoint ce cours":
              errorMessage = "Vous avez déjà rejoint ce cours";
              break;
            case "Clé d'accès incorrecte ou cours introuvable":
              errorMessage = "Lien d'invitation invalide ou expiré";
              break;
            default:
              errorMessage = error.response.data.message;
          }
        }

        toast.error(errorMessage);
        navigate("/home");
      }
    };

    if (accessKey) {
      joinCourse();
    }
  }, [accessKey, isAuthenticated, token, navigate]);

  return null; // Ce composant ne rend rien, il gère seulement la logique
};

export default JoinCourse;