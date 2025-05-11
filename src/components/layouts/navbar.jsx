import React from "react";
import { Link } from "react-router-dom";
import { 
  FaHome, 
  FaQuestionCircle, 
  FaEnvelope, 
  FaBars, 
  FaUserCircle, 
  FaSignOutAlt, 
  FaSignInAlt,
  FaBook,
  FaChalkboardTeacher
} from 'react-icons/fa';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/pages/auth/authContext";

const App = () => {
  const { user, logout } = useAuth();
  const isAuthenticated = !!user;

  return (
    <header className="bg-white border-b border-blue-100 w-full px-6 md:px-16 lg:px-24 sticky top-0 z-50">
      <nav className="flex items-center justify-between py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/d5756f61ad83429b8d94b2f33b9d9ea4/8438fdf3e8149084ed45099b71974cf199e146448a5b977414352412e96ce45b?placeholderIfAbsent=true"
            alt="Spaceroom Logo"
            className="h-9 w-9 object-contain transition-transform group-hover:scale-110"
          />
          <span className="text-xl font-bold bg-gradient-to-r from-black to-blue-800 bg-clip-text text-transparent">
            Spaceroom
          </span>
        </Link>

        {/* Menu Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <NavLinks />
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link 
                to="/home" 
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 transition-colors group"
              >
                <FaUserCircle className="text-blue-600 text-xl group-hover:text-blue-800" />
                <span className="text-black font-medium">Mon Espace</span>
              </Link>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-blue-600 hover:bg-blue-50 hover:text-blue-800"
                onClick={logout}
                aria-label="Déconnexion"
              >
                <FaSignOutAlt className="text-xl" />
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                <FaSignInAlt className="mr-2" />
                Connexion
              </Button>
            </Link>
          )}
        </div>

        {/* Menu Mobile avec Sheet */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-blue-600 hover:bg-blue-50 hover:text-blue-800"
              >
                <FaBars className="text-xl" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[300px] flex flex-col gap-6 p-6">
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/d5756f61ad83429b8d94b2f33b9d9ea4/8438fdf3e8149084ed45099b71974cf199e146448a5b977414352412e96ce45b?placeholderIfAbsent=true"
                  alt="Spaceroom Logo"
                  className="h-8 w-8 object-contain"
                />
                <span className="text-lg font-bold text-black">Spaceroom</span>
              </div>
              
              <div className="flex flex-col gap-1">
                <NavLinksMobile />
              </div>
              
              <div className="mt-auto pt-4 border-t border-blue-100">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-2">
                    <Link 
                      to="/home" 
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 text-black font-medium"
                    >
                      <FaUserCircle className="text-blue-600 text-lg" />
                      <span>Mon Espace</span>
                    </Link>
                    <Button 
                      variant="ghost" 
                      className="flex items-center gap-3 justify-start p-3 text-blue-800 hover:bg-blue-50"
                      onClick={logout}
                    >
                      <FaSignOutAlt className="text-blue-600 text-lg" />
                      <span>Déconnexion</span>
                    </Button>
                  </div>
                ) : (
                  <Link to="/login">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <FaSignInAlt className="mr-2" />
                      Connexion
                    </Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};

// Composant pour les liens du menu desktop
const NavLinks = () => (
  <div className="flex items-center gap-6">
    <NavLinkItem to="/" icon={<FaHome />} text="Accueil" />
   
    <NavLinkItem to="/why-us" icon={<FaQuestionCircle />} text="Pourquoi nous" />
    <NavLinkItem to="/contact" icon={<FaEnvelope />} text="Contact" />
  </div>
);

// Composant pour les liens du menu mobile
const NavLinksMobile = () => (
  <>
    <MobileNavLink to="/" icon={<FaHome />} text="Accueil" />
    
    <MobileNavLink to="/why-us" icon={<FaQuestionCircle />} text="Pourquoi nous" />
    <MobileNavLink to="/contact" icon={<FaEnvelope />} text="Contact" />
  </>
);

// Composant pour un lien de navigation desktop
const NavLinkItem = ({ to, icon, text }) => (
  <Link 
    to={to} 
    className="flex items-center gap-2 group text-black hover:text-blue-600 transition-colors"
  >
    <span className="text-blue-600 group-hover:text-blue-800 text-lg">
      {icon}
    </span>
    <span className="font-medium">{text}</span>
  </Link>
);

// Composant pour un lien de navigation mobile
const MobileNavLink = ({ to, icon, text }) => (
  <Link 
    to={to} 
    className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 text-blue-800 font-medium"
  >
    <span className="text-blue-600 text-lg">
      {icon}
    </span>
    <span>{text}</span>
  </Link>
);

export default App;