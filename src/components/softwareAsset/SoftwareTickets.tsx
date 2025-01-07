import React, { useEffect, useState } from "react";

import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Modal,
  TextField,
  Stack,
} from "@mui/material";

import CircularProgress from "@mui/material/CircularProgress";
import ClearIcon from "@mui/icons-material/Clear";
import EditIcon from "@mui/icons-material/Edit";

import { useAppContext } from "../../context/AppContext";

const assetSoftwareDesign = {
  marginTop: "5px",
  padding: "20px",
  backgroundColor: "#f4f6f8",
};

const checkInDesign = {
  marginLeft: "3px",
  borderRadius: "5px",
  padding: "3px",
  color: "white",
  backgroundColor: "#5CB85C",
};

const checkOutDesign = {
  marginLeft: "3px",
  borderRadius: "5px",
  padding: "3px",
  color: "#ffffff",
  backgroundColor: "#F0AD4E",
};

const tableDesign = {
  border: "1px solid #e0e0e0",
  marginTop: "20px",
  width: "70%",
  borderRadius: "8px",
  overflowY: "auto",
  boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
  "& .MuiTableHead-root": {
    backgroundColor: "#666666",
    "& .MuiTableCell-root": {
      backgroundColor: "#666666",
      color: "#ffffff",
      fontWeight: "bold",
      fontSize: "18px",
    },
  },
  "& .MuiTableCell-root": {
    padding: "12px",
    fontSize: "14px",
  },
  "& .MuiTableRow-root": {
    transition: "background-color 0.3s ease",
    "&:hover": {
      backgroundColor: "#e8f0fe",
    },
  },
  "& .MuiTableRow-root:nth-of-type(even)": {
    backgroundColor: "#f4f4f4",
  },
};

const SoftwareTickets: React.FC = () => {
  const { singleSoftwareData, fetchSoftwareTickets } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  const fetchTickets = () => {
    fetchSoftwareTickets("software", singleSoftwareData._id);
  };
  useEffect(() => {
    fetchTickets();
  }, []);

  if (isLoading) {
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", marginTop: "50px" }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <Box sx={assetSoftwareDesign}></Box>;
};

export default SoftwareTickets;
