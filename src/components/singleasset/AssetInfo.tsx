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
  Modal,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useAppContext } from "../../context/AppContext";
import EditIcon from "@mui/icons-material/Edit";
import PrintIcon from "@mui/icons-material/Print";
import HardwareForm from "../forms/HardwareForm";

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

  const [open, setOpen] = useState(false);
  const [editValues, setEditValues] = useState(singleStateData || null);
  const handleOpen = () => {
    setEditValues(singleStateData);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
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
          onClick={handleOpen}
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

                  <TableCell>
                    {new Date(singleStateData.warrantyDate)
                      .toISOString()
                      .split("T")[0] || "N/A"}
                  </TableCell>
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

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            maxWidth: "1000px", // Prevent modal from being too wide
            maxHeight: "90vh", // Prevent modal from exceeding viewport height
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: "8px",
            overflowY: "auto", // Enable scrolling inside the modal
          }}
        >
          <Typography variant="h6" sx={{ marginBottom: "20px" }}></Typography>
          {/* Pass existing data as initial state */}
          <HardwareForm initialValues={editValues} onClose={handleClose} />
        </Box>
      </Modal>
    </Box>
  );
};

export default AssetInfo;
