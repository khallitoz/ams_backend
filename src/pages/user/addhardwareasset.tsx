import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Typography } from "@mui/material";
import Layout from "@/components/Layout";
import "react-toastify/dist/ReactToastify.css";
import HardwareForm from "@/components/forms/HardwareForm";
import TopLoader from "@/components/TopLoader";

const HardwareAsset: React.FC = () => {
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
    return <TopLoader />;
  }

  return (
    <Layout>
      <HardwareForm />
    </Layout>
  );
};

export default HardwareAsset;
