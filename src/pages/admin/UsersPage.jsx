import { useState, useEffect } from "react";
import {
  Check,
  ChevronDown,
  Download,
  Filter,
  Mail,
  Plus,
  Search,
  Settings,
  UserPlus,
  Users as UsersIcon,
  Eye,
  Trash,
  Ban,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { toast, ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Importer le service d'administration réel
import { adminService } from "@/services/adminService";
import { deleteUserById } from "@/services/userapi";
import { useAuth } from "../auth/authContext";

const Utilisateurs = () => {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    etudiants: 0,
    enseignants: 0,
    administrateurs: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [error, setError] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Utiliser le service d'administration réel pour récupérer les données
        const usersData = await adminService.getAllUsersWithStats();

        setUsers(usersData);
        setStats({
          total: usersData.length || 0,
          etudiants: usersData.filter(user => user.role === "user").length || 0,
          enseignants: usersData.filter(user => user.role === "teacher").length || 0,
          administrateurs: usersData.filter(user => user.role === "admin").length || 0
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching users data:", error);
        setError("Impossible de charger les données des utilisateurs. Veuillez réessayer.");
        setLoading(false);
      }
    };

    fetchUsersData();
  }, []);

  const handleViewUserDetails = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      // Utiliser le service d'administration réel pour récupérer les détails de l'utilisateur
      const details = await adminService.getUserStats(userId);

      setUserDetails(details);
      setSelectedUserId(userId);
      setShowUserDetailsModal(true);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user details:", error);
      setError("Impossible de charger les détails de l'utilisateur. Veuillez réessayer.");
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      // Appeler le service pour supprimer l'utilisateur
      await deleteUserById(userId, token);

      // Mettre à jour la liste des utilisateurs
      setUsers(users.filter(user => user._id !== userId));

      // Fermer le modal
      setShowUserDetailsModal(false);

      // Afficher un message de succès
      toast.success("Utilisateur supprimé avec succès ! 🎉");

      setLoading(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Impossible de supprimer l'utilisateur. Veuillez réessayer.");
      setLoading(false);
    }
  };

  const handleDeleteClick = (user, event) => {
    if (event) {
      event.stopPropagation();
    }
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setIsDeleteDialogOpen(false);
    const userName = userToDelete.name;
    const userId = userToDelete._id;

    setUserToDelete(null);

    try {
      setLoading(true);
      await deleteUserById(userId, token);

      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));

      setTimeout(() => {
        toast.success(`L'utilisateur "${userName}" a été supprimé avec succès.`);
      }, 100);
    } catch (error) {
      console.error("Erreur de suppression:", error.message);
      setTimeout(() => {
        toast.error("Impossible de supprimer l'utilisateur. Veuillez réessayer.");
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    // Filter by search query
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by tab
    let matchesTab = true;
    if (activeTab === "students") matchesTab = user.role === "user";
    else if (activeTab === "teachers") matchesTab = user.role === "teacher";
    else if (activeTab === "admins") matchesTab = user.role === "admin";

    return matchesSearch && matchesTab;
  });

  const getInitials = (name) => {
    if (!name) return "??";
    const names = name.split(" ");
    return names.map(n => n.charAt(0)).join("").toUpperCase();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "user":
        return "bg-cours text-white";
      case "teacher":
        return "bg-progression text-white";
      case "admin":
        return "bg-alerte text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getRoleName = (role) => {
    switch (role) {
      case "user":
        return "Étudiant";

      case "admin":
        return "Administrateur";
      default:
        return role;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExportUsers = async () => {
    try {
      // Vous pourriez ajouter ici une fonction pour exporter les utilisateurs
      console.log("Exporting users...");
      // Exemple: const data = await adminService.exportUsers();
    } catch (error) {
      console.error("Error exporting users:", error);
      setError("Impossible d'exporter les utilisateurs. Veuillez réessayer.");
    }
  };

  const handleAddUser = () => {
    // Vous pourriez ajouter ici une fonction pour ajouter un utilisateur
    console.log("Adding user...");
    // Rediriger vers une page de création d'utilisateur ou ouvrir un modal
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div>
        <h1 className="text-3xl font-bold mb-2">Gestion des Utilisateurs</h1>
        <p className="text-muted-foreground">Gérez les comptes, rôles et permissions des utilisateurs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <Card className="bg-gradient-to-br from-blue-100 to-white dark:from-blue-950/20 dark:to-gray-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total  utilisateurs</CardTitle>
            <UsersIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>



        <Card className="bg-gradient-to-br from-red-100 to-white dark:from-blue-950/20 dark:to-gray-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total  Étudiants</CardTitle>
            <UsersIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.etudiants}</div>
          </CardContent>
        </Card>




        <Card className="bg-gradient-to-br from-green-100 to-white dark:from-blue-950/20 dark:to-gray-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrateurs</CardTitle>
            <UsersIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.administrateurs}</div>
          </CardContent>
        </Card>

      </div>

      <Card className="p-6">
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
            <TabsList className="h-9">
              <TabsTrigger value="all">Tous les utilisateurs</TabsTrigger>
              <TabsTrigger value="students">Étudiants</TabsTrigger>

              <TabsTrigger value="admins">Administrateurs</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={handleExportUsers}>
                <Download size={16} />
                Exporter
              </Button>
              <Button className="gap-2" onClick={handleAddUser}>
                <UserPlus size={16} />
                Ajouter
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
            <div className="relative w-full sm:w-[300px]">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un utilisateur..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter size={16} />
                    Filtrer
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="gap-2">
                    <Check size={16} className="text-progression" />
                    Tous les rôles
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Actifs récemment</DropdownMenuItem>
                  <DropdownMenuItem>Inactifs</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Activité élevée</DropdownMenuItem>
                  <DropdownMenuItem>Activité faible</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <TabsContent value="all" className="m-0">
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Cours</TableHead>
                    <TableHead>Score moyen</TableHead>
                    <TableHead>Dernière activité</TableHead>
                    <TableHead className="w-[120px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              {user.imageurl ? (
                                <AvatarImage src={user.imageurl} alt={user.name} />
                              ) : (
                                <AvatarFallback className={getRoleColor(user.role)}>
                                  {getInitials(user.name)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`font-normal ${user.role === "admin" ? "border-alerte text-alerte" : user.role === "teacher" ? "border-progression text-progression" : "border-cours text-cours"}`}>
                            {getRoleName(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.enrolledCourses + user.createdCourses}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className={`rounded-full h-2 ${user.averageScore >= 70 ? "bg-progression" : user.averageScore >= 40 ? "bg-cours" : "bg-alerte"}`}
                                style={{ width: `${user.averageScore}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">{Math.round(user.averageScore)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(user.lastActive)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 justify-end">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleViewUserDetails(user._id)}
                              title="Voir détails"
                            >
                              <Eye size={16} />
                            </Button>
                            <Button size="icon" variant="ghost" title="Envoyer un message">
                              <Mail size={16} />
                            </Button>
                            <Button size="icon" variant="ghost" title="Paramètres">
                              <Settings size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Les autres onglets utilisent la même structure que "all" mais le filtrage se fait déjà via activeTab */}
          <TabsContent value="students" className="m-0">
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Cours inscrits</TableHead>
                    <TableHead>Quiz complétés</TableHead>
                    <TableHead>Score moyen</TableHead>
                    <TableHead>Dernière activité</TableHead>
                    <TableHead className="w-[120px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              {user.imageurl ? (
                                <AvatarImage src={user.imageurl} alt={user.name} />
                              ) : (
                                <AvatarFallback className={getRoleColor(user.role)}>
                                  {getInitials(user.name)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.enrolledCourses}</TableCell>
                        <TableCell>{user.quizAttempts}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className={`rounded-full h-2 ${user.averageScore >= 70 ? "bg-progression" : user.averageScore >= 40 ? "bg-cours" : "bg-alerte"}`}
                                style={{ width: `${user.averageScore}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">{Math.round(user.averageScore)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(user.lastActive)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 justify-end">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleViewUserDetails(user._id)}
                              title="Voir détails"
                            >
                              <Eye size={16} />
                            </Button>
                            <Button size="icon" variant="ghost" title="Envoyer un message">
                              <Mail size={16} />
                            </Button>
                            <Button size="icon" variant="ghost" title="Paramètres">
                              <Settings size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-muted-foreground">Aucun étudiant trouvé</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="teachers" className="m-0">
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Cours créés</TableHead>
                    <TableHead>Étudiants</TableHead>
                    <TableHead>Dernière activité</TableHead>
                    <TableHead className="w-[120px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              {user.imageurl ? (
                                <AvatarImage src={user.imageurl} alt={user.name} />
                              ) : (
                                <AvatarFallback className={getRoleColor(user.role)}>
                                  {getInitials(user.name)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.createdCourses}</TableCell>
                        <TableCell>{user.students || 0}</TableCell>
                        <TableCell>{formatDate(user.lastActive)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 justify-end">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleViewUserDetails(user._id)}
                              title="Voir détails"
                            >
                              <Eye size={16} />
                            </Button>
                            <Button size="icon" variant="ghost" title="Envoyer un message">
                              <Mail size={16} />
                            </Button>
                            <Button size="icon" variant="ghost" title="Paramètres">
                              <Settings size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <p className="text-muted-foreground">Aucun enseignant trouvé</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="admins" className="m-0">
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Date de création</TableHead>
                    <TableHead>Dernière activité</TableHead>
                    <TableHead className="w-[120px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              {user.imageurl ? (
                                <AvatarImage src={user.imageurl} alt={user.name} />
                              ) : (
                                <AvatarFallback className={getRoleColor(user.role)}>
                                  {getInitials(user.name)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>{formatDate(user.lastActive)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 justify-end">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleViewUserDetails(user._id)}
                              title="Voir détails"
                            >
                              <Eye size={16} />
                            </Button>
                            <Button size="icon" variant="ghost" title="Envoyer un message">
                              <Mail size={16} />
                            </Button>
                            <Button size="icon" variant="ghost" title="Paramètres">
                              <Settings size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <p className="text-muted-foreground">Aucun administrateur trouvé</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Modal pour les détails de l'utilisateur */}
      <Dialog open={showUserDetailsModal} onOpenChange={setShowUserDetailsModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de l'utilisateur</DialogTitle>
          </DialogHeader>

          {userDetails && (
            <div className="space-y-6">
              {/* En-tête avec les informations de l'utilisateur */}
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <Avatar className="w-24 h-24">
                  {userDetails.userInfo.imageurl ? (
                    <AvatarImage src={userDetails.userInfo.imageurl} alt={userDetails.userInfo.name} />
                  ) : (
                    <AvatarFallback className={`text-xl ${getRoleColor(userDetails.userInfo.role)}`}>
                      {getInitials(userDetails.userInfo.name)}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="space-y-4 flex-1">
                  <div>
                    <h2 className="text-2xl font-bold">{userDetails.userInfo.name}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge variant="outline" className={`font-normal ${getRoleColor(userDetails.userInfo.role)}`}>
                        {getRoleName(userDetails.userInfo.role)}
                      </Badge>
                      <p className="text-sm text-muted-foreground">{userDetails.userInfo.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Membre depuis</p>
                      <p className="font-medium">{formatDate(userDetails.userInfo.createdAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="gap-2 w-full">
                    <Mail size={16} />
                    Contacter
                  </Button>
                  <Button
                    variant="destructive"
                    className="gap-2 w-full"
                    onClick={() => {

                      handleDeleteClick(userDetails.userInfo);

                    }}
                  >
                    <Trash size={16} />
                    Supprimer
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard
                  title="Cours inscrits"
                  value={userDetails.metrics.coursesEnrolled}
                />
                <StatCard
                  title="Cours créés"
                  value={userDetails.metrics.coursesCreated}
                />
                <StatCard
                  title="Score moyen"
                  value={`${userDetails.metrics.averageQuizScore}%`}
                />
              </div>

              {/* Statistiques détaillées */}
              <Tabs defaultValue="courses" className="w-full">
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="courses">Cours</TabsTrigger>
                  <TabsTrigger value="activity">Activité récente</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="courses" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="font-medium">Cours inscrits</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {userDetails.enrolledCourses.map((course) => (
                        <Card key={course._id} className="p-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={course.imageurl}
                              alt={course.title}
                              className="w-16 h-16 rounded-md object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{course.title}</p>
                              <p className="text-sm text-muted-foreground truncate">{course.description}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>

                    <h3 className="font-medium mt-6">Cours créés</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {userDetails.createdCourses.map((course) => (
                        <Card key={course._id} className="p-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={course.imageurl}
                              alt={course.title}
                              className="w-16 h-16 rounded-md object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{course.title}</p>
                              <p className="text-sm text-muted-foreground truncate">{course.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {course.students.length} étudiants inscrits
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="font-medium">Quiz récents</h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Quiz</TableHead>
                            <TableHead>Cours</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userDetails.recentActivity.quizAttempts.map((attempt) => (
                            <TableRow key={attempt._id}>
                              <TableCell className="max-w-[200px] truncate">{attempt.quizId.title}</TableCell>
                              <TableCell className="max-w-[200px] truncate">{attempt.courseId.title}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                      className={`rounded-full h-2 ${attempt.score >= 70 ? "bg-progression" : attempt.score >= 40 ? "bg-cours" : "bg-alerte"}`}
                                      style={{ width: `${attempt.score}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-medium">{attempt.score}%</span>
                                </div>
                              </TableCell>
                              <TableCell>{formatDate(attempt.completedAt)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <h3 className="font-medium mt-6">Réunions récentes</h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Titre</TableHead>
                            <TableHead>Cours</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Durée</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userDetails.recentActivity.meetings.map((meeting) => (
                            <TableRow key={meeting._id}>
                              <TableCell className="max-w-[200px] truncate">{meeting.title}</TableCell>
                              <TableCell className="max-w-[200px] truncate">{meeting.courseId.title}</TableCell>
                              <TableCell>{formatDate(meeting.startTime)}</TableCell>
                              <TableCell>{meeting.duration} minutes</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <h3 className="font-medium mb-2">Statistiques des quiz</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Quiz complétés</span>
                          <span className="font-medium">{userDetails.metrics.quizzesCompleted}/{userDetails.metrics.quizzesTotal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Score moyen</span>
                          <span className="font-medium">{userDetails.metrics.averageQuizScore}%</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h3 className="font-medium mb-2">Statistiques des soumissions</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Soumissions à temps</span>
                          <span className="font-medium">{userDetails.metrics.submissionsOnTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Soumissions en retard</span>
                          <span className="font-medium">{userDetails.metrics.submissionsLate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Note moyenne</span>
                          <span className="font-medium">{userDetails.metrics.averageGrade}%</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowUserDetailsModal(false)}>Fermer</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Supprimer l'utilisateur
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'utilisateur "{userToDelete?.name}" ?
              <br />
              Cette action est irréversible et supprimera toutes les données associées à cet utilisateur.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
        transition={Slide}
        limit={3}
      />
    </div>
  );
};

// Composant Stat Card pour afficher les statistiques
const StatCard = ({ title, value, icon, trend }) => {
  return (
    <Card>
      <div className="p-6">
        <div className="flex justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          {icon && (
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              {icon}
            </div>
          )}
        </div>

        {trend && (
          <div className="mt-4 flex items-center">
            <span className={`mr-1 ${trend.isPositive ? "text-progression" : "text-alerte"}`}>
              {trend.isPositive ? "+" : "-"}{trend.value}%
            </span>
            <span className="text-sm text-muted-foreground">depuis le mois dernier</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default Utilisateurs;