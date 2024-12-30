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
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
} from "@mui/material";

import CircularProgress from "@mui/material/CircularProgress";
import ClearIcon from "@mui/icons-material/Clear";
import EditIcon from "@mui/icons-material/Edit";

import { useAppContext } from "../../context/AppContext";

const assetSoftwareDesign = {
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

// Array for software
const softwareList = [
  "Windows 10",
  "Windows 11",
  "macOS Ventura",
  "macOS Monterey",
  "Ubuntu",
  "Fedora",
  "Debian",
  "CentOS",
  "Red Hat Enterprise Linux (RHEL)",
  "Chrome OS",
  "Microsoft Word",
  "Google Docs",
  "LibreOffice Writer",
  "Microsoft Excel",
  "Google Sheets",
  "LibreOffice Calc",
  "Microsoft PowerPoint",
  "Google Slides",
  "Canva",
  "Microsoft Outlook",
  "Gmail",
  "Slack",
  "Microsoft Teams",
  "Skype",
  "Zoom",
  "Asana",
  "Trello",
  "Jira",
  "ClickUp",
  "Basecamp",
  "Notion",
  "Evernote",
  "Obsidian",
  "Dropbox",
  "OneDrive",
  "Google Drive",
  "Salesforce",
  "HubSpot",
  "Zoho CRM",
  "QuickBooks",
  "Xero",
  "FreshBooks",
  "ServiceNow",
  "SAP ERP",
  "Oracle NetSuite",
  "Monday.com",
  "Zendesk",
  "Freshservice",
  "SolarWinds",
  "Tableau",
  "Power BI",
  "PagerDuty",
  "Splunk",
  "Adobe Acrobat Reader",
  "Foxit Reader",
  "Zoho Office Suite",
  "LibreOffice Suite",
];

const AssetSoftware: React.FC = () => {
  const {
    singleStateData,
    submitInstalledSoftware,
    fetchSoftwareInfo,
    deleteSoftwareInfo,
  } = useAppContext();
  const [softwareInfo, setSoftwareInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modal State
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const initialState = {
    software: [] as string[],
    date: "",
    license: "",
    status: "",
  };

  // Form State
  const [formData, setFormData] = useState(initialState);
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.software || formData.software.length === 0)
      newErrors.software = "At least one software must be selected.";
    if (!formData.date) newErrors.date = "Date is required.";
    if (!formData.license) newErrors.license = "License is required.";
    if (!formData.status) newErrors.status = "Status is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFormData((prev) => ({
      ...prev,
      software: selectedOptions,
    }));
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

    const isSuccess = await submitInstalledSoftware(submissionData);
    if (isSuccess) {
      setErrors({}); // Clear errors after successful submission
      handleClose();
      setFormData(initialState);
    }
  };

  const fetchSoftwareDetails = async () => {
    if (!singleStateData?._id) {
      console.warn("No valid asset ID found.");
      return;
    }

    setIsLoading(true); // Start loader

    const data = await fetchSoftwareInfo(singleStateData._id);

    if (data) {
      setSoftwareInfo(data); // Update state with valid data
    } else {
      setSoftwareInfo(null); // Reset or clear state on failure
    }

    setIsLoading(false); // Stop loader
  };

  const handleDelete = (id: string) => {
    deleteSoftwareInfo(id);
  };

  const handleCircleAction = () => {};

  useEffect(() => {
    fetchSoftwareDetails();
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
          Asset Software History
        </Typography>

        <TableContainer component={Paper} sx={tableDesign}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Action</TableCell>
                <TableCell>Software</TableCell>
                <TableCell>Date Installed</TableCell>
                <TableCell>License</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Map through softwareInfo to render rows */}
              {Array.isArray(softwareInfo) && softwareInfo.length > 0 ? (
                softwareInfo.map((asset) => (
                  <TableRow hover key={asset._id}>
                    {/* Action Buttons */}
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {/* Edit Icon */}
                        <Box
                          onClick={() => handleEdit(asset._id)}
                          sx={{
                            color: "green",
                            cursor: "pointer",
                            transition:
                              "transform 0.2s ease-in-out, color 0.2s ease-in-out",
                            "&:hover": {
                              transform: "scale(1.2)",
                              color: "#32CD32", // Light Green
                            },
                          }}
                        >
                          <EditIcon />
                        </Box>

                        {/* Delete Icon */}
                        <Box
                          onClick={() => handleDelete(asset._id)}
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

                    {/* Software Pills */}
                    <TableCell>
                      <Box
                        sx={{ display: "flex", flexWrap: "wrap", gap: "4px" }}
                      >
                        {Array.isArray(asset.software) &&
                        asset.software.length > 0
                          ? asset.software
                              .map((software, index) => (
                                <Box
                                  key={index}
                                  sx={{
                                    backgroundColor: "#483D8B", // Dark Slate Blue
                                    color: "white",
                                    borderRadius: "5px",
                                    padding: "2px 8px",
                                    fontSize: "12px",
                                  }}
                                >
                                  {software}
                                </Box>
                              ))
                              .reduce((prev, curr) => [prev, ", ", curr])
                          : "N/A"}
                      </Box>
                    </TableCell>

                    {/* Date Installed */}
                    <TableCell>
                      {asset.date
                        ? new Date(asset.date).toLocaleDateString()
                        : "N/A"}
                    </TableCell>

                    {/* License */}
                    <TableCell>{asset.license}</TableCell>

                    {/* Status */}
                    <TableCell>{asset.status}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No software installed.
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
              Add Asset Software Record
            </Typography>
            <form onSubmit={handleSubmit}>
              {/* Multi-Select Software */}
              <Stack
                spacing={2}
                sx={{ alignItems: "flex-start", marginBottom: "10px" }}
              >
                <label htmlFor="software-select">Select Software</label>
                <select
                  id="software-select"
                  name="software"
                  value={formData.software}
                  onChange={handleMultiSelectChange}
                  multiple
                  style={{
                    width: "100%",
                    height: "120px",
                    borderRadius: "5px",
                    padding: "5px",
                    borderColor: "#ccc",
                    fontSize: "14px",
                  }}
                >
                  {softwareList.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                {errors.software && (
                  <Typography variant="caption" color="error">
                    {errors.software}
                  </Typography>
                )}
              </Stack>

              {/* Date Field */}
              <TextField
                fullWidth
                label="Date Installed"
                name="date"
                type="date"
                error={!!errors.date}
                helperText={errors.date}
                value={formData.date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                sx={{ marginBottom: "10px" }}
              />

              {/* License Field */}
              <TextField
                fullWidth
                label="License"
                name="license"
                error={!!errors.license}
                helperText={errors.license}
                value={formData.license}
                onChange={handleChange}
                sx={{ marginBottom: "10px" }}
              />

              {/* Status Field */}
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

export default AssetSoftware;
