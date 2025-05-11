import React, { useState, useEffect } from "react";
import { CourseCard } from "../../components/cards/CourseCard";
import Navbartablebord from "../../components/layouts/board/navbartablebord";
import { useAuth } from "@/pages/auth/authContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { fetchJoinedCourses, fetchMyCourses } from "@/services/coursapi";
import { getJoinedQuizzes, getMyQuizzes } from "@/services/quizapi";
import QuizCard from "@/components/cards/QuizCard";
import { toast } from "react-toastify";
export const MainContent = () => {
  const { user, token } = useAuth();
  const [myCourses, setMyCourses] = useState([]);
  const [joinedCourses, setJoinedCourses] = useState([]);
  const [joinedquiz, setJoinedquiz] = useState([]);
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizzesLoading, setQuizzesLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour rafraîchir les cours
  const refreshCourses = async () => {
    try {
      setLoading(true);
      const [myCoursesData, joinedCoursesData] = await Promise.all([
        fetchMyCourses(token),
        fetchJoinedCourses(token),
      ]);
      setMyCourses(myCoursesData);
      setJoinedCourses(joinedCoursesData);
    } catch (error) {
      console.error("Erreur lors de la récupération des cours :", error);
      setError(error.message || "Une erreur est survenue");
      toast.error("Erreur lors du chargement des cours");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer les quiz de l'utilisateur
  const fetchUserQuizzes = async () => {
    try {
      setQuizzesLoading(true);
      const quizzes = await getMyQuizzes(token);
      const quizzesjoined = await getJoinedQuizzes(token);

      setJoinedquiz(quizzesjoined);
      setMyQuizzes(quizzes);
    } catch (error) {
      console.error("Erreur lors de la récupération des quiz :", error);
      setError(error.message || "Une erreur est survenue lors du chargement des quiz");
      toast.error("Erreur lors du chargement des quiz");
    } finally {
      setQuizzesLoading(false);
    }
  };

  // Charger les cours et les quiz au montage du composant
  useEffect(() => {
    if (user) {
      refreshCourses();
     // fetchUserQuizzes();
    }
  }, [user, token]);

  // Handler when a course is deleted
  const handleCourseDeleted = (courseId) => {
    setMyCourses(currentCourses => currentCourses.filter(course => course._id !== courseId));
  };

  // Handler when a user leaves a course
  const handleCourseLeft = (courseId) => {
    setJoinedCourses(currentCourses => currentCourses.filter(course => course._id !== courseId));
  };

  const allCourses = [...myCourses, ...joinedCourses];
  console.log("course",allCourses);

  const allquiz = [...myQuizzes, ...joinedquiz];

  // Format date pour affichage
  const formatDate = (dateString) => {
    if (!dateString) return "Non définie";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Déterminer le statut du quiz
  const getQuizStatus = (quiz) => {
    const now = new Date();
    const openingDate = quiz.openingDate ? new Date(quiz.openingDate) : null;
    const closingDate = quiz.closingDate ? new Date(quiz.closingDate) : null;
    
    if (!openingDate && !closingDate) return "actif";
    if (openingDate && now < openingDate) return "à venir";
    if (closingDate && now > closingDate) return "terminé";
    return "actif";
  };

  return (
    <main className="flex flex-col items-stretch w-full mx-auto p-4 md:p-6 lg:p-8 bg-transparent">
      {/* Navbar avec un espacement réduit */}
      <div className="pb-4">
        <Navbartablebord refreshCourses={refreshCourses} refreshQuizzes={fetchUserQuizzes} />
      </div>

      {/* Section Mes Cours */}
      <section className="mt-6">
        <h2 className="text-black text-lg md:text-xl font-semibold">Mes Cours</h2>
        <div className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              [...Array(3)].map((_, index) => (
                <Skeleton key={index} height={100} className="rounded-lg" />
              ))
            ) : allCourses.length > 0 ? (
              allCourses.map((course) => (
                <CourseCard
                  key={course._id}
                  id={course._id}
                  icon={course.imageurl}
                  title={course.title}
                  professor={course.owner.name}
                  ownerid={course.owner._id}
                  students={course.students.length}
                  description={course.description}
                  avatar={course.owner.imageurl}
                  isOwner={course.owner._id === user._id}
                  onCourseDeleted={handleCourseDeleted}
                  onCourseLeft={handleCourseLeft}
                />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-600">
                Aucun cours disponible.
              </p>
            )}
          </div>
        </div>

        {/* Section Mes Quiz
        <div className="mt-8">
          <h2 className="text-black text-lg md:text-xl font-semibold">Mes Quiz</h2>
          <div className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {quizzesLoading ? (
                [...Array(3)].map((_, index) => (
                  <Skeleton key={`quiz-skeleton-${index}`} height={100} className="rounded-lg" />
                ))
              ) : allquiz.length > 0 ? (
                allquiz?.map((quiz) => (
                  <QuizCard
                    key={quiz._id}
                    id={quiz._id}
                    icon="/quiz-icon.png"
                    title={quiz.title}
                    description={quiz.description || "Aucune description"}
                    status={getQuizStatus(quiz)}
                    openingDate={formatDate(quiz.openingDate)}
                    closingDate={formatDate(quiz.closingDate)}
                    timeLimit={quiz.timeLimit ? `${quiz.timeLimit} min` : "Pas de limite"}
                  />
                ))
              ) : (
                <p className="col-span-full text-center text-gray-600">
                  Aucun quiz disponible. Créez votre premier quiz !
                </p>
              )}
            </div>
          </div>
        </div>
         */}
      </section>
    </main>
  );
};