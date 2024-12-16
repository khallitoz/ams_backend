import * as React from "react";
import { useState, useEffect } from "react";
import Divider from "@mui/material/Divider";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AddIcon from "@mui/icons-material/Add";
import Link from "next/link";
import { Box, Button, Typography } from "@mui/material";
import "react-toastify/dist/ReactToastify.css";

const sidebarLinkDesign = {
  textDecoration: "none", // No underline
  cursor: "pointer",
  marginBottom: "12px",
  color: "white", // Default link color
  "&:hover": {
    textDecoration: "none", // No underline on hover
    color: "#343434", // Hover color
  },
};

const assestMenuDesign = {
  display: "flex",
  flexDirection: "column", // Ensure the items are stacked vertically
  // Push content to the right (main axis alignment)
  marginLeft: "50px", // Align items at the right on the cross axis
  marginTop: "20px", // Optional margin for spacing
};

const Sidebar = () => {
  return (
    <Box
      sx={{
        width: "100px",
        height: "100vh",
        background: "#666666",
        position: "fixed", // Fix the sidebar to the left
        top: 78, // Align it to the top
        left: 0, // Align it to the left
        width: "300px", // Sidebar width
        height: "100vh", // Full height of the viewport
        marginLeft: "10px",
        display: "flex",
        flexDirection: "column",
        margin: 0,
        padding: "20px",
        boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Box>
        <Link href="/user/dashboard" style={{ textDecoration: "none" }}>
          <Typography
            sx={{
              marginBottom: "30px",
              color: "white",
              fontWeight: "bold",
              fontSize: "18px",
            }}
          >
            DASHBOARD
          </Typography>
        </Link>
        <Box>
          <Link
            href="/user/allassets"
            style={{ textDecoration: "none", cursor: "pointer" }}
          >
            <Typography style={sidebarLinkDesign}>Assets</Typography>
          </Link>
        </Box>
        <Box sx={assestMenuDesign}>
          <Link href="/user/allassets" style={sidebarLinkDesign}>
            <Typography>Assets</Typography>
          </Link>

          <Link href="/user/addhardwareasset" style={sidebarLinkDesign}>
            <Typography>New Asset</Typography>
          </Link>

          <Link href="/user/requestvacation" style={sidebarLinkDesign}>
            <Typography>Preventive Maintenance</Typography>
          </Link>

          <Link href="/user/requestvacation" style={sidebarLinkDesign}>
            <Typography>Preventive Maintenance</Typography>
          </Link>

          <Link href="/user/requestvacation" style={sidebarLinkDesign}>
            <Typography>Software Assets</Typography>
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;
