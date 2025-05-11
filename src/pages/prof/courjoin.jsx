import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/pages/auth/authContext";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

const JoinCourse = () => {
  const { accessKey } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, isAuthenticated, user } = useAuth();
  const [status, setStatus] = useState("loading"); // loading, success, error, already_enrolled
  const [message, setMessage] = useState("");
  const [courseId, setCourseId] = useState(null);
  const [courseTitle, setCourseTitle] = useState("");

  useEffect(() => {
    const joinCourse = async () => {
      // If not authenticated, store the current URL for redirect after login
      if (!isAuthenticated) {
        // Store the redirect URL in localStorage or sessionStorage
        sessionStorage.setItem("redirectAfterLogin", location.pathname);
        
        // Redirect to login
        navigate("/login", { replace: true });
        return;
      }

      try {
        setStatus("loading");
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/course/join/${accessKey}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = response.data;
        setMessage(data.message);
        
        if (data.status === "success") {
          setStatus("success");
          setCourseId(data.courseId);
          setCourseTitle(data.courseTitle);
        } else if (data.status === "already_enrolled") {
          setStatus("already_enrolled");
          setCourseId(data.courseId);
        }
      } catch (error) {
        console.error('Error joining course:', error);
        setStatus("error");
        setMessage(error.response?.data?.message || "Une erreur s'est produite lors de la tentative de rejoindre le cours");
      }
    };

    if (accessKey) {
      joinCourse();
    }
  }, [accessKey, isAuthenticated, token, navigate, location.pathname]);

  const handleNavigateToCourse = () => {
    if (courseId) {
      navigate(`/home/course/${courseId}`);
    } else {
      navigate("/home");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Rejoindre un cours</CardTitle>
          <CardDescription>
            {status === "loading" ? "Traitement de votre demande..." : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
            {status === "loading" && (
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            )}
            
            {status === "success" && (
              <>
                <CheckCircle2 className="w-12 h-12 text-green-500 dark:text-green-400" />
                <p className="text-lg font-medium">{message}</p>
                <p>Vous avez rejoint le cours <span className="font-semibold">{courseTitle}</span> avec succès.</p>
              </>
            )}
            
            {status === "already_enrolled" && (
              <>
                <CheckCircle2 className="w-12 h-12 text-blue-500 dark:text-blue-400" />
                <p className="text-lg font-medium">{message}</p>
                <p>Vous pouvez accéder au cours immédiatement.</p>
              </>
            )}
            
            {status === "error" && (
              <>
                <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400" />
                <p className="text-lg font-medium">Impossible de rejoindre le cours</p>
                <p>{message}</p>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          {(status === "success" || status === "already_enrolled") && (
            <Button onClick={handleNavigateToCourse}>
              Accéder au cours
            </Button>
          )}
          
          {status === "error" && (
            <Button variant="outline" onClick={() => navigate("/home")}>
              Retour à l'accueil
            </Button>
          )}
          
          {status === "loading" && (
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Chargement
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default JoinCourse;