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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { useAppContext } from "../../context/AppContext";

const statusDesign = {
  marginTop: "10px",
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
  width: "50%",
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

// Array for Assigned To Select
const assignedToOptions = ["Alice", "Bob", "Charlie"];
const actionOptions = ["Check In", "Check Out"];

const Status: React.FC = () => {
  const { singleStateData, submitAssignedAsset, fetchAssignedDetails } =
    useAppContext();
  const [assignedDetails, setassignedDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modal State
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const initialState = {
    action: "",
    assignedTo: "",
    date: "",
    status: "",
  };

  // Form State
  const [formData, setFormData] = useState(initialState);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Main form validations
    if (!formData.action) newErrors.action = "Action is required.";
    if (!formData.assignedTo) newErrors.assignedTo = "Assigned to is required.";
    if (!formData.date) newErrors.date = "Date is required.";
    if (!formData.status) newErrors.status = "Status is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getNextAction = (): string => {
    const latestAction = assignedDetails?.[0]?.action || "Check In";
    return latestAction === "Check Out" ? "Check In" : "Check Out";
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange =
    (name: string) => (e: React.ChangeEvent<{ value: unknown }>) => {
      setFormData((prev) => ({ ...prev, [name]: e.target.value as string }));
    };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate the form
    if (!validateForm()) {
      console.log("Validation failed. Please fix the errors.");
      return;
    }
    const submissionData = {
      ...formData,
      id: singleStateData._id,
    };

    const isSuccess = await submitAssignedAsset(submissionData);
    if (isSuccess) {
      setErrors({}); // Clear errors after successful submission
      handleClose();
      setFormData(initialState);
    }
  };

  const fetchassignedlist = async () => {
    if (!singleStateData?._id) {
      console.warn("No valid asset ID found.");
      return;
    }

    setIsLoading(true); // Start loader

    const data = await fetchAssignedDetails(singleStateData._id);

    if (data) {
      setassignedDetails(data); // Update state with valid data
    } else {
      setassignedDetails(null); // Reset or clear state on failure
    }

    setIsLoading(false); // Stop loader
  };

  // useEffect with proper dependency

  useEffect(() => {
    fetchassignedlist();
  }, [singleStateData._id]);

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
    <Box sx={statusDesign}>
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        <Typography sx={{ padding: "3px" }}>Current status:</Typography>
        <Typography
          sx={
            assignedDetails?.[0]?.action === "Check Out"
              ? checkOutDesign
              : checkInDesign
          }
        >
          {assignedDetails?.[0]?.action || "Check Out"}
        </Typography>
      </Box>

      <Box>
        <Typography
          sx={{
            backgroundColor: "#5A4FCF",
            color: "white",
            width: "200px",
            marginTop: "30px",
            textAlign: "center",
            padding: "5px",
            borderRadius: "5px",
            fontWeight: "bold",
          }}
        >
          Asset History
        </Typography>

        <TableContainer component={Paper} sx={tableDesign}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Action</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Map through assignedDetails to render rows */}
              {Array.isArray(assignedDetails) && assignedDetails.length > 0 ? (
                assignedDetails.map((asset) => (
                  <TableRow hover key={asset._id}>
                    <TableCell>{asset.action}</TableCell>
                    <TableCell>{asset.assignedTo}</TableCell>
                    <TableCell>
                      {asset.date
                        ? new Date(asset.date).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>{asset.status}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No assigned asset details available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add Button */}
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#5CB85C",
            marginTop: "10px",
            fontWeight: "bold",
            fontSize: "20px",
          }}
          onClick={handleOpen}
        >
          +
        </Button>

        {/* Modal */}
        <Modal open={open} onClose={handleClose}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: "8px",
            }}
          >
            <Typography variant="h6" sx={{ marginBottom: "20px" }}>
              Add Asset Record
            </Typography>
            <form onSubmit={handleSubmit}>
              {/* Action (Select Field) */}
              <FormControl
                fullWidth
                sx={{ marginBottom: "10px" }}
                error={!!errors.action}
              >
                <InputLabel shrink>Action</InputLabel>
                <Select
                  value={formData.action}
                  onChange={handleSelectChange("action")}
                  displayEmpty
                  label="Action"
                >
                  {getNextAction() === "Check In" ? (
                    <MenuItem value="Check In">Check In</MenuItem>
                  ) : (
                    <MenuItem value="Check Out">Check Out</MenuItem>
                  )}
                </Select>
                {errors.action && (
                  <Typography variant="caption" color="error">
                    {errors.action}
                  </Typography>
                )}
              </FormControl>

              {/* Assigned To */}
              <FormControl
                fullWidth
                sx={{ marginBottom: "10px" }}
                error={!!errors.assignedTo}
              >
                <InputLabel shrink>Assigned To</InputLabel>
                <Select
                  value={formData.assignedTo}
                  onChange={handleSelectChange("assignedTo")}
                  displayEmpty
                  label="Assigned To"
                >
                  {assignedToOptions.map((name) => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.assignedTo && (
                  <Typography variant="caption" color="error">
                    {errors.assignedTo}
                  </Typography>
                )}
              </FormControl>

              {/* Date */}
              <TextField
                fullWidth
                label="Date"
                name="date"
                type="date"
                error={!!errors.date}
                helperText={errors.date}
                value={formData.date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                sx={{ marginBottom: "10px" }}
              />

              {/* Status */}
              <TextField
                fullWidth
                label="Status"
                name="status"
                error={!!errors.status}
                helperText={errors.status}
                value={formData.status}
                onChange={handleChange}
                sx={{ marginBottom: "10px" }}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                sx={{ marginTop: "20px" }}
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </form>
          </Box>
        </Modal>
      </Box>
    </Box>
  );
};

export default Status;
