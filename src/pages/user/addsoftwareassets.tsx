import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { Box, Typography, CircularProgress } from "@mui/material";
import Sidebar from "@/components/Sidebar";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import SoftwareForm from "@/components/forms/SoftwareForm";

const dashboardDesign = {
  display: "flex",
};

const SoftwareAsset: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // useEffect(() => {
  //   const validateRole = async () => {
  //     const role = localStorage.getItem("role");

  //     if (role !== "user") {
  //       router.push("/unauthorised");
  //     } else {
  //       setLoading(false);
  //     }
  //   };

  //   validateRole();
  // }, [router]);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <CircularProgress
        sx={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
    );
  }

  return (
    <Box sx={dashboardDesign}>
      <Sidebar />

      <Box
        sx={{
          width: "100%",
          marginLeft: "18%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white",
          marginTop: "12px",
          borderTop: "1px solid #d5d5d5",
          gap: "20px",
          padding: "20px",
          marginBottom: "2px",
        }}
      >
        <Typography sx={{ fontSize: "25px", marginTop: "40px" }}></Typography>

        <Box
          sx={{
            width: "100%",
            marginLeft: "20px",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "white",
            marginTop: "-30px",

            gap: "20px",
            padding: "20px",
          }}
        >
          <SoftwareForm />
        </Box>
      </Box>
      <ToastContainer />
    </Box>
  );
};

export default SoftwareAsset;
