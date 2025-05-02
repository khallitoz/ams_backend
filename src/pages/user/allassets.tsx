import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Box, Typography } from "@mui/material";

import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import Layout from "@/components/Layout";

const dashboardStyles = {
  container: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
  },
  content: {
    width: "82%",
    marginLeft: "18%",
    marginTop: "80px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px",
    padding: "20px",
  },
  table: {
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    overflowY: "auto",
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
    "& .MuiTableHead-root": {
      "& .MuiTableCell-root": {
        backgroundColor: "#483D8B",
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
  },
  searchContainer: {
    display: "flex",
    marginBottom: "0",
  },
  searchInput: {
    width: "40%",
    "& .MuiInputBase-root": {
      borderBottom: "2px solid #483D8B",
    },
  },
};

const AllAssets: React.FC = () => {
  return (
    <Layout>
      <Typography sx={{ fontSize: "25px" }}>All Hardware Assets</Typography>

      <Box>
        <TabBar />
      </Box>
    </Layout>
  );
};

export default AllAssets;
