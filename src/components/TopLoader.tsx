import React from "react";
import { Box, CircularProgress } from "@mui/material";

const TopLoader: React.FC = () => {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: "20px",
        position: "fixed",
        top: "64px", // Position below the navbar
        left: 0,
        zIndex: 1100, // Higher than navbar to ensure visibility
        backgroundColor: "rgba(255, 255, 255, 0.8)", // Semi-transparent background
      }}
    >
      <CircularProgress sx={{ color: "#5a5588" }} />
    </Box>
  );
};

export default TopLoader;
