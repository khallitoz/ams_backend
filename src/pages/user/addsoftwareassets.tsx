import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { Box, Typography, CircularProgress } from "@mui/material";
import Sidebar from "@/components/Sidebar";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import SoftwareForm from "@/components/forms/SoftwareForm";
import Layout from "@/components/Layout";

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
    <Layout>
      <SoftwareForm />
    </Layout>
  );
};

export default SoftwareAsset;
