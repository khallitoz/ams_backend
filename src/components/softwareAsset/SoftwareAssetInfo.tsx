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
} from "@mui/material";
import { useAppContext } from "../../context/AppContext";
import EditIcon from "@mui/icons-material/Edit";
import PrintIcon from "@mui/icons-material/Print";
import SoftwareForm from "../forms/SoftwareForm";

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
    fontSize: "25px",
    fontWeight: "bold",
  },
  tableRow: {
    transition: "background-color 0.3s",
    "&:hover": {
      backgroundColor: "#D9DAE5",
    },
  },
};

const SoftwareAssetInfo: React.FC = () => {
  const router = useRouter();
  const { singleSoftwareData } = useAppContext();

  const printRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [editValues, setEditValues] = useState(singleSoftwareData || null);
  const handleOpen = () => {
    setEditValues(singleSoftwareData);
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
      {singleSoftwareData ? (
        <Box ref={printRef}>
          <Paper elevation={3}>
            <Table>
              <TableBody>
                {/* Asset Details */}
                <TableRow>
                  <TableCell colSpan={2} sx={tableDesign.assetInfoRow}>
                    Software Info
                  </TableCell>
                </TableRow>
                <TableRow sx={tableDesign.tableRow}>
                  <TableCell>
                    <b>Software Name</b>
                  </TableCell>
                  <TableCell>{singleSoftwareData.name || "N/A"}</TableCell>
                </TableRow>
                <TableRow sx={tableDesign.tableRow}>
                  <TableCell>
                    <b>Vendor</b>
                  </TableCell>
                  <TableCell>{singleSoftwareData.vendor || "N/A"}</TableCell>
                </TableRow>

                <TableRow sx={tableDesign.tableRow}>
                  <TableCell>
                    <b>License</b>
                  </TableCell>
                  <TableCell>
                    {singleSoftwareData.licenseType || "N/A"}
                  </TableCell>
                </TableRow>
                <TableRow sx={tableDesign.tableRow}>
                  <TableCell>
                    <b>Quantity</b>
                  </TableCell>
                  <TableCell>{singleSoftwareData.quantity || "N/A"}</TableCell>
                </TableRow>

                <TableRow sx={tableDesign.tableRow}>
                  <TableCell>
                    <b>Assigned </b>
                  </TableCell>
                  <TableCell>{singleSoftwareData.assignedQuantity}</TableCell>
                </TableRow>
                <TableRow sx={tableDesign.tableRow}>
                  <TableCell>
                    <b>Spares</b>
                  </TableCell>
                  <TableCell>{singleSoftwareData.spares}</TableCell>
                </TableRow>

                <TableRow sx={tableDesign.tableRow}>
                  <TableCell>
                    <b>Unit Price</b>
                  </TableCell>
                  <TableCell>{singleSoftwareData.price || "N/A"}</TableCell>
                </TableRow>
                <TableRow sx={tableDesign.tableRow}>
                  <TableCell>
                    <b>Total Cost</b>
                  </TableCell>
                  <TableCell>{singleSoftwareData.totalCost || "N/A"}</TableCell>
                </TableRow>
                <TableRow sx={tableDesign.tableRow}>
                  <TableCell>
                    <b>Date Added</b>
                  </TableCell>

                  <TableCell>
                    {new Date(singleSoftwareData.date)
                      .toISOString()
                      .split("T")[0] || "N/A"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </Box>
      ) : (
        <Typography>No Software details available</Typography>
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
          <SoftwareForm initialValues={editValues} onClose={handleClose} />
        </Box>
      </Modal>
    </Box>
  );
};

export default SoftwareAssetInfo;
