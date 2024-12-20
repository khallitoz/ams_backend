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
import Sidebar from "@/components/Sidebar";
import AssetTabBar from "@/components/AssetTabBar";

const dashboardStyles = {
    container: {
        display: "flex",
        marginTop: 0
    },
    content: {
        width: "100%",
        marginLeft: "290px",
        marginTop: "120px", // Matches the height of AssetTabBar + Breadcrumbs
        display: "flex",
        flexDirection: "column" as const,
        backgroundColor: "white",
        borderTop: "1px solid #d5d5d5",
        gap: "20px",
        padding: "20px",
        height: "calc(100vh - 120px)", // Full viewport height minus fixed elements
        overflowY: "auto", // Allows scrolling for content

    },
    link: {
        textDecoration: "none",
        fontSize: "20px",
        color: "#483D8B",
        "&:hover": {
            textDecoration: "underline",
        },
    },
    breadcrumb: {
        marginTop: "20px"
    }

};

const SingleAssetDetails: React.FC = () => {
    const router = useRouter();
    const { assetId } = router.query;
    const { getSingleAssetDetail, singleStateData } = useAppContext();
    const [loading, setLoading] = useState<boolean>(true);


    // Fetch single asset data
    const getSingleAssetData = async (id: string | string[] | undefined) => {
        if (!id || Array.isArray(id)) return;
        try {
            setLoading(true);
            const data = await getSingleAssetDetail(id);
            setAssetData(data);
        } catch (error) {
            console.error("Error fetching single asset data:", error);
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
        <Box sx={dashboardStyles.container}>
            <Sidebar />
            <Box sx={dashboardStyles.content}>
                <Box sx={{
                    width: "83%",
                    position: "fixed",
                    backgroundColor: "white",
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                }}>
                    {/* Breadcrumbs */}
                    <Breadcrumbs aria-label="breadcrumb" sx={dashboardStyles.breadcrumb} >
                        <Link href="/user/dashboard" passHref>
                            <Typography sx={dashboardStyles.link}>DASHBOARD</Typography>
                        </Link>
                        <Link href="/user/allassets" passHref>
                            <Typography sx={dashboardStyles.link} variant="h4">ALL ASSETS</Typography>
                        </Link>
                        <Typography sx={dashboardStyles.link}>
                            ASSET NUMBER {singleStateData.assetCount}
                        </Typography>
                    </Breadcrumbs>


                    <AssetTabBar />
                    <Divider />
                </Box>

            </Box>
        </Box >
    );
};

export default SingleAssetDetails;
