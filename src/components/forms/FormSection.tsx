// components/FormSection.js
import React from "react";
import { Box, Typography } from "@mui/material";

const FormSection = ({ title, children }) => (
  <Box
    sx={{
      border: "1px solid #9a9b9b",
      paddingY: "35px",
      paddingX: "20px",
      position: "relative",
      width: "100%",
      marginTop: "20px",
    }}
  >
    <Typography
      variant="h6"
      sx={{
        position: "absolute",
        top: "-10px",
        left: "10px",
        background: "#504083",
        color: "white",
        zIndex: 1,
        padding: "0 5px",
      }}
    >
      {title}
    </Typography>
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      {children}
    </Box>
  </Box>
);

export default FormSection;
