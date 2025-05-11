import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-toastify";
import { useAuth } from "./authContext";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Function to initialize Google Registration
  const initializeGoogleLogin = () => {
    window.google.accounts.id.initialize({
      client_id: "925173298479-3ecf18me9ar8rr32rmaouqemdleeg4t8.apps.googleusercontent.com",
      callback: handleGoogleRegister,
    });
    window.google.accounts.id.renderButton(
      document.getElementById("google-register-button"),
      { theme: "filled_blue", size: "large", shape: "pill", width: "100%" }
    );
  };

  useEffect(() => {
    // Load Google Identity Services script
    const loadGoogleScript = () => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = initializeGoogleLogin;
    };

    loadGoogleScript();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth0/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
     // console.log("user",response.data);
      login(response.data.user, response.data.token);
      toast.success("Registration successful");
      navigate("/home");
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.message || "Registration failed");
      toast.error("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async (response) => {
    try {
      setLoading(true);
      setError("");
      
      // Decode Google JWT token
      const token = response.credential;
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Send information to your backend
      const { data } = await axios.post("http://localhost:5000/auth0/google-register", {
        token,
        userData: {
          name: payload.name,
          email: payload.email,
          googleId: payload.sub,
          picture: payload.picture
        }
      });

      login(data.user, data.token);
      toast.success("Google registration successful");
      navigate("/home");
    } catch (error) {
      console.error("Google registration error:", error);
      setError(error.response?.data?.message || "Google registration failed");
      toast.error("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/d5756f61ad83429b8d94b2f33b9d9ea4/8438fdf3e8149084ed45099b71974cf199e146448a5b977414352412e96ce45b?placeholderIfAbsent=true"
              alt="Spacroom Logo"
              className="h-10 w-10 object-contain"
            />
            <h1 className="text-3xl font-bold text-blue-800">Spaceroom</h1>
          </div>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
            <CardDescription className="text-center">
              Enter your information to get started with Spacroom
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="h-11 rounded-lg"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="h-11 rounded-lg"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="h-11 rounded-lg"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="h-11 rounded-lg"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 text-base font-medium rounded-lg bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Sign up"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-2 text-sm text-gray-500">
                  or continue with
                </span>
              </div>
            </div>

            <div id="google-register-button" className="flex justify-center"></div>
          </CardContent>
          <CardFooter>
            <div className="text-center w-full text-sm">
              Already have an account?{" "}
              <button
                type="button"
                className="font-medium text-blue-600 hover:underline"
                onClick={() => navigate("/login")}
              >
                Sign in
              </button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}