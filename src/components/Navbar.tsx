import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Button,
} from "@mui/material";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/router";
import Link from "next/link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LogoutIcon from "@mui/icons-material/Logout";
import { handleLogout } from "@/utils/utils";
import axios from "axios";

const navbarDesign = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: "0 16px",
  width: "100%",
  position: "fixed",
  top: 0,
  left: 0,
  zIndex: 1000,
  backgroundColor: "#fff",
  color: "#504083",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  paddingTop: "10px",
  paddingBottom: "10px",
  height: "64px",
};

const titleStyle = {
  flexGrow: 1,
  fontWeight: "600",
  cursor: "pointer",
  "&:hover": {
    opacity: 0.8,
  },
};

const userInfoStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const logoutButtonStyle = {
  color: "#504083",
  textTransform: "none",
  marginLeft: "8px",
  fontSize: "0.875rem",
};

const Navbar: React.FC = () => {
  const router = useRouter();
  const [userName, setUserName] = useState("User");

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get the user ID from localStorage or cookies
        const userId = localStorage.getItem("userId");

        if (userId) {
          const response = await axios.get(
            `http://localhost:4002/api/v1/amsservices/users/${userId}`,
            {
              withCredentials: true,
            }
          );

          if (response.data && response.data.data) {
            const userData = response.data.data;
            setUserName(userData.name || userData.email || "User");
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const logoutUser = () => {
    handleLogout();
  };

  const handleBackToApps = () => {
    window.location.href = "http://localhost:5173/auth/apps";
  };

  const handleTitleClick = () => {
    window.location.href = "http://localhost:3500/app/ams";
  };

  return (
    <Box sx={navbarDesign}>
      {/* Back to apps button */}
      <IconButton sx={{ mr: 2, color: "#504083" }} onClick={handleBackToApps}>
        <ArrowBackIcon />
      </IconButton>

      {/* Logo/Title - now clickable */}
      <Typography variant="h6" sx={titleStyle} onClick={handleTitleClick}>
        AMS
      </Typography>

      {/* User greeting and logout */}
      <Box sx={userInfoStyle}>
        <Typography sx={{ fontSize: "0.9rem" }}>Hi, {userName}</Typography>
        <Button
          startIcon={<LogoutIcon />}
          sx={logoutButtonStyle}
          onClick={logoutUser}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default Navbar;
