import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Button,
} from "@mui/material";
import { useAppContext } from "../../context/AppContext";
import EditIcon from "@mui/icons-material/Edit";
import PrintIcon from "@mui/icons-material/Print";

const tableDesign = {
  tableContainer: {
    marginTop: "10px",
    width: "100%", // Ensure full width
    maxHeight: "600px", // Set a fixed height for the scrollable area
    overflowY: "auto", // Enable scrolling

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
  const printRef = useRef<HTMLDivElement>(null);

  //   const handlePrint = () => {
  //     if (printRef.current) {
  //       const printContent = printRef.current.innerHTML;
  //       const printWindow = window.open("", "_blank");
  //       printWindow?.document.write(`
  //         <html>
  //           <head>
  //             <title>Print Table</title>
  //             <style>
  //               body {
  //                 font-family: Arial, sans-serif;
  //                 margin: 20px;
  //               }
  //               table {
  //                 width: 100%;
  //                 border-collapse: collapse;
  //               }
  //               td, th {
  //                 border: 1px solid #ddd;
  //                 padding: 8px;
  //                 text-align: left;
  //               }
  //               tr:nth-child(even) {
  //                 background-color: #f2f2f2;
  //               }
  //               tr:hover {
  //                 background-color: #ddd;
  //               }
  //               .asset-info-header {
  //                 background-color: #483D8B;
  //                 color: white;
  //                 font-size: 20px;
  //                 font-weight: bold;
  //                 text-align: left;
  //               }
  //               img {
  //                 width: 100px;
  //                 height: 100px;
  //               }
  //             </style>
  //           </head>
  //           <body>
  //             ${printContent}
  //           </body>
  //         </html>
  //       `);
  //       printWindow?.document.close();
  //       printWindow?.print();
  //       printWindow?.close();
  //     }
  //   };

  return (
    <Box sx={tableDesign.tableContainer}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 1.5,
          marginBottom: "10px",
        }}
      >
        {/* Print Button */}
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          //   onClick={handlePrint}
          sx={{
            color: "white",
            borderColor: "primary.main",
            "&:hover": {
              borderColor: "primary.dark",
              backgroundColor: "primary.light",
              color: "white",
            },
          }}
        >
          Print
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          sx={{
            color: "white",
            borderColor: "green",
            backgroundColor: "#5CB85C",
            "&:hover": {
              borderColor: "darkgreen",
              color: "white",
              backgroundColor: "483D8B",
            },
          }}
        >
          Edit
        </Button>
      </Box>
      {singleStateData ? (
        <Box ref={printRef}>
          <Paper elevation={3}>
            <Table>
              <TableBody>
                {/* Asset Info Header */}
                <TableRow>
                  <TableCell sx={tableDesign.assetInfoRow}>
                    Asset Info
                  </TableCell>
                  <TableCell sx={tableDesign.assetInfoRow}>
                    <img
                      src={`http://localhost:5000//${singleStateData.qrCode}`}
                      alt=""
                      style={{ width: "100px", height: "100px " }}
                    />
                  </TableCell>
                </TableRow>
                {/* Asset Details */}

                <TableRow sx={tableDesign.tableRow}>
                  <TableCell>
                    <b>Asset Number</b>
                  </TableCell>
                  <TableCell>{singleStateData.uniqueId || "N/A"}</TableCell>
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
        </Box>
      ) : (
        <Typography>No asset details available</Typography>
      )}
    </Box>
  );
};

export default AssetInfo;
