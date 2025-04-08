import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/router";
import Link from "next/link";

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
  backgroundColor: "white",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  paddingTop: "10px",
  paddingBottom: "10px",
};

const centerNavbarDesign = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  gap: 4,
  flexGrow: 1,
};

const linkDesign = {
  textDecoration: "none", // No underline
  cursor: "pointer",
  color: "#848484", // Default link color
  "&:hover": {
    textDecoration: "none", // No underline on hover
    color: "#343434", // Hover color
  },
};

const Navbar: React.FC = () => {
  const { token, logUserOff } = useAppContext();

  const router = useRouter();

  const logoutUser = () => {
    logUserOff();
  };

  return (
    <>
      {token && (
        <Box sx={navbarDesign}>
          {/* Display the selected URL */}
          <Typography
            variant="h5"
            height={40}
            sx={{ color: "", fontWeight: "bold" }}
          ></Typography>
        </Box>
      )}
    </>
  );
};

export default Navbar;
