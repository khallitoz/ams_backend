import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { belzirAxiosGet } from "../utils/axiosHelper";
import axios from "axios";
import { useRouter } from "next/router";

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  checkAuth: () => Promise<boolean | undefined>;
  user: User | null;
}
interface User {
  user_name: string;
  user_id: string;
  role: "superadmin" | "user";
}
// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider Props
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const router = useRouter();

  const checkAuth = useCallback(async (): Promise<boolean | undefined> => {
    setLoading(true);

    try {
      // Get token from cookies if it exists
      const cookies = document.cookie.split(";").reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split("=");
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);

      const token = cookies.token || cookies.accessToken;

      const response = await axios.post(
        "http://localhost:4002/api/v1/auth/users/token/verify",
        token ? { token } : {},
        {
          withCredentials: true,
        }
      );

      if (response && response.data) {
        if (response?.data?.valid) {
          setIsAuthenticated(true);
          setUser(response.data.user);
          return true;
        }
      } else {
        console.log("Access token expired, attempting refresh...");
        setIsAuthenticated(false);
        const refresh = await refreshAccessToken();
        if (refresh) {
          setIsAuthenticated(true);
          // window.location.reload();
        }
      }
    } catch (error) {
      console.log("Error verifying token", error);
      setIsAuthenticated(false);
      const refresh = await refreshAccessToken();
      if (refresh) {
        setIsAuthenticated(true);
        window.location.reload();
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAccessToken = async () => {
    try {
      const response = await belzirAxiosGet("/api/users/token/refresh");

      if (response?.data?.valid) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        return true;
      }
    } catch (error) {
      console.error("Refresh token expired or invalid");
      return false;
    }
  };

  // useEffect(() => {
  //   checkAuth();
  // }, [checkAuth, router.pathname]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, checkAuth, user }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook to Use Auth Context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
