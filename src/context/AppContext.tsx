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
import { UPDATE_SINGLE_DETAILS_STATE } from "./actions";

import { toast } from "react-toastify";
import SingleAssetDetails from "@/pages/user/singleassetdetails/[assetId]";

// Define the initial state type
interface StateType {
  showAlert: boolean;
  alertText: string;
  alertType: string;
  singleStateData: any;
}

// Initial state
const initialState: StateType = {
  showAlert: false,
  alertText: "",
  alertType: "",
  singleStateData: null,
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
  updateHardwareDetails: (id: string, formData: FormData) => Promise<boolean>;
  getAllAssetDetails: (
    page: number,
    limit: number,
    searchQuery: string
  ) => Promise<any>;

  getInActiveAssets: (
    page: number,
    limit: number,
    searchQuery: string
  ) => Promise<any>;
  getAllCheckInAssets: (
    page: number,
    limit: number,
    searchQuery: string
  ) => Promise<any>;

  getAllCheckOutAssets: (
    page: number,
    limit: number,
    searchQuery: string
  ) => Promise<any>;

  getSingleAssetDetail: (id: string) => Promise<any>;
  searchAsset: (searchQuery: string) => Promise<any>;
  submitAssignedAsset: (submissionData: string[]) => Promise<any>;
  fetchAssignedDetails: (id: string) => Promise<any>;

  getTabBarCounter: () => Promise<any>;
}

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
    console.log("FormData being sent:", formData);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/amsservices/addhardware",
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
      if (error.response) {
        // Handle 400 validation errors
        if (error.response.status === 400 && error.response.data.errors) {
          const errorMessages: { [key: string]: string } =
            error.response.data.errors;
          Object.values(errorMessages).forEach((errMsg) =>
            toast.error(errMsg, {
              position: "top-center",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            })
          );
        }
        // Handle other known error responses
        else if (error.response.status === 500) {
          toast.error(error.response.data.msg, {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
        // Fallback for other response errors
        else {
          toast.error(error.response.data.message || "An error occurred.", {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      }
      // Network or other unhandled errors
      else if (error.request) {
        toast.error("No response from the server. Please check your network.", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
      // Other unknown errors
      else {
        toast.error(`Error: ${error.message}`, {
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

  const updateHardwareDetails = async (
    id: string,
    formData: FormData
  ): Promise<any> => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(
        `http://localhost:5000/api/v1/amsservices/updatehardware/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Updated Successfully !", {
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
      if (error.response) {
        // Handle 400 validation errors
        if (error.response.status === 400 && error.response.data.errors) {
          const errorMessages: { [key: string]: string } =
            error.response.data.errors;
          Object.values(errorMessages).forEach((errMsg) =>
            toast.error(errMsg, {
              position: "top-center",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            })
          );
        }
        // Handle other known error responses
        else if (error.response.status === 500) {
          toast.error(error.response.data.msg, {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
        // Fallback for other response errors
        else {
          toast.error(error.response.data.message || "An error occurred.", {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      }
      // Network or other unhandled errors
      else if (error.request) {
        toast.error("No response from the server. Please check your network.", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
      // Other unknown errors
      else {
        toast.error(`Error: ${error.message}`, {
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

  const getAllAssetDetails = async (
    page = 1,
    limit = 10,
    searchQuery = ""
  ): Promise<any> => {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/amsservices/requestallassets?page=${page}&limit=${limit}&searchQuery=${searchQuery}`,
        config
      );

      return response.data;
    } catch (error: any) {
      toast.error(error.message, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      return { data: [], totalAssets: 0, numberOfPages: 0, currentPage: 1 };
    }
  };
  const getAllCheckInAssets = async (
    page = 1,
    limit = 10,
    searchQuery = ""
  ): Promise<any> => {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/amsservices/requestcheckinassets?page=${page}&limit=${limit}&searchQuery=${searchQuery}`,
        config
      );

      return response.data;
    } catch (error: any) {
      toast.error(error.message, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      return { data: [], totalAssets: 0, numberOfPages: 0, currentPage: 1 };
    }
  };

  const getAllCheckOutAssets = async (
    page = 1,
    limit = 10,
    searchQuery = ""
  ): Promise<any> => {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/amsservices/requestcheckoutassets?page=${page}&limit=${limit}&searchQuery=${searchQuery}`,
        config
      );

      return response.data;
    } catch (error: any) {
      toast.error(error.message, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      return { data: [], totalAssets: 0, numberOfPages: 0, currentPage: 1 };
    }
  };
  const getInActiveAssets = async (
    page = 1,
    limit = 10,
    searchQuery = ""
  ): Promise<any> => {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/amsservices/requestinactiveassets?page=${page}&limit=${limit}&searchQuery=${searchQuery}`,
        config
      );

      return response.data;
    } catch (error: any) {
      toast.error(error.message, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      return { data: [], totalAssets: 0, numberOfPages: 0, currentPage: 1 };
    }
  };
  const getTabBarCounter = async (
    
  ): Promise<any> => {
 
   

    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/amsservices/tabbarcounter`,
        
      );

      return response.data;
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
  getTabBarCounter

  const getSingleAssetDetail = async (
    assetId: string
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    const token = localStorage.getItem("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    if (!assetId || typeof assetId !== "string" || !assetId.trim()) {
      return { success: false, error: "Invalid asset ID provided." };
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/amsservices/requestsingleasset?assetId=${assetId}`,
        config
      );

      const details = response.data?.data;

      if (!details) {
        return {
          success: false,
          error: "No data found for the given asset ID.",
        };
      }

      dispatch({
        type: UPDATE_SINGLE_DETAILS_STATE,
        payload: { details },
      });

      return { success: true, data: details };
    } catch (error: any) {
      console.error("Error in getSingleAssetDetail:", error.message);
      return {
        success: false,
        error: "Failed to fetch asset details invalid Id.",
      };
    }
  };

  const searchAsset = async (searchQuery: string): Promise<any> => {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const searchedAssets = await axios.get(
        `http://localhost:5000/api/v1/amsservices/requestsearchedasset?searchQuery=${searchQuery}`,
        config
      );

      return searchedAssets.data.data;
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

  const submitAssignedAsset = async (submissionData: any): Promise<any> => {
    const token = localStorage.getItem("token");
    console.log(submissionData);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/amsservices/assignasset",
        submissionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Hardware assigned successfully", {
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

  const fetchAssignedDetails = async (id: string): Promise<any> => {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const fetchedDetail = await axios.get(
        `http://localhost:5000/api/v1/amsservices/fetchassignasset?assetId=${id}`,
        config
      );

      return fetchedDetail.data.data; // Return fetched details from the response
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to fetch assigned details!",
        {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );

      // Return null or handle the error properly
      return null;
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
        searchAsset,
        submitAssignedAsset,
        fetchAssignedDetails,
        updateHardwareDetails,
        getAllCheckInAssets,
        getAllCheckOutAssets,
        getInActiveAssets,
        getTabBarCounter
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
