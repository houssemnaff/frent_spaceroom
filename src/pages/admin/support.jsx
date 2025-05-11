import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "../auth/authContext";
import axios from "axios";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Mail, MessageSquare, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";

const SupportPage = () => {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState("pending");

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/support/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessages(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Erreur lors de la récupération des messages");
      setLoading(false);
    }
  };

  const handleResponse = async () => {
    if (!selectedMessage || !response.trim()) return;

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/support/${selectedMessage._id}/status`,
        {
          status,
          adminResponse: response,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Réponse envoyée avec succès");
      setIsDialogOpen(false);
      setResponse("");
      fetchMessages();
    } catch (error) {
      console.error("Error sending response:", error);
      toast.error("Erreur lors de l'envoi de la réponse");
    }
  };

  const handleStatusChange = async () => {
    if (!selectedMessage) return;

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/support/${selectedMessage._id}/status`,
        {
          status,
          adminResponse: selectedMessage.adminResponse, // Garder la réponse existante
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Statut mis à jour avec succès");
      setIsStatusDialogOpen(false);
      fetchMessages();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "pending":
        return {
          color: "text-amber-500",
          bg: "bg-amber-100 dark:bg-amber-950/20",
          label: "En attente",
          icon: <AlertCircle className="h-4 w-4 text-amber-500" />
        };
      case "in_progress":
        return {
          color: "text-blue-500",
          bg: "bg-blue-100 dark:bg-blue-950/20",
          label: "En cours",
          icon: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
        };
      case "resolved":
        return {
          color: "text-emerald-500",
          bg: "bg-emerald-100 dark:bg-emerald-950/20",
          label: "Résolu",
          icon: <CheckCircle className="h-4 w-4 text-emerald-500" />
        };
      default:
        return {
          color: "text-gray-500",
          bg: "bg-gray-100 dark:bg-gray-800",
          label: status,
          icon: <AlertCircle className="h-4 w-4 text-gray-500" />
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Grouping messages by status
  const pendingMessages = messages.filter(msg => msg.status === "pending");
  const inProgressMessages = messages.filter(msg => msg.status === "in_progress");
  const resolvedMessages = messages.filter(msg => msg.status === "resolved");

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Messages de Support</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-gray-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingMessages.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Messages nécessitant attention
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-gray-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressMessages.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Messages en traitement
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-gray-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Résolus</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedMessages.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Messages traités avec succès
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Messages */}
      <div className="space-y-6">
        {messages.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            Aucun message de support pour le moment.
          </Card>
        ) : (
          messages.map((message) => {
            const statusConfig = getStatusConfig(message.status);
            
            return (
              <Card 
                key={message._id} 
                className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <CardHeader className={`${statusConfig.bg} border-b`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${statusConfig.bg} border`}>
                        {statusConfig.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{message.subject}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {message.name} ({message.email})
                          </p>
                        </div>
                      </div>
                    </div>
                    <Badge className={`${statusConfig.bg} ${statusConfig.color} hover:${statusConfig.color}`}>
                      {statusConfig.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Message:</h3>
                      <p className="text-muted-foreground bg-muted/30 p-4 rounded-lg">{message.message}</p>
                    </div>

                    {message.adminResponse && (
                      <div className="bg-blue-50 dark:bg-blue-950/10 p-4 rounded-lg border-l-4 border-blue-500">
                        <h3 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">Réponse:</h3>
                        <p className="text-muted-foreground">{message.adminResponse}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(message.createdAt), "PPP", { locale: fr })}</span>
                      </div>

                      <div className="flex gap-2">
                        {!message.adminResponse ? (
                          <Button
                            onClick={() => {
                              setSelectedMessage(message);
                              setStatus(message.status);
                              setIsDialogOpen(true);
                            }}
                            variant="outline"
                            className="border-blue-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 dark:border-blue-900 dark:hover:bg-blue-950 dark:hover:border-blue-800"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Répondre
                          </Button>
                        ) : (
                          <Button
                            onClick={() => {
                              setSelectedMessage(message);
                              setStatus(message.status);
                              setIsStatusDialogOpen(true);
                            }}
                            variant="outline"
                            className="border-amber-200 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 dark:border-amber-900 dark:hover:bg-amber-950 dark:hover:border-amber-800"
                          >
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Modifier le statut
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Répondre au message: {selectedMessage?.subject}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Statut</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span>En attente</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="in_progress">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 text-blue-500" />
                      <span>En cours</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="resolved">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span>Résolu</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Réponse</label>
              <Textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Écrivez votre réponse..."
                className="min-h-32 mt-1"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleResponse}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Envoyer la réponse
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Modifier le statut: {selectedMessage?.subject}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Nouveau statut</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span>En attente</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="in_progress">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 text-blue-500" />
                      <span>En cours</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="resolved">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span>Résolu</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleStatusChange}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Mettre à jour le statut
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportPage;