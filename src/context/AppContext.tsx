import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useReducer,
} from "react";
import jwt_decode from "jwt-decode";
import { useRouter } from "next/router";
import axios from "axios";
import { AppReducer } from "./AppReducer"; // Make sure this is typed if necessary
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-toastify";

// Define the initial state type
interface StateType {
  showAlert: boolean;
  alertText: string;
  alertType: string;
}

// Initial state
const initialState: StateType = {
  showAlert: false,
  alertText: "",
  alertType: "",
};

// Define context type
interface AppContextType extends StateType {
  token: string | null;
  addUserToLocalStorage: (
    token: string,
    id: string,
    email: string,
    picture: string,
    role: string[]
  ) => void;
  handleGoogleLogin: (googleData: any) => Promise<void>;
  logUserOff: () => Promise<void>;
  addHardwareDetails: (formData: FormData) => Promise<boolean>;
  getAllAssetDetails: () => Promise<any>;
  getSingleAssetDetail: (id: string) => Promise<any>;
}

// Create context with default value
export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(AppReducer, initialState);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const addUserToLocalStorage = (
    token: string,
    id: string,
    email: string,
    picture: string,
    role: string[]
  ) => {
    try {
      localStorage.setItem("token", token);
    } catch (error) {
      console.error("Error storing user data in localStorage:", error);
    }
  };

  const handleGoogleLogin = async (googleData: any) => {
    try {
      const { credential } = googleData;
      const { data } = await axios.post(
        "https://timetrackerserver-by8t.onrender.com/api/v1/auth/login",
        googleData
      );
      const { token, user } = data;
      const { id, email, picture, role } = user;

      addUserToLocalStorage(token, id, email, picture, role);

      if (role[0] === "user") {
        router.push("/user/dashboard");
      } else {
        router.push("/admin/dashboard");
      }
    } catch (error) {
      console.error("Google Login Error:", error);
    }
  };

  const logUserOff = async () => {
    const id = localStorage.getItem("id");
    const email = localStorage.getItem("email");

    const userDetails = {
      email: email!,
      id: id!,
    };

    const isloggedOut = await axios.post(
      "https://timetrackerserver-by8t.onrender.com/api/v1/auth/logout",
      userDetails
    );

    if (isloggedOut) {
      localStorage.clear();
      setToken(null);
      router.push("/");
    }
  };

  const addHardwareDetails = async (formData: FormData): Promise<boolean> => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        "http://localhost:3001/api/v1/amsservices/addhardware",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Hardware details submitted successfully!", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return true;
      }
      return false;
    } catch (error: any) {
      if (error.response && error.response.data) {
        const errorMessages: string[] = error.response.data.errors || [];
        errorMessages.forEach((err) =>
          toast.error(err, {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          })
        );
      } else {
        toast.error(error.message, {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
      return false;
    }
  };

  const getAllAssetDetails = async (): Promise<any> => {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const allAssetsDetails = await axios.get(
        "http://localhost:3001/api/v1/amsservices/requestallassets",
        config
      );

      return allAssetsDetails.data.data;
    } catch (error: any) {
      toast.error(error.message, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const getSingleAssetDetail = async (assetId: string): Promise<any> => {

    console.log(assetId);
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const allSingleAssetDetails = await axios.get(
        `http://localhost:3001/api/v1/amsservices/requestsingleasset?assetId=${assetId}`,
        config
      );

      return allSingleAssetDetails.data.data;
    } catch (error: any) {
      toast.error(error.message, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };
  return (
    <AppContext.Provider
      value={{
        ...state,
        token,
        addUserToLocalStorage,
        handleGoogleLogin,
        logUserOff,
        addHardwareDetails,
        getAllAssetDetails,
        getSingleAssetDetail,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};



// Custom Hook for Context
export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}
