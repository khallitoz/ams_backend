import React, { ReactNode } from "react";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface LayoutProps {
  children: ReactNode;
}

const layoutStyle = {
  display: "flex",
};

const contentStyle = {
  width: "calc(100% - 240px)", // Adjusted to match original sidebar width
  marginLeft: "240px", // Updated to match original sidebar width
  display: "flex",
  flexDirection: "column",
  backgroundColor: "white",
  marginTop: "64px", // Matches navbar height
  padding: "24px 30px", // Keeping improved padding for better spacing
  minHeight: "calc(100vh - 64px)", // Full height minus navbar
  boxSizing: "border-box", // Ensures padding is included in width calculation
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={layoutStyle}>
      <Sidebar />
      <Box sx={contentStyle}>{children}</Box>
      <ToastContainer />
    </Box>
  );
};

export default Layout;
