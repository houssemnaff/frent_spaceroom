import { Outlet, useNavigate, useParams } from "react-router-dom";
import { CourseHeader } from "@/components/layouts/courbord/CourseHeader";
import { CourseNavigation } from "@/components/layouts/courbord/CourseNavigation";
import { useAuth } from "../auth/authContext";
import { useState, useEffect } from "react";
import axios from "axios";
import NotFound from "../notfound";
import { useTheme } from "../admin/componnents/themcontext"; // Assurez-vous que le chemin est correct

const CoursePage = () => {
  const { id, tab } = useParams();
  const [courseDetails, setCourseDetails] = useState(null);
  const activeTab = tab || "cours";
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/course/${id}`)
      .then(response => {
        if (response.data.course) {
          setCourseDetails(response.data.course);
        } else {
          setCourseDetails(null);
        }
      })
      .catch(error => {
        console.error("Error fetching course details:", error);
        setCourseDetails(null);
      });
  }, [user, id, navigate]);

  if (courseDetails === null) {
    return <NotFound />;
  }

  const isOwner = courseDetails?.owner._id === user?._id;

  return (
    <div className={`w-full min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <main className="flex-1 overflow-y-auto">
        {courseDetails && <CourseHeader course={courseDetails} isDark={isDark} />}
        <CourseNavigation activeTab={activeTab} isDark={isDark} />
        <section className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
          <Outlet context={{ courseDetails, isOwner, isDark }} />
        </section>
      </main>
    </div>
  );
};

export default CoursePage;