import React, { useEffect, useState } from "react";

import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Modal,
  TextField,
  Stack,
} from "@mui/material";

import CircularProgress from "@mui/material/CircularProgress";
import ClearIcon from "@mui/icons-material/Clear";
import EditIcon from "@mui/icons-material/Edit";

import { useAppContext } from "../../context/AppContext";

const assetSoftwareDesign = {
  marginTop: "5px",
  padding: "20px",
  backgroundColor: "#f4f6f8",
};

const checkInDesign = {
  marginLeft: "3px",
  borderRadius: "5px",
  padding: "3px",
  color: "white",
  backgroundColor: "#5CB85C",
};

const checkOutDesign = {
  marginLeft: "3px",
  borderRadius: "5px",
  padding: "3px",
  color: "#ffffff",
  backgroundColor: "#F0AD4E",
};

const tableDesign = {
  border: "1px solid #e0e0e0",
  marginTop: "20px",
  width: "70%",
  borderRadius: "8px",
  overflowY: "auto",
  boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
  "& .MuiTableHead-root": {
    backgroundColor: "#666666",
    "& .MuiTableCell-root": {
      backgroundColor: "#666666",
      color: "#ffffff",
      fontWeight: "bold",
      fontSize: "18px",
    },
  },
  "& .MuiTableCell-root": {
    padding: "12px",
    fontSize: "14px",
  },
  "& .MuiTableRow-root": {
    transition: "background-color 0.3s ease",
    "&:hover": {
      backgroundColor: "#e8f0fe",
    },
  },
  "& .MuiTableRow-root:nth-of-type(even)": {
    backgroundColor: "#f4f4f4",
  },
};

const AssociatedHardware: React.FC = () => {
  const { singleSoftwareData, fetchAssociatedHardware, deleteSoftwareInfo } =
    useAppContext();
  const [hardwareInfo, setHardwareInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [softwareToDelete, setSoftwareToDelete] = useState<string | null>(null);

  const openDeleteModal = (id: string) => {
    setSoftwareToDelete(id); // Store the ID of the software to delete
    setDeleteModalOpen(true); // Open the delete modal
  };

  const closeDeleteModal = () => {
    setSoftwareToDelete(null); // Clear the stored software ID
    setDeleteModalOpen(false); // Close the delete modal
  };

  const confirmDelete = async () => {
    if (softwareToDelete) {
      await deleteSoftwareInfo(softwareToDelete); // Perform the delete action
      closeDeleteModal(); // Close modal after deletion
      LinkedHardwareAssets(); // Refresh the software list
    }
  };

  const initialState = {
    software: [] as string[],
    date: "",
    status: "",
  };

  // Form State

  const LinkedHardwareAssets = async () => {
    if (!singleSoftwareData?._id) {
      console.warn("No valid software ID found.");
      return;
    }

    setIsLoading(true); // Start loader

    const data = await fetchAssociatedHardware(singleSoftwareData._id);

    if (data) {
      setHardwareInfo(data); // Update state with valid data
    } else {
      setHardwareInfo(null); // Reset or clear state on failure
    }

    setIsLoading(false); // Stop loader
  };

  useEffect(() => {
    LinkedHardwareAssets();
  }, [singleSoftwareData._id]);

  if (isLoading) {
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", marginTop: "50px" }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={assetSoftwareDesign}>
      <Box>
        <Typography
          sx={{
            backgroundColor: "#5A4FCF",
            color: "white",
            width: "300px",
            marginTop: "30px",
            textAlign: "center",
            padding: "5px",
            borderRadius: "5px",
            fontWeight: "bold",
          }}
        >
          Associated Hardware History
        </Typography>

        <TableContainer component={Paper} sx={tableDesign}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Action</TableCell>
                <TableCell>Hardware Name</TableCell>
                <TableCell>Asset Id</TableCell>
                <TableCell>Condition</TableCell>
                <TableCell>Software Name</TableCell>
                <TableCell>License</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Map through hardwareInfo to render rows */}
              {Array.isArray(hardwareInfo) && hardwareInfo.length > 0 ? (
                hardwareInfo.map((hardware) => (
                  <TableRow hover key={hardware._id}>
                    {/* Action Buttons */}
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {/* Delete Icon */}
                        <Box
                          onClick={() => openDeleteModal(hardware._id)}
                          sx={{
                            color: "red",
                            cursor: "pointer",
                            transition:
                              "transform 0.2s ease-in-out, color 0.2s ease-in-out",
                            "&:hover": {
                              transform: "scale(1.2)",
                              color: "#FF4500", // Orange Red
                            },
                          }}
                        >
                          <ClearIcon />
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell>{hardware.hardwareId.assetName}</TableCell>
                    <TableCell>{hardware.hardwareId.uniqueId}</TableCell>
                    <TableCell>{hardware.hardwareId.condition}</TableCell>
                    <TableCell>{hardware.softwareId.name}</TableCell>
                    <TableCell>{hardware.license}</TableCell>
                    {/* Date Installed */}
                    <TableCell>
                      {hardware.date
                        ? new Date(hardware.date).toLocaleDateString()
                        : "N/A"}
                    </TableCell>

                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Not installed on any hardware.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Modal open={deleteModalOpen} onClose={closeDeleteModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              borderRadius: "8px",
              boxShadow: 24,
              textAlign: "center",
              p: 4,
            }}
          >
            {/* Icon */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#FDEDED",
                borderRadius: "50%",
                width: "80px",
                height: "80px",
                margin: "0 auto 16px",
              }}
            >
              <Typography
                sx={{
                  fontSize: "48px",
                  color: "#FF4D4F",
                }}
              >
                ✖
              </Typography>
            </Box>

            {/* Title */}
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
              Are you sure?
            </Typography>

            {/* Description */}
            <Typography sx={{ color: "#6b6b6b", mb: 3 }}>
              Do you really want remove the installed software
            </Typography>

            {/* Buttons */}
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                sx={{
                  borderColor: "#BFBFBF",
                  color: "#6b6b6b",
                  "&:hover": { backgroundColor: "#f5f5f5" },
                }}
                onClick={closeDeleteModal}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#FF4D4F",
                  color: "white",
                  "&:hover": { backgroundColor: "#D9363E" },
                }}
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </Stack>
          </Box>
        </Modal>
      </Box>
    </Box>
  );
};

export default AssociatedHardware;
