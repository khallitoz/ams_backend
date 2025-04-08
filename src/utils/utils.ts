import { toast } from "react-toastify";
import { belzirAxiosGet } from "./axiosHelper";
import Cookies from "js-cookie";

export const handleLogout = async () => {
  try {
    const response = await belzirAxiosGet("/api/users/logout");

    if (response.data && response.status === 200) {
      setCookie("auth_token", "");
      toastPopup.success("Logged Out!");
      localStorage.removeItem("userId");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      toastPopup.error("Could not logout!");
    }
  } catch (error) {
    console.error("Error Logging out:", error);
  }
};

export const handleAllDeviceLogout = async () => {
  try {
    const response = await belzirAxiosGet("/api/users/logout-all-devices");

    if (response.data && response.status === 200) {
      setCookie("auth_token", "");
      toastPopup.success("Logged Out of all devices!");
      localStorage.removeItem("userId");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      toastPopup.error("Could not logout!");
    }
  } catch (error) {
    console.error("Error Logging out:", error);
  }
};

// Utility function to get the cookie by name
export const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
};

export const setCookie = (name: string, value: string) => {
  Cookies.set(name, value, {
    secure: true,
    sameSite: "Strict",
  });
};

export const toastPopup = {
  success: (msg: string) =>
    toast.success(msg, {
      position: "top-right",
      autoClose: 1000,
    }),
  error: (msg: string) =>
    toast.error(msg, {
      position: "top-right",
      autoClose: 1000,
    }),
  info: (msg: string) =>
    toast.info(msg, {
      position: "top-right",
      autoClose: 2000,
    }),
};
