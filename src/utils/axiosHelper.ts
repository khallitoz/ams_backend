import axios from "axios";
import { setCookie } from "./utils";
import dotenv from "dotenv";
dotenv.config();

export const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const belzirAxios = axios.create({
  baseURL: `${REACT_APP_BACKEND_URL}`,
  withCredentials: true, // Ensures cookies (auth_token) are sent
});

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

const subscribeTokenRefresh = (callback: () => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};

belzirAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 error occurs & it's NOT already retried, refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // If refresh is already in progress, queue the request
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => {
            resolve(belzirAxios(originalRequest)); // Retry request after refresh
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshResponse = await axios.get(
          `http://localhost:4000/auth/api/users/token/refresh`,
          {
            withCredentials: true,
          }
        );

        if (refreshResponse?.data?.valid) {
          onRefreshed();
          return belzirAxios(originalRequest);
        } else {
          console.log("Refresh token expired. Redirecting to login.");
          logout();
        }
      } catch (refreshError: any) {
        if (refreshError.response?.status === 401) {
          console.log("Refresh token is invalid or expired. Logging out.");
          logout();
        } else {
          console.error("Unexpected error:", refreshError);
        }
        logout();
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

const logout = () => {
  setCookie("auth_token", "");
  setCookie("refresh_token", "");

  // Check if the user is already on the login page
  if (
    window.location.pathname !== "/auth/login" &&
    window.location.pathname !== "/auth/register" &&
    window.location.pathname !== "/auth/forgot-password" &&
    window.location.pathname !== "/auth/password-reset" &&
    window.location.pathname !== "/auth/verify"
  ) {
    window.location.href = "/auth/login";
  }
};

// Modified Helper Functions Using Interceptors**
export const belzirAxiosGet = (endpoint: string, params: any = {}) => {
  return belzirAxios.get(endpoint, { params });
};

export const belzirAxiosPost = (endpoint: string, data: any) => {
  return belzirAxios.post(endpoint, data);
};

export const belzirAxiosPut = (endpoint: string, data: any) => {
  return belzirAxios.put(endpoint, data);
};

export const belzirAxiosDelete = (endpoint: string) => {
  return belzirAxios.delete(endpoint);
};

export default belzirAxios;
