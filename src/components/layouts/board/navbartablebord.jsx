import React, { useState } from "react";
import { FaPlus, FaUsers } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import ActionListPopup from "../Popup/addcour/ActionListPopup";
import CourseFormPopup from "../Popup/addcour/CourseFormPopup";
import QuizFormPopup from "../quiz/QuizFormPopup";
import JoinQuizPopup from "../quiz/joinQuizPopup";
import Joinform from "../Popup/join/joinform";
import Joinlistpopup from "../Popup/join/joinlistepopup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Navbartablebord = ({ refreshCourses }) => {
  const [isJoinActionDialogOpen, setIsJoinActionDialogOpen] = useState(false);
  const [isAddActionDialogOpen, setIsAddActionDialogOpen] = useState(false);
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [isJoinQuizDialogOpen, setIsJoinQuizDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState("");

  const handleJoinActionClick = (actionTitle) => {
    setSelectedAction(actionTitle);
    if (actionTitle === "Join Course") {
      setIsJoinActionDialogOpen(false);
      setIsJoinDialogOpen(true);
    } else if (actionTitle === "Join Quiz") {
      setIsJoinActionDialogOpen(false);
      setIsJoinQuizDialogOpen(true);
    } else {
      console.log(`Action sélectionnée : ${actionTitle}`);
      setIsJoinActionDialogOpen(false);
    }
  };

  const handleAddActionClick = (actionTitle) => {
    setSelectedAction(actionTitle);
    if (actionTitle === "Create Course") {
      setIsAddActionDialogOpen(false);
      setIsCourseDialogOpen(true);
    } else if (actionTitle === "Create Quiz") {
      setIsAddActionDialogOpen(false);
      setIsQuizDialogOpen(true);
    } else {
      console.log(`Action sélectionnée : ${actionTitle}`);
      setIsAddActionDialogOpen(false);
    }
  };

  const handleCloseDialog = () => {
    setIsCourseDialogOpen(false);
    setIsQuizDialogOpen(false);
    setIsJoinDialogOpen(false);
    setIsJoinQuizDialogOpen(false);
    setSelectedAction("");
  };

  const handleSuccess = (message) => {
    toast.success(message);
    handleCloseDialog();
    refreshCourses();
  };

  return (
    <>
      <nav className="w-full bg-transparent text-black py-4 px-8 max-md:px-5 flex justify-between items-center">
        <div className="flex items-center gap-4 text-base ml-auto">
          <Button
            className="bg-blue-600 text-white flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            onClick={() => setIsJoinActionDialogOpen(true)}
          >
            <FaUsers className="text-xl" />
            <span>Join</span>
          </Button>

          <Button
            className="bg-blue-600 text-white flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            onClick={() => setIsAddActionDialogOpen(true)}
          >
            <FaPlus className="text-xl" />
            <span>Ajouter</span>
          </Button>

          <Joinlistpopup
            isOpen={isJoinActionDialogOpen}
            onOpenChange={setIsJoinActionDialogOpen}
            onActionClick={handleJoinActionClick}
          />

          <ActionListPopup
            isOpen={isAddActionDialogOpen}
            onOpenChange={setIsAddActionDialogOpen}
            onActionClick={handleAddActionClick}
          />

          <CourseFormPopup
            isOpen={isCourseDialogOpen}
            onOpenChange={setIsCourseDialogOpen}
            onSubmit={() => handleSuccess("Course created successfully! 🎉")}
            onCancel={handleCloseDialog}
          />

          <QuizFormPopup
            isOpen={isQuizDialogOpen}
            onOpenChange={setIsQuizDialogOpen}
            onSubmit={() => handleSuccess("Quiz created successfully! 🎉")}
            onCancel={handleCloseDialog}
          />

          <Joinform
            isOpen={isJoinDialogOpen}
            onOpenChange={setIsJoinDialogOpen}
            onSubmit={() => handleSuccess("Joined course successfully! ✅")}
            onCancel={handleCloseDialog}
          />

          <JoinQuizPopup
            isOpen={isJoinQuizDialogOpen}
            onOpenChange={setIsJoinQuizDialogOpen}
            onSubmit={() => handleSuccess("Joined quiz successfully! ✅")}
            onCancel={handleCloseDialog}
          />
        </div>
      </nav>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default Navbartablebord;