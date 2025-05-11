import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CalendarIcon, Plus, Video, VideoOff } from "lucide-react";
import MeetingRoom from "../meeting/meeting";
import { useAuth } from "../auth/authContext";
import { MeetingHeader } from "../meeting/MeetingHeader";
import MeetingList from "../meeting/MeetingList";
import { EmptyState } from "../meeting/EmptyState";
import { 
  CreateMeetingDialog, 
  InstantMeetingDialog, 
  EditMeetingDialog, 
  DeleteMeetingDialog 
} from "../meeting/metingpopup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "@/components/ui/button";
import { useTheme } from "../admin/componnents/themcontext";

// URL de l'API
const API_URL = `${import.meta.env.VITE_API_URL}`;

const MeetingPage = () => {
  const { courseDetails, isOwner, isStudent } = useOutletContext() || {};
  const courseId = courseDetails?._id;
  const courseName = courseDetails?.title || "Ce cours";

  // État pour suivre la réunion actuellement active
  const [activeMeeting, setActiveMeeting] = useState(null);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [pastMeetings, setPastMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");

  // États pour les opérations CRUD
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isOperationLoading, setIsOperationLoading] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const { token, user } = useAuth();

  // Nouvelle état pour la création instantanée
  const [isInstantMeetingDialogOpen, setIsInstantMeetingDialogOpen] = useState(false);
  const [instantMeetingForm, setInstantMeetingForm] = useState({
    title: "",
    description: "",
    location: "Salle virtuelle A",
  });

  // État pour la création ou modification d'une réunion
  const [meetingForm, setMeetingForm] = useState({
    title: "",
    date: "",
    time: "",
    duration: 60,
    description: "",
    location: "Salle virtuelle A",
    isInstant: false,
  });

  const { theme } = useTheme();

  // Charger les données des réunions lors du montage du composant
  useEffect(() => {
    if (courseId) {
      fetchMeetings();
    }
  }, [courseId]);

  // Fonction pour récupérer les réunions depuis l'API
  const fetchMeetings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/meetings/course/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const { upcomingMeetings, pastMeetings } = response.data;
      setUpcomingMeetings(upcomingMeetings || []);
      setPastMeetings(pastMeetings || []);
    } catch (err) {
      console.error("Erreur lors de la récupération des réunions:", err);
      setError("Impossible de charger les réunions. Veuillez réessayer plus tard.");
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion des changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMeetingForm((prev) => ({ ...prev, [name]: value }));
  };

  // Gestion des changements dans le formulaire instantané
  const handleInstantInputChange = (e) => {
    const { name, value } = e.target;
    setInstantMeetingForm((prev) => ({ ...prev, [name]: value }));
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setMeetingForm({
      title: "",
      date: "",
      time: "",
      duration: 60,
      description: "",
      location: "Salle virtuelle A",
      isInstant: false,
    });
    setInstantMeetingForm({
      title: "",
      description: "",
      location: "Salle virtuelle A",
    });
  };

  // Préparer le formulaire pour l'édition
  const prepareEditForm = (meeting) => {
    const startTime = new Date(meeting.startTime);
    setMeetingForm({
      title: meeting.title,
      date: startTime.toISOString().split("T")[0],
      time: startTime.toTimeString().slice(0, 5),
      duration: meeting.duration,
      description: meeting.description || "",
      location: meeting.location || "Salle virtuelle A",
      isInstant: false,
    });
    setSelectedMeeting(meeting);
    setIsEditDialogOpen(true);
  };

  // Créer une nouvelle réunion
  const handleCreateMeeting = async () => {
    if (!meetingForm.title || (!meetingForm.isInstant && (!meetingForm.date || !meetingForm.time))) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setIsOperationLoading(true);
    try {
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().split("T")[0];
      const formattedTime = currentDate.getHours().toString().padStart(2, "0") + ":" + 
                          currentDate.getMinutes().toString().padStart(2, "0");
      
      const response = await axios.post(
        `${API_URL}/meetings/`,
        {
          courseId,
          title: meetingForm.title,
          date: meetingForm.isInstant ? formattedDate : meetingForm.date,
          time: meetingForm.isInstant ? formattedTime : meetingForm.time,
          duration: meetingForm.duration,
          description: meetingForm.description,
          location: meetingForm.location,
          isInstant: meetingForm.isInstant,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      const newMeeting = response.data.meeting;
      setUpcomingMeetings((prev) =>
        [...prev, newMeeting].sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      );
      
      toast.success("Réunion créée avec succès ! 🎉");
      setIsCreateDialogOpen(false);
      resetForm();
      
      if (meetingForm.isInstant) {
        handleJoinMeeting(newMeeting);
      }
    } catch (error) {
      console.error("Erreur lors de la création de la réunion:", error);
      toast.error(error.response?.data?.message || "Impossible de créer la réunion");
    } finally {
      setIsOperationLoading(false);
    }
  };

// Créer instantanément une réunion et la rejoindre
const handleCreateInstantMeeting = async () => {
  if (!instantMeetingForm.title) {
      toast.error("Veuillez saisir un titre pour la réunion.");
    return;
  }
  setIsOperationLoading(true);
  try {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0];
    const formattedTime = currentDate.getHours().toString().padStart(2, "0") + ":" + 
                        currentDate.getMinutes().toString().padStart(2, "0");
    
    const response = await axios.post(
      `${API_URL}/meetings/`,
      {
        courseId,
        title: instantMeetingForm.title,
        date: formattedDate,
        time: formattedTime,
          duration: 60,
        description: instantMeetingForm.description,
        location: instantMeetingForm.location,
          isInstant: true,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    const newMeeting = response.data.meeting;
    if (!newMeeting.isInstant) {
      newMeeting.isInstant = true;
    }
    
    setUpcomingMeetings((prev) =>
      [...prev, newMeeting].sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    );
    
      toast.success("Réunion instantanée créée ! Vous rejoignez la salle... 🚀");
    setIsInstantMeetingDialogOpen(false);
    resetForm();
    
    handleJoinMeeting(newMeeting);
  } catch (error) {
    console.error("Erreur lors de la création de la réunion instantanée:", error);
      toast.error(error.response?.data?.message || "Impossible de créer la réunion instantanée");
  } finally {
    setIsOperationLoading(false);
  }
};

  // Mettre à jour une réunion existante
  const handleUpdateMeeting = async () => {
    if (!meetingForm.title || !meetingForm.date || !meetingForm.time) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setIsOperationLoading(true);
    try {
      const response = await axios.put(
        `${API_URL}/meetings/${selectedMeeting._id}`,
        {
          title: meetingForm.title,
          date: meetingForm.date,
          time: meetingForm.time,
          duration: meetingForm.duration,
          description: meetingForm.description,
          location: meetingForm.location,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      const updatedMeeting = response.data.meeting;
      const now = new Date();
      const meetingEndTime = new Date(updatedMeeting.startTime);
      meetingEndTime.setMinutes(meetingEndTime.getMinutes() + updatedMeeting.duration);
      
      if (meetingEndTime > now) {
        setUpcomingMeetings((prev) =>
          prev
            .map((m) => (m._id === updatedMeeting._id ? updatedMeeting : m))
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
        );
      } else {
        setPastMeetings((prev) =>
          prev
            .map((m) => (m._id === updatedMeeting._id ? updatedMeeting : m))
            .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
        );
      }
      
      toast.success("Réunion mise à jour avec succès ! ✨");
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la réunion:", error);
      toast.error(error.response?.data?.message || "Impossible de mettre à jour la réunion");
    } finally {
      setIsOperationLoading(false);
    }
  };

  // Supprimer une réunion
  const handleDeleteMeeting = async () => {
    if (!selectedMeeting) return;
    setIsOperationLoading(true);
    try {
      await axios.delete(`${API_URL}/meetings/${selectedMeeting._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (activeTab === "upcoming") {
        setUpcomingMeetings((prev) => prev.filter((m) => m._id !== selectedMeeting._id));
      } else {
        setPastMeetings((prev) => prev.filter((m) => m._id !== selectedMeeting._id));
      }
      
      toast.success("Réunion supprimée avec succès ! 🗑️");
      setIsDeleteDialogOpen(false);
      setSelectedMeeting(null);
    } catch (error) {
      console.error("Erreur lors de la suppression de la réunion:", error);
      toast.error(error.response?.data?.message || "Impossible de supprimer la réunion");
    } finally {
      setIsOperationLoading(false);
    }
  };

// Rejoindre une réunion
const handleJoinMeeting = async (meeting) => {
  try {
    console.log('Tentative de rejoindre la réunion:', {
      meetingId: meeting._id,
      isInstant: meeting.isInstant,
      startTime: meeting.startTime,
      serverTime: new Date().toISOString(),
      clientTime: new Date().toISOString(),
      timezoneOffset: new Date().getTimezoneOffset()
    });
    
    if (!meeting.isInstant) {
      const meetingTime = new Date(meeting.startTime);
      const now = new Date();
        const timeDiff = (meetingTime - now) / (1000 * 60);
      
      if (timeDiff > 15) {
          toast.warning(`Cette réunion n'est pas encore disponible. Elle sera accessible 15 minutes avant l'heure prévue (${formatTime(meeting.startTime)}).`);
        return;
      }
    }
    
    const response = await axios.post(
      `${API_URL}/meetings/${meeting._id}/join`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    const { roomID } = response.data;
    const updatedMeeting = { ...meeting, roomID };
    setActiveMeeting(updatedMeeting);
      toast.success("Connexion à la réunion établie ! 🎥");
  } catch (error) {
    console.error("Erreur lors de l'accès à la réunion:", error);
      toast.error(error.response?.data?.message || "Impossible de rejoindre la réunion");
  }
};

  // Fermer la salle de réunion
  const handleCloseMeetingRoom = () => {
    setActiveMeeting(null);
  };

  // Marquer une réunion comme ayant un enregistrement disponible
  const handleSetRecordingAvailable = async (meeting, recordingUrl = "") => {
    try {
      const response = await axios.put(
        `${API_URL}/meetings/${meeting._id}/recording`,
        { recordingUrl },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      const updatedMeeting = response.data.meeting;
      setPastMeetings((prev) =>
        prev.map((m) => (m._id === updatedMeeting._id ? updatedMeeting : m))
      );
      
      toast.success("Enregistrement marqué comme disponible ! 🎬");
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'enregistrement:", error);
      toast.error(error.response?.data?.message || "Impossible de mettre à jour l'enregistrement");
    }
  };

  // Vérifier si une réunion est en direct maintenant
  const isMeetingLive = (meeting) => {
    const now = new Date();
    const startTime = new Date(meeting.startTime);
    const endTime = new Date(startTime.getTime() + meeting.duration * 60000);
    return now >= startTime && now <= endTime;
  };

  // Vérifier si une réunion est prochainement disponible
  const isMeetingSoonAvailable = (meeting) => {
    const now = new Date();
    const startTime = new Date(meeting.startTime);
    const timeDiffMinutes = (startTime - now) / (1000 * 60);
    return timeDiffMinutes <= 15 && timeDiffMinutes > 0;
  };

  // Format date to display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  // Format time to display
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {activeMeeting && (
        <MeetingRoom
          meetingId={activeMeeting._id}
          roomID={activeMeeting.roomID}
          meetingTitle={activeMeeting.title}
          onClose={handleCloseMeetingRoom}
        />
      )}
      <div className="space-y-6 max-w-5xl mx-auto pb-10">
        <MeetingHeader 
          courseName={courseName}
          isOwner={isOwner}
          onOpenCreate={() => setIsCreateDialogOpen(true)}
          onOpenInstant={() => setIsInstantMeetingDialogOpen(true)}
        />

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-background rounded-lg shadow-sm border overflow-hidden">
          <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b">
              <TabsList className="w-full justify-start gap-8 p-0 rounded-none bg-transparent h-14">
                <TabsTrigger
                  value="upcoming"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none h-14 px-6 font-medium"
                >
                  À venir
                </TabsTrigger>
                <TabsTrigger
                  value="past"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none h-14 px-6 font-medium"
                >
                  Passées
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="upcoming" className="m-0 px-0 py-4">
              {isLoading ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full"></div>
                </div>
              ) : upcomingMeetings.length > 0 ? (
                <MeetingList
                  meetings={upcomingMeetings}
                  isOwner={isOwner}
                  onJoin={handleJoinMeeting}
                  onEdit={prepareEditForm}
                  onDelete={(meeting) => {
                    setSelectedMeeting(meeting);
                    setIsDeleteDialogOpen(true);
                  }}
                  isMeetingLive={isMeetingLive}
                  isMeetingSoonAvailable={isMeetingSoonAvailable}
                  formatDate={formatDate}
                  formatTime={formatTime}
                />
              ) : (
                <EmptyState
                  icon={<CalendarIcon className="h-12 w-12 text-muted-foreground" />}
                  title="Aucune réunion à venir"
                  description="Planifiez une nouvelle réunion pour commencer"
                  action={isOwner ? (
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsInstantMeetingDialogOpen(true)}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Réunion instantanée
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Planifier une réunion
                      </Button>
                    </div>
                  ) : null}
                />
              )}
            </TabsContent>

            <TabsContent value="past" className="m-0 px-0 py-4">
              {isLoading ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full"></div>
                </div>
              ) : pastMeetings.length > 0 ? (
                <MeetingList
                  meetings={pastMeetings}
                  isOwner={isOwner}
                  onEdit={prepareEditForm}
                  onDelete={(meeting) => {
                    setSelectedMeeting(meeting);
                    setIsDeleteDialogOpen(true);
                  }}
                  onSetRecording={handleSetRecordingAvailable}
                  isPast={true}
                  formatDate={formatDate}
                  formatTime={formatTime}
                />
              ) : (
                <EmptyState
                  icon={<VideoOff className="h-12 w-12 text-muted-foreground" />}
                  title="Aucune réunion passée"
                  description="Les réunions terminées apparaîtront ici"
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <CreateMeetingDialog
          isOpen={isCreateDialogOpen}
          setIsOpen={setIsCreateDialogOpen}
          meetingForm={meetingForm}
          handleInputChange={handleInputChange}
          handleCreateMeeting={handleCreateMeeting}
          isOperationLoading={isOperationLoading}
          resetForm={resetForm}
        />

        <InstantMeetingDialog
          isOpen={isInstantMeetingDialogOpen}
          setIsOpen={setIsInstantMeetingDialogOpen}
          meetingForm={instantMeetingForm}
          handleInputChange={handleInstantInputChange}
          handleCreateInstantMeeting={handleCreateInstantMeeting}
          isOperationLoading={isOperationLoading}
          resetForm={resetForm}
        />

        <EditMeetingDialog
          isOpen={isEditDialogOpen}
          setIsOpen={setIsEditDialogOpen}
          meetingForm={meetingForm}
          handleInputChange={handleInputChange}
          handleUpdateMeeting={handleUpdateMeeting}
          isOperationLoading={isOperationLoading}
          resetForm={resetForm}
        />

        <DeleteMeetingDialog
          isOpen={isDeleteDialogOpen}
          setIsOpen={setIsDeleteDialogOpen}
          meeting={selectedMeeting}
          handleDeleteMeeting={handleDeleteMeeting}
          isOperationLoading={isOperationLoading}
          formatDate={formatDate}
          formatTime={formatTime}
        />
      </div>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme === "dark" ? "dark" : "light"}
      />
    </>
  );
};

export default MeetingPage;