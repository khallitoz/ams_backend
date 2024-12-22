import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useAppContext } from "../../context/AppContext";

const statusDesign = {
  marginTop: "10px",
  height: "100vh",
  padding: "20px",
  backgroundColor: "#f4f6f8",
  maxHeight: "700px",
  overflowY: "auto",
};

const sectionHeader = {
  marginBottom: "10px",
  fontWeight: "bold",
  fontSize: "1.5rem",
};

const attachmentContainer = {
  padding: "20px",
  backgroundColor: "white",
  borderRadius: "8px",
  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
};

const attachmentCard = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px",
  backgroundColor: "#fafafa",
  border: "1px solid #e0e0e0",
  borderRadius: "8px",
  marginBottom: "10px",
};

const fileNameStyle = {
  fontWeight: "bold",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const buttonStyle = {
  padding: "6px 16px",
};

const imageStyle = {
  width: "100px",
  height: "100px",
  objectFit: "contain",
};

const pdfStyle = {
  width: "100px",
  height: "100px",
  border: "none",
};

const Status: React.FC = () => {
  const { singleStateData } = useAppContext();

  return <Box sx={statusDesign}></Box>;
};

export default Status;
