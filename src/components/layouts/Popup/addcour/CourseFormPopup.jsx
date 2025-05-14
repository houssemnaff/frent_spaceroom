import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CourseForm from "../../addcour/CourseForm";
import CoursePreview from "../../addcour/CoursePreview";
import { useAuth } from "@/pages/auth/authContext";
import { createCourse } from "@/services/coursapi";

const CourseFormPopup = ({ isOpen, onOpenChange, onSubmit, onCancel }) => {
  const [previewData, setPreviewData] = useState({
    title: "Titre du cours",
    subject: "Matière",
    imageUrl: null,
  });
  const { token } = useAuth();

  const handleFormSubmit = async (data) => {
    try {
      //console.log("Données du cours:", data); // Log the data to verify

      // Call the createCourse function from courseApi.js
      const course = await createCourse(data, token);

      // Update the preview data with the newly created course
      setPreviewData((prev) => ({
        ...prev,
        title: course.title,
        subject: course.subject,
        imageUrl: course.imageurl,
      }));

      // Pass the created course to the parent component
      onSubmit(course);

      // Close the popup after successful creation
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur lors de la création du cours", error);
      alert("Échec de la création du cours. Veuillez réessayer.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
 <DialogContent className="p-6 max-w-2xl max-h-[90vh] overflow-y-auto"> {/* Added max-h and overflow */}        
  <DialogHeader>
          <DialogTitle>Créer un cours</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CourseForm
            onCancel={onCancel}
            onSubmit={handleFormSubmit}
            onPreviewUpdate={(data) => setPreviewData((prev) => ({ ...prev, ...data }))}
          />

          <CoursePreview
            title={previewData.title}
            subject={previewData.subject}
            imageUrl={previewData.imageUrl}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourseFormPopup;
