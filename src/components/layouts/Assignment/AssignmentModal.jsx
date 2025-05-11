import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/pages/auth/authContext";
import { X, Upload, File, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { createAssignment, updateAssignment } from "@/services/assigmentapi";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import AIAssignmentGeneratorDialog from "./aiassigmentemodal";

const AssignmentModal = ({ isOpen, onClose, assignment, courseId }) => {
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState([]);
  const { toast } = useToast();
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    maxPoints: 100,
  });

  useEffect(() => {
    if (assignment) {
      const dueDate = new Date(assignment.dueDate);
      const localDueDate = format(dueDate, "yyyy-MM-dd'T'HH:mm");
      
      setFormData({
        title: assignment.title,
        description: assignment.description,
        dueDate: localDueDate,
        maxPoints: assignment.maxPoints,
      });
    } else {
      // Initialiser la date d'échéance à une semaine plus tard par défaut
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const defaultDueDate = format(nextWeek, "yyyy-MM-dd'T'HH:mm");
      
      setFormData({
        title: "",
        description: "",
        dueDate: defaultDueDate,
        maxPoints: 100,
      });
    }
  }, [assignment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };
// Dans la fonction handleSubmit de AssignmentModal.jsx

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setIsSubmitting(true);

  try {
    const assignmentData = {
      ...formData,
      courseId,
      attachments: files,
    };

    let response;
    if (assignment) {
      response = await updateAssignment(assignment._id, assignmentData, token);
      toast({
        title: "Devoir mis à jour",
        description: `Le devoir "${formData.title}" a été modifié avec succès.`,
        variant: "default",
        action: <ToastAction altText="Fermer">Fermer</ToastAction>,
      });
    } else {
      response = await createAssignment(assignmentData, token);
      toast({
        title: "Nouveau devoir créé",
        description: `Le devoir "${formData.title}" a été créé avec succès.`,
        variant: "default",
        action: <ToastAction altText="Fermer">Fermer</ToastAction>,
      });
    }

    // Passer le devoir créé/mis à jour à la fonction onClose
    onClose(response.data || response);
  } catch (error) {
    setError(error.message || "Une erreur est survenue");
  } finally {
    setIsSubmitting(false);
  }
};

  const handleAIGenerated = (generatedData) => {
    setFormData({
      ...formData,
      title: generatedData.title,
      description: generatedData.description,
      maxPoints: generatedData.maxPoints,
      // La date d'échéance est déjà initialisée ou préservée
    });
    
    toast({
      title: "Devoir généré avec succès",
      description: "Vous pouvez maintenant modifier les détails avant de créer le devoir.",
      variant: "default",
      action: <ToastAction altText="Fermer">Fermer</ToastAction>,
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{assignment ? "Modifier le devoir" : "Créer un nouveau devoir"}</span>
              {!assignment && (
                <Button 
                  type="button" 
                  variant="outline" 
                  className="ml-auto flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                  onClick={() => setIsAIDialogOpen(true)}
                >
                  <Sparkles className="h-4 w-4" />
                  Générer avec l'IA
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-500 text-sm">{error}</div>}

            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Date limite de rendu</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="datetime-local"
                value={formData.dueDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPoints">Points maximum</Label>
              <Input
                id="maxPoints"
                name="maxPoints"
                type="number"
                min="1"
                max="1000"
                value={formData.maxPoints}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachments">Pièces jointes</Label>
              <div className="border border-dashed rounded-md p-4 cursor-pointer" onClick={() => document.getElementById('attachments').click()}>
                <div className="flex flex-col items-center space-y-2">
                  <Upload className="h-6 w-6 text-gray-400" />
                  <p className="text-sm text-gray-500">Cliquez pour ajouter des fichiers</p>
                </div>
                <Input
                  id="attachments"
                  name="attachments"
                  type="file"
                  onChange={handleFileChange}
                  multiple
                  className="hidden"
                />
              </div>
              
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <Label>Fichiers sélectionnés</Label>
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <div className="flex items-center">
                          <File className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4 text-gray-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onClose()}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement..." : assignment ? "Mettre à jour" : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialogue pour la génération par IA */}
      <AIAssignmentGeneratorDialog 
        isOpen={isAIDialogOpen}
        onClose={() => setIsAIDialogOpen(false)}
        courseId={courseId}
        onAssignmentGenerated={handleAIGenerated}
      />
    </>
  );
};

export default AssignmentModal;