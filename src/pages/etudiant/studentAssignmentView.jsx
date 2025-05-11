import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { format, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/pages/auth/authContext";
import { ArrowLeft, File, Upload, X, Download, CheckCircle2, Clock, FileText } from "lucide-react";
import {
  fetchCourseAssignments,
  fetchMySubmission,
  submitAssignment
} from "@/services/assigmentapi";

// Helper function to safely format dates
const formatDate = (dateString, formatStr) => {
  try {
    const date = new Date(dateString);
    if (!isValid(date)) {
      return "Date inconnue";
    }
    return format(date, formatStr, { locale: fr });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Date inconnue";
  }
};

export const StudentAssignmentView = () => {
  const { assignmentId } = useParams();
  const { courseDetails } = useOutletContext();
  const courseId = courseDetails._id;
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [assignment, setAssignment] = useState(null);
  const [mySubmission, setMySubmission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [submissionContent, setSubmissionContent] = useState("");
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadAssignmentData = async () => {
      try {
        setIsLoading(true);
        
        // Récupérer les détails du devoir
        const assignments = await fetchCourseAssignments(courseId, token);
        const currentAssignment = assignments.find(a => a._id === assignmentId);
        
        if (!currentAssignment) {
          throw new Error("Devoir non trouvé");
        }
        
        setAssignment(currentAssignment);
        
        // Récupérer la soumission de l'étudiant
        const mySubData = await fetchMySubmission(assignmentId, token);
        setMySubmission(mySubData);
      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAssignmentData();
  }, [assignmentId, courseId, token]);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSubmissionFiles([...submissionFiles, ...newFiles]);
    }
  };

  const removeFile = (index) => {
    setSubmissionFiles(submissionFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    
    try {
      console.log("course id subbbb", courseId);
      const formData = {
        courseId,
        assignmentId,
        content: submissionContent,
        attachments: submissionFiles
      };
      console.log("il khedmaaaaaaaaaaaaaaaaaaaaa ", formData);
      const response = await submitAssignment(formData, token);
      setMySubmission(response);
      setSubmissionContent("");
      setSubmissionFiles([]);
      setActiveTab("details");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-red-500">{error || "Ce devoir n'existe pas"}</p>
        <Button variant="outline" onClick={() => navigate(`/home/course/${courseId}/devoirs`)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour aux devoirs
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Button variant="outline" className="mb-6" onClick={() => navigate(`/home/course/${courseId}/devoirs`)}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Retour aux devoirs
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">{assignment.title}</h1>
              <p className="text-sm text-gray-500">
                {assignment.maxPoints} points • Date limite: {formatDate(assignment.dueDate, "d MMMM yyyy à HH'h'mm")}
              </p>
            </div>
            <Button 
  variant="outline" 
  size="sm"
  onClick={() => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${assignment.title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
          h1 { color: #2c3e50; }
          .meta { color: #7f8c8d; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>${assignment.title}</h1>
        <div class="meta">
          Points: ${assignment.maxPoints} • Date limite: ${formatDate(assignment.dueDate, "d MMMM yyyy à HH'h'mm")}
        </div>
        <div>${assignment.description.replace(/\n/g, '<br/>')}</div>
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${assignment.title.replace(/\s+/g, '_')}_description.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }}
>

  {/*
  <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Créer un fichier texte avec la description
                const blob = new Blob([assignment.description], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${assignment.title.replace(/\s+/g, '_')}_description.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Télécharger la description
            </Button>
  */ }
  <FileText className="h-4 w-4 mr-2" />
  Télécharger la description 
</Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div dangerouslySetInnerHTML={{ __html: assignment.description.replace(/\n/g, '<br/>') }} />
            
          {assignment.attachments && assignment.attachments.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Pièces jointes du professeur</h3>
              <div className="space-y-2">
                {assignment.attachments.map((file, index) => (
                  <div key={index} className="flex items-center p-2 bg-gray-50 rounded-md">
                    <File className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm">{file.filename}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto"
                      onClick={() => window.open(`${import.meta.env.VITE_API_URL}/${file.path}`, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="submit" disabled={!!mySubmission}>Soumettre</TabsTrigger>
          <TabsTrigger value="mySubmission" disabled={!mySubmission}>Ma soumission</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4">
          <div className="space-y-4">
            {!mySubmission ? (
              <Card>
                <CardContent className="p-6">
                  <div className="bg-blue-50 p-4 rounded-md text-blue-700 mb-4">
                    <p>Vous n'avez pas encore soumis votre travail pour ce devoir.</p>
                  </div>
                  <Button onClick={() => setActiveTab("submit")}>Soumettre mon travail</Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="bg-green-50 p-4 rounded-md text-green-700 mb-4 flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">Vous avez soumis votre travail</p>
                      <p className="text-sm">
                        Soumis le {formatDate(mySubmission.submittedAt, "d MMMM yyyy à HH'h'mm")}
                        {mySubmission.status === "late" && " (en retard)"}
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => setActiveTab("mySubmission")}>Voir ma soumission</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="submit" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Soumettre mon travail</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="submissionContent">Contenu de la soumission</Label>
                  <Textarea
                    id="submissionContent"
                    value={submissionContent}
                    onChange={(e) => setSubmissionContent(e.target.value)}
                    rows={8}
                    placeholder="Saisissez votre réponse ici..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="block mb-2">Pièces jointes</Label>
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                      multiple
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" /> Ajouter des fichiers
                    </Button>
                  </div>

                  {submissionFiles.length > 0 && (
                    <div className="space-y-2 mt-4">
                      {submissionFiles.map((file, index) => (
                        <div key={index} className="flex items-center p-2 bg-gray-50 rounded-md">
                          <File className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="text-sm">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="ml-auto"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 p-4 rounded-md text-red-700">
                    <p>{error}</p>
                  </div>
                )}

                <div className="flex items-center justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("details")}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Envoi en cours..." : "Soumettre mon travail"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mySubmission" className="mt-4">
          {mySubmission && (
            <Card>
              <CardHeader className="bg-gray-50">
                <div className="flex justify-between items-center">
                  <CardTitle>Ma soumission</CardTitle>
                  <div className="flex items-center space-x-2">
                    {mySubmission.status === "late" ? (
                      <span className="text-orange-500 text-sm flex items-center">
                        <Clock className="h-4 w-4 mr-1" /> Soumis en retard
                      </span>
                    ) : mySubmission.status === "graded" ? (
                      <span className="text-green-500 text-sm flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Noté: {mySubmission.grade}/{assignment.maxPoints}
                      </span>
                    ) : (
                      <span className="text-blue-500 text-sm flex items-center">
                        <Clock className="h-4 w-4 mr-1" /> Soumis à temps
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      Soumis le {formatDate(mySubmission.submittedAt, "dd/MM/yyyy HH:mm")}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Contenu de ma soumission</h4>
                  <div className="p-4 bg-gray-50 rounded-md whitespace-pre-wrap">
                    {mySubmission.content || "(Pas de contenu texte)"}
                  </div>
                </div>

                {mySubmission.attachments && mySubmission.attachments.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Pièces jointes</h4>
                    <div className="space-y-2">
                      {mySubmission.attachments.map((file, index) => (
                        <div key={index} className="flex items-center p-2 bg-gray-50 rounded-md">
                          <File className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="text-sm">{file.filename}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto"
                            onClick={() => window.open(`${import.meta.env.VITE_API_URL}/${file.path}`, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {mySubmission.status === "graded" && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium mb-2">Retour du professeur</h4>
                    <div className="mb-2">
                      <span className="font-semibold">Note: </span>
                      <span>{mySubmission.grade}/{assignment.maxPoints}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Commentaire: </span>
                      <div className="p-4 bg-gray-50 rounded-md mt-2 whitespace-pre-wrap">
                        {mySubmission.feedback || "(Pas de commentaire)"}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};