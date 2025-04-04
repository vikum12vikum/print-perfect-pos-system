
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../lib/types";
import { useNavigate } from "react-router-dom";
import { login as loginApi, logout as logoutApi } from "../lib/api";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: () => {},
  isLoading: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const userStr = localStorage.getItem("posUser");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error("Error parsing user data", error);
        localStorage.removeItem("posUser");
      }
    }
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await loginApi({ username, password });
      setUser(response.data);
      toast.success(`Welcome back, ${response.data.name}!`);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Invalid username or password");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    logoutApi();
    setUser(null);
    toast.info("Logged out successfully");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
