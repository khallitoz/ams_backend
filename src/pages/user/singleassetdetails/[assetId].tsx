import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Box,
  Typography,
  CircularProgress,
  Breadcrumbs,
  Divider,
} from "@mui/material";
import { useAppContext } from "../../../context/AppContext";
import { toast } from "react-toastify";
import Sidebar from "@/components/Sidebar";
import AssetTabBar from "@/components/AssetTabBar";
import HomeIcon from "@mui/icons-material/Home";
import InventoryIcon from "@mui/icons-material/Inventory";
import Layout from "@/components/Layout";

const dashboardStyles = {
  container: {
    display: "flex",
    marginTop: 0,
  },
  content: {
    width: "82%",
    marginLeft: "18%",
    marginTop: "60px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px",
    padding: "20px",
    overflowY: "auto",
  },
  link: {
    fontSize: "20px",

    backgroundColor: "#D9DAE5",
    borderRadius: "8px",
    color: "black",
    padding: "3px",
    textAlign: "center",

    "&:hover": {},
  },
};
const breadcrumbStyles = {
  breadcrumbContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  breadcrumbItem: {
    display: "flex",
    alignItems: "center",
    padding: "4px 12px",
    borderRadius: "16px",
    backgroundColor: "#D9DAE5",
    color: "#5A4FCF",
    fontSize: "18px",
    fontWeight: "500",
    textDecoration: "none",
  },
  activeItem: {
    backgroundColor: "#5A4FCF",
    color: "white",
  },
  separator: {
    color: "#C4C4C4",
    fontSize: "16px",
  },
};

const SingleAssetDetails: React.FC = () => {
  const router = useRouter();
  const { assetId } = router.query;
  const { getSingleAssetDetail, singleStateData } = useAppContext();
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch single asset data
  const getSingleAssetData = async (id: string | string[] | undefined) => {
    if (!id || Array.isArray(id) || typeof id !== "string" || !id.trim()) {
      toast.error("Invalid asset ID in the URL.", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      // router.replace("/user/allassets"); // Redirect to All Assets
      return;
    }

    try {
      setLoading(true);

      const result = await getSingleAssetDetail(id);

      if (!result.success || !result.data) {
        toast.error(result.error || "Failed to fetch asset details.", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        router.replace("/user/allassets"); // Redirect on invalid or not-found ID
        return;
      }
    } catch (error) {
      console.error("Unexpected error in fetching asset data:", error);
      toast.error("An unexpected error occurred. Redirecting...", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      router.replace("/user/allassets"); // Redirect to All Assets
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assetId) {
      getSingleAssetData(assetId);
    }
  }, [assetId]);

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
      {/* Breadcrumbs */}
      <Breadcrumbs
        aria-label="breadcrumb"
        separator={<span style={breadcrumbStyles.separator}>/</span>}
      >
        <Link href="/" style={breadcrumbStyles.breadcrumbItem}>
          <HomeIcon sx={{ marginRight: "4px", fontSize: "16px" }} />
          Home
        </Link>
        <Link href="/user/allassets" style={breadcrumbStyles.breadcrumbItem}>
          <InventoryIcon sx={{ marginRight: "4px", fontSize: "16px" }} />
          All Assets
        </Link>
        <Typography
          style={{
            ...breadcrumbStyles.breadcrumbItem,
            ...breadcrumbStyles.activeItem,
          }}
        >
          Asset Number {singleStateData?.assetNumber || "N/A"}
        </Typography>
      </Breadcrumbs>

      <AssetTabBar />
      <Divider />
    </Layout>
  );
};

export default SingleAssetDetails;
