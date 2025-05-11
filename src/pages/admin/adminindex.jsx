import React, { useState, useRef } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { SidebarProvider } from "./componnents/sidebarcontext";
import { ThemeProvider, useTheme } from "./componnents/themcontext";
import AppHeader from "./adminheader";
import { toast } from "react-toastify";
import { updateUserById } from "@/services/userapi";
import { useAuth } from "../auth/authContext";

const AdminLayout = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { user, setUser, token } = useAuth();
  const fileInputRef = useRef(null);
  
  // État pour le profil
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    imagePreview: user?.imageurl || ""
  });

  const handleOpenProfile = () => {
    setProfileData({
      name: user?.name || "",
      email: user?.email || "",
      imagePreview: user?.imageurl || ""
    });
    setIsProfileOpen(true);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async () => {
    if (!profileData.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", profileData.name);
      
      if (profileData.email !== user?.email) {
        formData.append("email", profileData.email);
      }
      
      if (fileInputRef.current?.files?.[0]) {
        formData.append("file", fileInputRef.current.files[0]);
      }

      const updatedUser = await updateUserById(user._id, formData, token);
      setUser(updatedUser);
      toast.success("Profile updated successfully");
      setIsProfileOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      
      const imageUrl = URL.createObjectURL(file);
      setProfileData(prev => ({
        ...prev,
        imagePreview: imageUrl
      }));
    }
  };

  return (
    <ThemeProvider>
      <SidebarProvider>
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
          <AdminSidebar />
          <div className="flex-1 flex flex-col overflow-hidden md:ml-16 lg:ml-64">
            <AppHeader 
              handleOpenProfile={handleOpenProfile}
              isProfileOpen={isProfileOpen}
              setIsProfileOpen={setIsProfileOpen}
              profileData={profileData}
              handleProfileChange={handleProfileChange}
              handleProfileSubmit={handleProfileSubmit}
              handleImageChange={handleImageChange}
              fileInputRef={fileInputRef}
              isLoading={isLoading}
              isDark={isDark}
            />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pt-20">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default AdminLayout;