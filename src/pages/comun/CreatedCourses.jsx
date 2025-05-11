import React, { useState, useEffect } from "react";

import { useAuth } from "@/pages/auth/authContext";
import axios from "axios";
import Navbartablebord from "@/components/layouts/board/navbartablebord";
import { CourseCard } from "@/components/cards/CourseCard";

 const CreatedCourses = () => {
  const { user, token } = useAuth();
  const [myCourses, setMyCourses] = useState([]);
  const [joinedCourses, setJoinedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        console.log(token);
        const headers = { Authorization: `Bearer ${token}` };

        // Récupérer les cours créés par l'utilisateur
        const myCoursesRes = await axios.get(`${import.meta.env.VITE_API_URL}/course/my-courses`, { headers });
        console.log("Mes cours créés", myCoursesRes.data);
        setMyCourses(myCoursesRes.data.courses || []);

      } catch (error) {
        console.error("Erreur lors de la récupération des cours :", error);
        setError("Erreur lors de la récupération des cours");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchCourses();
  }, [user]);

  if (loading) {
    return <div>Chargement en cours...</div>;
  }

  if (error) {
    return <div>Erreur: {error}</div>;
  }

  // Fusionner les cours créés et joints
  const allCourses = [...myCourses];


  return (
    <main className="bg-[rgba(0,0,0,0)] flex w-full flex-col items-stretch mx-auto pt-8 pb-[520px] px-8 max-md:max-w-full max-md:pb-[100px] max-md:px-5">
     

      {/* Section Mes Cours */}
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
                        avatar={course.owner.imageurl}
                        isOwner={course.ownerId === user.id} // Vérifier si l'utilisateur est le propriétaire
                      />
                    ))
                  ) : (
                    <p className="col-span-full text-center text-gray-600">
                      Aucun cours disponible.
                    </p>
                  )}
                </div>
              </div>
            </section>
    </main>
  );
};
export default CreatedCourses;