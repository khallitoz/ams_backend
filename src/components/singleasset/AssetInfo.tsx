import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableRow,
    TableCell,
    Paper,
} from "@mui/material";
import { useAppContext } from "../../context/AppContext";

const tableDesign = {
    tableContainer: {
        marginTop: "10px",
        width: "100%", // Ensure full width
        maxHeight: "600px", // Set a fixed height for the scrollable area
        overflowY: "auto", // Enable scrolling
        border: "1px solid #d5d5d5", // Optional: Add a border for better visibility
    },
    assetInfoRow: {
        backgroundColor: "#483D8B",
        color: "white",
        textAlign: "left",
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

const AssetInfo: React.FC = () => {
    const router = useRouter();
    const { singleStateData } = useAppContext();

    return (
        <Box sx={tableDesign.tableContainer}>
            {singleStateData ? (
                <Paper elevation={3}>
                    <Table>
                        <TableBody>
                            {/* Asset Info Header */}
                            <TableRow>
                                <TableCell colSpan={2} sx={tableDesign.assetInfoRow}>
                                    Asset Info
                                </TableCell>
                            </TableRow>
                            {/* Asset Details */}

                            <TableRow sx={tableDesign.tableRow}>
                                <TableCell>
                                    <b>Asset Number</b>
                                </TableCell>
                                <TableCell>{singleStateData.assetCount || "N/A"}</TableCell>
                            </TableRow>
                            <TableRow sx={tableDesign.tableRow}>
                                <TableCell>
                                    <b>Asset Name</b>
                                </TableCell>
                                <TableCell>{singleStateData.assetName || "N/A"}</TableCell>
                            </TableRow>

                            <TableRow sx={tableDesign.tableRow}>
                                <TableCell>
                                    <b>Description</b>
                                </TableCell>
                                <TableCell>{singleStateData.description || "N/A"}</TableCell>
                            </TableRow>
                            <TableRow sx={tableDesign.tableRow}>
                                <TableCell>
                                    <b>Category</b>
                                </TableCell>
                                <TableCell>{singleStateData.category || "N/A"}</TableCell>
                            </TableRow>
                            <TableRow sx={tableDesign.tableRow}>
                                <TableCell>
                                    <b>Condition</b>
                                </TableCell>
                                <TableCell>{singleStateData.condition || "N/A"}</TableCell>
                            </TableRow>
                            <TableRow sx={tableDesign.tableRow}>
                                <TableCell>
                                    <b>Assigned To</b>
                                </TableCell>
                                <TableCell>{singleStateData.assignedTo || "N/A"}</TableCell>
                            </TableRow>
                            <TableRow sx={tableDesign.tableRow}>
                                <TableCell>
                                    <b>Price</b>
                                </TableCell>
                                <TableCell>{singleStateData.price || "N/A"}</TableCell>
                            </TableRow>
                            <TableRow sx={tableDesign.tableRow}>
                                <TableCell>
                                    <b>Warranty Date</b>
                                </TableCell>
                                <TableCell>{singleStateData.warrantyDate || "N/A"}</TableCell>
                            </TableRow>
                            <TableRow sx={tableDesign.tableRow}>
                                <TableCell>
                                    <b>Warranty Type</b>
                                </TableCell>
                                <TableCell>{singleStateData.warrantyType || "N/A"}</TableCell>
                            </TableRow>
                            <TableRow sx={tableDesign.tableRow}>
                                <TableCell>
                                    <b>Vendor</b>
                                </TableCell>
                                <TableCell>{singleStateData.vendor || "N/A"}</TableCell>
                            </TableRow>
                            <TableRow sx={tableDesign.tableRow}>
                                <TableCell>
                                    <b>Status</b>
                                </TableCell>
                                <TableCell>{singleStateData.status || "N/A"}</TableCell>
                            </TableRow>
                            <TableRow sx={tableDesign.tableRow}>
                                <TableCell>
                                    <b>Model No</b>
                                </TableCell>
                                <TableCell>{singleStateData.modelNo || "N/A"}</TableCell>
                            </TableRow>
                            <TableRow sx={tableDesign.tableRow}>
                                <TableCell>
                                    <b>Description</b>
                                </TableCell>
                                <TableCell>{singleStateData.description || "N/A"}</TableCell>
                            </TableRow>
                            <TableRow sx={tableDesign.tableRow}>
                                <TableCell>
                                    <b>Location</b>
                                </TableCell>
                                <TableCell>{singleStateData.location || "N/A"}</TableCell>
                            </TableRow>
                            <TableRow sx={tableDesign.tableRow}>
                                <TableCell>
                                    <b>Building</b>
                                </TableCell>
                                <TableCell>{singleStateData.building || "N/A"}</TableCell>
                            </TableRow>
                            <TableRow sx={tableDesign.tableRow}>
                                <TableCell>
                                    <b>Room</b>
                                </TableCell>
                                <TableCell>{singleStateData.room || "N/A"}</TableCell>
                            </TableRow>
                            <TableRow sx={tableDesign.tableRow}>
                                <TableCell>
                                    <b>Department</b>
                                </TableCell>
                                <TableCell>{singleStateData.department || "N/A"}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Paper>
            ) : (
                <Typography>No asset details available</Typography>
            )}
        </Box>
    );
};

export default AssetInfo;
