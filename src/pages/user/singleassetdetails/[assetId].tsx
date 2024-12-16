import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
    Box,
    Typography,
    CircularProgress,
    Breadcrumbs,
    Table,
    TableBody,
    TableRow,
    TableCell,
    Paper,
    Button,
} from "@mui/material";
import { useAppContext } from "../../../context/AppContext";
import Sidebar from "@/components/Sidebar";
import AssetTabBar from "@/components/AssetTabBar";

const dashboardStyles = {
    container: {
        display: "flex",
    },
    content: {
        width: "100%",
        marginLeft: "290px",
        marginTop: "100px",
        display: "flex",
        flexDirection: "column" as const,
        backgroundColor: "white",
        borderTop: "1px solid #d5d5d5",
        gap: "20px",
        padding: "20px",

    },
    link: {
        textDecoration: "none",
        fontSize: "16px",
        color: "inherit",
        "&:hover": {
            textDecoration: "underline",
        },
    },
    tableContainer: {
        marginTop: "20px",
        width: "60%",
        marginX: "20px"
    },
    assetInfoRow: {
        backgroundColor: "#483D8B",
        color: "white",
        textAlign: "center",
        fontSize: "20px",
        fontWeight: "bold",
    },
    tableRow: {
        transition: "background-color 0.3s",
        "&:hover": {
            backgroundColor: "#D9DAE5",
        },
    },
};

const SingleAssetDetails: React.FC = () => {
    const router = useRouter();
    const { assetId } = router.query;
    const { getSingleAssetDetail } = useAppContext();
    const [loading, setLoading] = useState<boolean>(true);
    const [assetData, setAssetData] = useState<any | null>(null);

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
                {/* Breadcrumbs */}
                <Breadcrumbs aria-label="breadcrumb">
                    <Link href="/user/dashboard" passHref>
                        <Typography sx={dashboardStyles.link}>Dashboard</Typography>
                    </Link>
                    <Link href="/user/allassets" passHref>
                        <Typography sx={dashboardStyles.link}>All Assets</Typography>
                    </Link>
                    <Typography sx={{ color: "text.primary" }}>
                        Asset Number {assetData.assetCount}
                    </Typography>
                </Breadcrumbs>

                {/* Asset Tab Bar */}
                <Box>
                    <AssetTabBar />
                </Box>

                {/* Asset Details Table */}
                <Box sx={dashboardStyles.tableContainer}>
                    <Box sx={{ display: "flex" }}><Button variant="contained" sx={{ marginBottom: "10px", backgroundColor: "#483D8B" }}>Print</Button></Box>
                    {assetData ? (
                        <Paper elevation={3}>
                            <Table>
                                <TableBody>
                                    {/* Asset Info Header */}
                                    <TableRow>
                                        <TableCell
                                            colSpan={2}
                                            sx={dashboardStyles.assetInfoRow}
                                        >
                                            Asset Info
                                        </TableCell>
                                    </TableRow>
                                    {/* Asset Details */}

                                    <TableRow sx={dashboardStyles.tableRow}>
                                        <TableCell><b>Asset Number</b></TableCell>
                                        <TableCell>{assetData.assetCount || "N/A"}</TableCell>
                                    </TableRow>
                                    <TableRow sx={dashboardStyles.tableRow}>
                                        <TableCell><b>Asset Name</b></TableCell>
                                        <TableCell>{assetData.assetName || "N/A"}</TableCell>
                                    </TableRow>

                                    <TableRow sx={dashboardStyles.tableRow}>
                                        <TableCell><b>Description</b></TableCell>
                                        <TableCell>{assetData.description || "N/A"}</TableCell>
                                    </TableRow>
                                    <TableRow sx={dashboardStyles.tableRow}>
                                        <TableCell><b>Category</b></TableCell>
                                        <TableCell>{assetData.category || "N/A"}</TableCell>
                                    </TableRow>
                                    <TableRow sx={dashboardStyles.tableRow}>
                                        <TableCell><b>Condition</b></TableCell>
                                        <TableCell>{assetData.condition || "N/A"}</TableCell>
                                    </TableRow>
                                    <TableRow sx={dashboardStyles.tableRow}>
                                        <TableCell><b>Assigned To</b></TableCell>
                                        <TableCell>{assetData.assignedTo || "N/A"}</TableCell>
                                    </TableRow>
                                    <TableRow sx={dashboardStyles.tableRow}>
                                        <TableCell><b>Price</b></TableCell>
                                        <TableCell>{assetData.price || "N/A"}</TableCell>
                                    </TableRow>
                                    <TableRow sx={dashboardStyles.tableRow}>
                                        <TableCell><b>Warranty Date</b></TableCell>
                                        <TableCell>{assetData.warrantyDate || "N/A"}</TableCell>
                                    </TableRow>
                                    <TableRow sx={dashboardStyles.tableRow}>
                                        <TableCell><b>Warranty Type</b></TableCell>
                                        <TableCell>{assetData.warrantyType || "N/A"}</TableCell>
                                    </TableRow>
                                    <TableRow sx={dashboardStyles.tableRow}>
                                        <TableCell><b>Vendor</b></TableCell>
                                        <TableCell>{assetData.vendor || "N/A"}</TableCell>
                                    </TableRow>
                                    <TableRow sx={dashboardStyles.tableRow}>
                                        <TableCell><b>Status</b></TableCell>
                                        <TableCell>{assetData.status || "N/A"}</TableCell>
                                    </TableRow>
                                    <TableRow sx={dashboardStyles.tableRow}>
                                        <TableCell><b>Model No</b></TableCell>
                                        <TableCell>{assetData.modelNo || "N/A"}</TableCell>
                                    </TableRow>
                                    <TableRow sx={dashboardStyles.tableRow}>
                                        <TableCell><b>Description</b></TableCell>
                                        <TableCell>{assetData.description || "N/A"}</TableCell>
                                    </TableRow>
                                    <TableRow sx={dashboardStyles.tableRow}>
                                        <TableCell><b>Location</b></TableCell>
                                        <TableCell>{assetData.location || "N/A"}</TableCell>
                                    </TableRow>
                                    <TableRow sx={dashboardStyles.tableRow}>
                                        <TableCell><b>Building</b></TableCell>
                                        <TableCell>{assetData.building || "N/A"}</TableCell>
                                    </TableRow>
                                    <TableRow sx={dashboardStyles.tableRow}>
                                        <TableCell><b>Room</b></TableCell>
                                        <TableCell>{assetData.room || "N/A"}</TableCell>
                                    </TableRow>
                                    <TableRow sx={dashboardStyles.tableRow}>
                                        <TableCell><b>Department</b></TableCell>
                                        <TableCell>{assetData.department || "N/A"}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Paper>
                    ) : (
                        <Typography>No asset details available</Typography>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default SingleAssetDetails;
