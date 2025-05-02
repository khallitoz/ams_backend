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
import { AppReducer } from "./AppReducer";
import {
  belzirAxiosGet,
  belzirAxiosPost,
  belzirAxiosPut,
} from "../utils/axiosHelper";
// Make sure this is typed if necessary
import {
  UPDATE_SINGLE_DETAILS_STATE,
  UPDATE_SOFTWARE_DETAILS_STATE,
} from "./actions";

import { toast } from "react-toastify";

// Define the initial state type
interface StateType {
  showAlert: boolean;
  alertText: string;
  alertType: string;
  singleStateData: any;
  singleSoftwareData: any;
}

// Initial state
const initialState: StateType = {
  showAlert: false,
  alertText: "",
  alertType: "",
  singleStateData: null,
  singleSoftwareData: null,
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
  addHardwareDetails: (formData: FormData) => Promise<boolean>;
  addSofwareDetails: (values: {}) => Promise<boolean>;
  addBulkMaintenance: (values: {}) => Promise<boolean>;
  updateHardwareDetails: (id: string, formData: FormData) => Promise<boolean>;
  getAllAssetDetails: (
    page: number,
    limit: number,
    searchQuery: string
  ) => Promise<any>;
  getAllSoftwareAssetDetails: (
    page: number,
    limit: number,
    searchQuery: string
  ) => Promise<any>;
  fetchSoftwareTickets: (
    page: number,
    limit: number,
    searchQuery: string,
    id: string
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
  getSoftwareAssetDetail: (id: string) => Promise<any>;
  searchAsset: (searchQuery: string) => Promise<any>;
  submitAssignedAsset: (submissionData: string[]) => Promise<any>;
  submitInstalledSoftware: (submissionData: string[]) => Promise<any>;
  fetchAssignedDetails: (id: string) => Promise<any>;
  fetchInstalledSoftwares: (id: string) => Promise<any>;
  fetchAssociatedHardware: (id: string) => Promise<any>;
  fetchSoftwareCategoriesData: (category: string) => Promise<any>;
  fetchSingleSoftwareCategories: (category: string, id: string) => Promise<any>;
  fetchMaintenanceData: (
    maintenanceType: string,
    selectedCategory: string | null,
    specificCategory: string | null
  ) => Promise<any>;
  updateSoftwareDetails: (id: string, values: {}) => Promise<boolean>;
  deleteSoftwareInfo: (id: string) => Promise<any>;
  getTabBarCounter: () => Promise<any>;
  retrieveSoftwareList: () => Promise<any>;
  fetchAssetInfo: (assetType: string) => Promise<any>;

  bulkSoftwareWareInstallation: (
    selectedSoftware: string[],
    selectedHardware: string[]
  ) => Promise<any>;

  fetchAllMaintenance: (
    page: number,
    limit: number,
    searchQuery: string
  ) => Promise<any>;
  updateMaintenanceStatus: (
    id: string,
    data: { status: string; comment: string }
  ) => Promise<any>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(AppReducer, initialState);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  // Add function to get token from cookies
  const getTokenFromCookies = () => {
    const cookies = document.cookie.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    return cookies.token || cookies.accessToken;
  };

  const addHardwareDetails = async (formData: FormData): Promise<boolean> => {
    try {
      const response = await belzirAxiosPost(
        "http://localhost:4002/api/v1/amsservices/addhardware",
        formData
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

  const bulkSoftwareWareInstallation = async (
    selectedSoftwares: string[],
    selectedHardwares: string[]
  ): Promise<any> => {
    try {
      const response = await belzirAxiosPost(
        "http://localhost:4002/api/v1/amsservices/installselectedcategories",
        {
          softwareIds: selectedSoftwares,
          hardwareIds: selectedHardwares,
        }
      );

      if (response.data.success) {
        toast.success("Hardware and software details submitted successfully!", {
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

  const addSofwareDetails = async (values: {}): Promise<boolean> => {
    const token = getTokenFromCookies();

    try {
      const response = await belzirAxiosPost(
        "http://localhost:4002/api/v1/amsservices/addsoftware",
        values
      );

      if (response.data.success) {
        toast.success("Software submitted successfully!", {
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
  const addBulkMaintenance = async (values: {}): Promise<boolean> => {
    try {
      const response = await belzirAxiosPost(
        "http://localhost:4002/api/v1/amsservices/addbulkmaintenance",
        values
      );

      if (response.data.success) {
        toast.success("Software submitted successfully!", {
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
    try {
      const response = await belzirAxiosPut(
        `http://localhost:4002/api/v1/amsservices/updatehardware/${id}`,
        formData
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

  const updateSoftwareDetails = async (
    id: string,
    values: any
  ): Promise<any> => {
    const token = getTokenFromCookies();
    try {
      const response = await axios.put(
        `http://localhost:4002/api/v1/amsservices/updatesoftware/${id}`,
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data.message || "Validation failed.", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }

      // Handle server errors
      else if (error.response && error.response.status === 500) {
        toast.error("Server error occurred. Please try again later.", {
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
    try {
      const response = await belzirAxiosGet(
        `http://localhost:4002/api/v1/amsservices/requestallassets?page=${page}&limit=${limit}&searchQuery=${searchQuery}`
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
  const getAllSoftwareAssetDetails = async (
    page = 1,
    limit = 10,
    searchQuery = ""
  ): Promise<any> => {
    try {
      const response = await belzirAxiosGet(
        `http://localhost:4002/api/v1/amsservices/requestsoftwareassets?page=${page}&limit=${limit}&searchQuery=${searchQuery}`
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
    try {
      const response = await belzirAxiosGet(
        `http://localhost:4002/api/v1/amsservices/requestcheckinassets?page=${page}&limit=${limit}&searchQuery=${searchQuery}`
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
    try {
      const response = await belzirAxiosGet(
        `http://localhost:4002/api/v1/amsservices/requestcheckoutassets?page=${page}&limit=${limit}&searchQuery=${searchQuery}`
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
    try {
      const response = await belzirAxiosGet(
        `http://localhost:4002/api/v1/amsservices/requestinactiveassets?page=${page}&limit=${limit}&searchQuery=${searchQuery}`
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
  const getTabBarCounter = async (): Promise<any> => {
    try {
      const response = await belzirAxiosGet(
        `http://localhost:4002/api/v1/amsservices/tabbarcounter`
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
  getTabBarCounter;

  const getSingleAssetDetail = async (
    assetId: string
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    if (!assetId || typeof assetId !== "string" || !assetId.trim()) {
      return { success: false, error: "Invalid asset ID provided." };
    }

    try {
      const response = await belzirAxiosGet(
        `http://localhost:4002/api/v1/amsservices/requestsingleasset?assetId=${assetId}`
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

  const getSoftwareAssetDetail = async (
    assetId: string
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    if (!assetId || typeof assetId !== "string" || !assetId.trim()) {
      return { success: false, error: "Invalid asset ID provided." };
    }

    try {
      const response = await belzirAxiosGet(
        `http://localhost:4002/api/v1/amsservices/requestsoftwareassetdetails?assetId=${assetId}`
      );

      const details = response.data?.data;

      if (!details) {
        return {
          success: false,
          error: "No data found for the given asset ID.",
        };
      }

      dispatch({
        type: UPDATE_SOFTWARE_DETAILS_STATE,
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
    const token = getTokenFromCookies();
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const searchedAssets = await axios.get(
        `http://localhost:4002/api/v1/amsservices/requestsearchedasset?searchQuery=${searchQuery}`,
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
    try {
      const response = await belzirAxiosPost(
        "http://localhost:4002/api/v1/amsservices/assignasset",
        submissionData
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

  const submitInstalledSoftware = async (submissionData: any): Promise<any> => {
    try {
      const response = await belzirAxiosPost(
        "http://localhost:4002/api/v1/amsservices/submitinstalledsoftware",
        submissionData
      );

      if (response.data.success) {
        toast.success("Software assigned successfully", {
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
        const err = error.response.data.message;

        toast.error(err, {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
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

  const fetchInstalledSoftwares = async (id: string): Promise<any> => {
    try {
      const fetchedDetail = await belzirAxiosGet(
        `http://localhost:4002/api/v1/amsservices/fetchinstalledsoftwares?assetId=${id}`
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

  const fetchAssetInfo = async (assetType: string): Promise<any> => {
    const token = getTokenFromCookies();
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const fetchedDetail = await axios.get(
        `http://localhost:4002/api/v1/amsservices/fetchassetinfo?assetType=${assetType}`,
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

  const fetchAssociatedHardware = async (id: string): Promise<any> => {
    try {
      const fetchedDetail = await belzirAxiosGet(
        `http://localhost:4002/api/v1/amsservices/fetchassociatedhardwares?assetId=${id}`
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

  const fetchSoftwareCategoriesData = async (
    category: string
  ): Promise<any> => {
    try {
      const fetchedDetail = await belzirAxiosGet(
        `http://localhost:4002/api/v1/amsservices/fetchSoftwarecategorydata?category=${category}`
      );

      return fetchedDetail.data; // Return fetched details from the response
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

  const fetchMaintenanceData = async (
    maintenanceType: string,
    selectedCategory: string | null,
    specificCategory: string | null
  ): Promise<any> => {
    try {
      const fetchedDetail = await belzirAxiosGet(
        `http://localhost:4002/api/v1/amsservices/fetchmaintenancedata?maintenancetype=${maintenanceType}&selectedCategory=${
          selectedCategory || ""
        }&specificCategory=${specificCategory || ""}`
      );
      console.log(fetchedDetail);
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
  const fetchSingleSoftwareCategories = async (
    category: string,
    id: string
  ): Promise<any> => {
    try {
      const fetchedDetail = await belzirAxiosGet(
        `http://localhost:4002/api/v1/amsservices/fetchsingleSoftwarecategorydata?category=${category}&softwareId=${id}
`
      );

      return fetchedDetail.data; // Return fetched details from the response
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

  const fetchAssignedDetails = async (id: string): Promise<any> => {
    try {
      const fetchedDetail = await belzirAxiosGet(
        `http://localhost:4002/api/v1/amsservices/fetchassignasset?assetId=${id}`
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

  const deleteSoftwareInfo = async (id: string): Promise<any> => {
    try {
      const fetchedDetail = await belzirAxiosPost(
        `http://localhost:4002/api/v1/amsservices/deletesoftwareinfo?softwareId=${id}`
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

  const retrieveSoftwareList = async (): Promise<any> => {
    const token = getTokenFromCookies();

    try {
      const response = await belzirAxiosGet(
        `http://localhost:4002/api/v1/amsservices/retrievesoftwarelist`
      );

      return response.data.data;
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

  const fetchSoftwareTickets = async (
    page = 1,
    limit = 10,
    searchQuery = "",
    id: string
  ): Promise<any> => {
    const token = getTokenFromCookies();
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    };
    try {
      const fetchedDetail = await axios.get(
        `http://10.0.6.56:5000/api/tickets/fetchdetails?page=${page}&limit=${limit}&searchQuery=${searchQuery}&softwareId=${id}`,
        config
      );

      return fetchedDetail.data; // Return fetched details from the response
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

  const fetchAllMaintenance = async (
    page = 1,
    limit = 10,
    searchQuery = ""
  ): Promise<any> => {
    try {
      const response = await belzirAxiosGet(
        `http://localhost:4002/api/v1/amsservices/fetchallmaintenance?page=${page}&limit=${limit}&searchQuery=${searchQuery}`
      );
      return response.data;
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to fetch maintenance tasks!",
        {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
      return null;
    }
  };

  const updateMaintenanceStatus = async (
    id: string,
    data: { status: string; comment: string }
  ): Promise<any> => {
    try {
      const response = await belzirAxiosPut(
        `http://localhost:4002/api/v1/amsservices/updatemaintenancestatus/${id}`,
        data
      );

      if (response.data.success) {
        toast.success("Maintenance status updated successfully!", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return response.data;
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

  return (
    <AppContext.Provider
      value={{
        ...state,
        token,

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
        getTabBarCounter,
        submitInstalledSoftware,
        fetchInstalledSoftwares,
        deleteSoftwareInfo,
        addSofwareDetails,
        retrieveSoftwareList,
        getAllSoftwareAssetDetails,
        getSoftwareAssetDetail,
        fetchAssociatedHardware,
        updateSoftwareDetails,
        fetchSoftwareCategoriesData,
        fetchSingleSoftwareCategories,
        bulkSoftwareWareInstallation,
        fetchAssetInfo,
        fetchSoftwareTickets,
        fetchMaintenanceData,
        addBulkMaintenance,
        fetchAllMaintenance,
        updateMaintenanceStatus,
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
