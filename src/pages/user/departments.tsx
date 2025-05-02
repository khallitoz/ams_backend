import React, { useEffect, useState, useRef } from "react";
import Layout from "@/components/Layout";
import {
  Box,
  Button,
  Typography,
  Modal,
  TextField,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
  Tooltip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import {
  belzirAxiosGet,
  belzirAxiosPost,
  belzirAxiosPut,
  belzirAxiosDelete,
} from "@/utils/axiosHelper";
import AddIcon from "@mui/icons-material/Add";
import BusinessIcon from "@mui/icons-material/Business";
import ApartmentIcon from "@mui/icons-material/Apartment";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/Search";
import { Visibility as VisibilityIcon } from "@mui/icons-material";
import axios from "axios";
import { useDebounce } from "@/utils/useDebounce";

// Styles for the location table
const tableStyles = {
  table: {
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    overflowY: "auto",
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
    "& .MuiTableHead-root": {
      "& .MuiTableCell-root": {
        backgroundColor: "#483D8B",
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
  },
  searchContainer: {
    display: "flex",
    marginBottom: "0",
  },
  searchInput: {
    width: "40%",
    "& .MuiInputBase-root": {
      borderBottom: "2px solid #483D8B",
    },
  },
};

interface Room {
  id?: string;
  _id?: string;
  name: string;
}

interface Department {
  id?: string;
  _id?: string;
  name: string;
  rooms: Room[];
}

interface Building {
  id?: string;
  _id?: string;
  name: string;
  departments: Department[];
}

interface Location {
  id?: string;
  _id?: string;
  name: string;
  buildings: Building[];
}

const Locations: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [newLocation, setNewLocation] = useState({
    name: "",
    buildings: [] as Building[],
  });
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null
  );

  // Table state
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalLocations, setTotalLocations] = useState<number>(0);

  // Search with debounce
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  // File upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "info", message: "" });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Temporary state for building, department, and room forms
  const [tempBuildingName, setTempBuildingName] = useState("");
  const [tempDepartmentName, setTempDepartmentName] = useState("");
  const [tempRoomName, setTempRoomName] = useState("");

  // Temporary collection state for the current building's departments and rooms
  const [tempDepartments, setTempDepartments] = useState<Department[]>([]);
  const [tempRooms, setTempRooms] = useState<Room[]>([]);

  // State for the current selected department when adding rooms
  const [selectedTempDepartment, setSelectedTempDepartment] =
    useState<Department | null>(null);

  // Stepper state
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    "Location Details",
    "Add Buildings",
    "Add Departments",
    "Add Rooms",
  ];

  useEffect(() => {
    fetchLocations();
  }, [page, rowsPerPage, debouncedSearchQuery]);

  const fetchLocations = async (
    currentPage = page,
    currentRowsPerPage = rowsPerPage
  ) => {
    setLoading(true);
    try {
      const response = await belzirAxiosGet(
        `http://localhost:4002/api/v1/locations?page=${
          currentPage + 1
        }&limit=${currentRowsPerPage}&searchQuery=${searchQuery}`
      );
      if (response.data && response.data.data) {
        setLocations(response.data.data);
        setTotalLocations(response.data.totalLocations || 0);
      }
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
    setPage(0); // Reset to first page on new search
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      fetchLocations();
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setPage(0); // Reset to first page
    setRowsPerPage(newRowsPerPage);
  };

  const handleAddLocation = async () => {
    try {
      const response = await belzirAxiosPost(
        "http://localhost:4002/api/v1/locations",
        newLocation
      );
      if (response.data && response.data.data) {
        setLocations([...locations, response.data.data]);
        resetForm();
        setModalOpen(false);
      }
    } catch (error) {
      console.error("Failed to add location:", error);
    }
  };

  const resetForm = () => {
    setNewLocation({
      name: "",
      buildings: [],
    });
    setTempBuildingName("");
    setTempDepartmentName("");
    setTempRoomName("");
    setTempDepartments([]);
    setTempRooms([]);
    setSelectedTempDepartment(null);
    setActiveStep(0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewLocation({
      ...newLocation,
      [name]: value,
    });
  };

  const handleAddBuilding = () => {
    if (!tempBuildingName.trim()) return;

    const newBuilding: Building = {
      name: tempBuildingName,
      departments: [],
    };

    setNewLocation({
      ...newLocation,
      buildings: [...newLocation.buildings, newBuilding],
    });

    setTempBuildingName("");
    // Move to next step
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleAddDepartment = () => {
    if (!tempDepartmentName.trim()) return;

    // Make sure we have a selected building
    if (newLocation.buildings.length === 0) {
      alert("Please add a building first");
      return;
    }

    const newDepartment: Department = {
      name: tempDepartmentName,
      rooms: [], // Initialize with empty rooms array
    };

    setTempDepartments([...tempDepartments, newDepartment]);
    setTempDepartmentName("");
  };

  // Function to ensure all departments have rooms array initialized
  const ensureRoomsArrayExists = (departments: Department[]): Department[] => {
    return departments.map((dept) => ({
      ...dept,
      rooms: dept.rooms || [],
    }));
  };

  const handleSaveDepartments = () => {
    if (!selectedBuilding) return;

    // Update the selected building with the temporary departments
    const updatedBuildings = [...newLocation.buildings];
    const buildingIndex = updatedBuildings.indexOf(selectedBuilding);

    if (buildingIndex >= 0) {
      // Make sure all departments have rooms arrays
      const departmentsWithRooms = ensureRoomsArrayExists(tempDepartments);

      updatedBuildings[buildingIndex] = {
        ...updatedBuildings[buildingIndex],
        departments: departmentsWithRooms,
      };

      setNewLocation({
        ...newLocation,
        buildings: updatedBuildings,
      });

      // Update the selected building reference
      setSelectedBuilding(updatedBuildings[buildingIndex]);

      // Show confirmation
      alert("Departments and rooms saved to building");
    }
  };

  const handleAddRoom = () => {
    if (!tempRoomName.trim() || !selectedTempDepartment) return;

    const newRoom: Room = {
      name: tempRoomName,
    };

    // Create a deep copy of the departments array
    const updatedTempDepartments = [...tempDepartments];

    // Find the index of the selected department
    const deptIndex = tempDepartments.findIndex(
      (dept) => dept === selectedTempDepartment
    );

    if (deptIndex !== -1) {
      // Ensure the department has a rooms array
      if (!updatedTempDepartments[deptIndex].rooms) {
        updatedTempDepartments[deptIndex].rooms = [];
      }

      // Add the new room
      updatedTempDepartments[deptIndex].rooms.push(newRoom);

      // Update state
      setTempDepartments(updatedTempDepartments);

      // Update the selected department reference
      setSelectedTempDepartment(updatedTempDepartments[deptIndex]);
    }

    setTempRoomName("");
  };

  const handleSaveRooms = () => {
    // Update the last building with the updated departments containing rooms
    const updatedBuildings = [...newLocation.buildings];
    const lastBuildingIndex = updatedBuildings.length - 1;

    if (lastBuildingIndex >= 0) {
      updatedBuildings[lastBuildingIndex] = {
        ...updatedBuildings[lastBuildingIndex],
        departments: tempDepartments,
      };

      setNewLocation({
        ...newLocation,
        buildings: updatedBuildings,
      });

      // Submit location if we're done
      handleAddLocation();
    }
  };

  const removeBuilding = (index: number) => {
    const updatedBuildings = [...newLocation.buildings];
    updatedBuildings.splice(index, 1);
    setNewLocation({
      ...newLocation,
      buildings: updatedBuildings,
    });
  };

  const removeTempDepartment = (index: number) => {
    const updatedDepartments = [...tempDepartments];
    updatedDepartments.splice(index, 1);
    setTempDepartments(updatedDepartments);

    if (selectedTempDepartment === tempDepartments[index]) {
      setSelectedTempDepartment(null);
    }
  };

  const removeRoom = (deptIndex: number, roomIndex: number) => {
    const updatedDepartments = [...tempDepartments];

    // Ensure the department has a rooms array
    if (updatedDepartments[deptIndex] && updatedDepartments[deptIndex].rooms) {
      // Remove the room at the specified index
      updatedDepartments[deptIndex].rooms.splice(roomIndex, 1);

      // Update departments state
      setTempDepartments(updatedDepartments);

      // If the selected department is the one we're modifying, update its reference
      if (selectedTempDepartment === tempDepartments[deptIndex]) {
        setSelectedTempDepartment(updatedDepartments[deptIndex]);
      }
    }
  };

  // Stepper navigation
  const handleNext = () => {
    if (activeStep === 0 && !newLocation.name.trim()) {
      alert("Please enter a location name");
      return;
    }

    if (activeStep === 1 && newLocation.buildings.length === 0) {
      alert("Please add at least one building");
      return;
    }

    if (activeStep === 2) {
      handleSaveDepartments();
      return;
    }

    if (activeStep === 3) {
      handleSaveRooms();
      return;
    }

    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const viewBuildingDetails = (building: Building) => {
    setSelectedBuilding(building);
  };

  // Download template function
  const downloadTemplate = async () => {
    try {
      // Create a direct link to download the template
      const link = document.createElement("a");
      link.href = `http://localhost:4002/api/v1/locations/template`;
      link.download = "location_template.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading template:", error);
      setUploadStatus({
        show: true,
        type: "error",
        message: "Failed to download template file.",
      });
    }
  };

  // File upload functions
  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    setUploadStatus({
      show: true,
      type: "info",
      message: "Uploading and processing file...",
    });

    try {
      const response = await belzirAxiosPost(
        "http://localhost:4002/api/v1/locations/import",
        formData
      );

      if (response.data && response.data.success) {
        const resultData = response.data.data;
        setUploadStatus({
          show: true,
          type: "success",
          message: `Import successful. ${resultData.successCount} rows imported, ${resultData.errorCount} errors.`,
        });

        // Refresh the locations list
        fetchLocations();
      } else {
        setUploadStatus({
          show: true,
          type: "error",
          message: response.data?.message || "Failed to import locations.",
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus({
        show: true,
        type: "error",
        message: "Failed to upload and process file.",
      });
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteLocation = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering row click

    if (window.confirm("Are you sure you want to delete this location?")) {
      try {
        const response = await belzirAxiosDelete(
          `http://localhost:4002/api/v1/locations/${id}`
        );
        if (response.data && response.data.success) {
          // Remove from state
          setLocations(
            locations.filter((loc) => loc._id !== id && loc.id !== id)
          );

          // Refresh the list
          fetchLocations();
        }
      } catch (error) {
        console.error("Failed to delete location:", error);
      }
    }
  };

  const handleEditLocation = (location: Location, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering row click

    setSelectedLocation(location);

    // Initialize with current location data
    setNewLocation({
      name: location.name,
      buildings: [...location.buildings],
    });

    // If there's a building, select the first one by default
    if (location.buildings.length > 0) {
      const firstBuilding = location.buildings[0];
      setSelectedBuilding(firstBuilding);

      // Make sure departments have rooms arrays
      if (firstBuilding.departments) {
        setTempDepartments(ensureRoomsArrayExists(firstBuilding.departments));
      }
    }

    setEditModalOpen(true);
  };

  const handleUpdateLocation = async () => {
    if (!selectedLocation || !selectedLocation._id) return;

    try {
      const response = await belzirAxiosPut(
        `http://localhost:4002/api/v1/locations/${selectedLocation._id}`,
        newLocation
      );

      if (response.data && response.data.success) {
        // Update the locations list
        setLocations(
          locations.map((loc) =>
            loc._id === selectedLocation._id || loc.id === selectedLocation.id
              ? response.data.data
              : loc
          )
        );

        resetForm();
        setEditModalOpen(false);
        setSelectedLocation(null);
      }
    } catch (error) {
      console.error("Failed to update location:", error);
    }
  };

  return (
    <Layout>
      <Box sx={{ padding: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 3,
          }}
        >
          <Typography variant="h4">Locations</Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Tooltip title="Download Excel template">
              <Button
                variant="outlined"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={downloadTemplate}
              >
                Template
              </Button>
            </Tooltip>

            <Tooltip title="Import locations from Excel">
              <Button
                variant="outlined"
                color="primary"
                startIcon={
                  isUploading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <FileUploadIcon />
                  )
                }
                onClick={handleFileSelect}
                disabled={isUploading}
              >
                Import
              </Button>
            </Tooltip>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              style={{ display: "none" }}
              accept=".xlsx,.xls,.csv"
            />

            <Button
              variant="contained"
              color="success"
              startIcon={<AddIcon />}
              onClick={() => setModalOpen(true)}
            >
              Add Location
            </Button>
          </Box>
        </Box>

        {uploadStatus.show && (
          <Alert
            severity={uploadStatus.type}
            sx={{ mb: 3 }}
            onClose={() => setUploadStatus({ ...uploadStatus, show: false })}
          >
            {uploadStatus.message}
          </Alert>
        )}

        {/* Search and header section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <Typography variant="h4">
            {totalLocations} Location{totalLocations !== 1 && "s"} found
          </Typography>

          <TextField
            placeholder="Search locations..."
            variant="outlined"
            autoFocus
            onChange={handleSearch}
            value={searchQuery}
            onKeyDown={handleKeyDown}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={tableStyles.searchInput}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {locations.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="subtitle1">
                  No locations found. Add a location to get started.
                </Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper} sx={tableStyles.table}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell width="5%">#</TableCell>
                      <TableCell width="25%">Location Name</TableCell>
                      <TableCell width="25%">Buildings</TableCell>
                      <TableCell width="25%">Total Departments</TableCell>
                      <TableCell width="20%">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {locations.map((location, index) => (
                      <TableRow
                        key={location.id || location._id}
                        hover
                        onClick={() => setSelectedLocation(location)}
                        sx={{ cursor: "pointer" }}
                      >
                        <TableCell>{index + 1 + page * rowsPerPage}</TableCell>
                        <TableCell>{location.name}</TableCell>
                        <TableCell>
                          {location.buildings.length} Building
                          {location.buildings.length !== 1 && "s"}
                        </TableCell>
                        <TableCell>
                          {location.buildings.reduce(
                            (total, building) =>
                              total + (building.departments?.length || 0),
                            0
                          )}{" "}
                          Department
                          {location.buildings.reduce(
                            (total, building) =>
                              total + (building.departments?.length || 0),
                            0
                          ) !== 1 && "s"}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <IconButton
                              onClick={() => setSelectedLocation(location)}
                              color="info"
                              size="small"
                              title="View Details"
                            >
                              <VisibilityIcon />
                            </IconButton>
                            <IconButton
                              onClick={(e) => handleEditLocation(location, e)}
                              color="primary"
                              size="small"
                              title="Edit"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              onClick={(e) =>
                                handleDeleteLocation(
                                  location._id || location.id || "",
                                  e
                                )
                              }
                              color="error"
                              size="small"
                              title="Delete"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalLocations}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>

      {/* Add Location Modal with Buildings, Departments, and Rooms */}
      <Modal
        open={modalOpen}
        onClose={() => {
          resetForm();
          setModalOpen(false);
        }}
        aria-labelledby="add-location-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 700,
            maxWidth: "90vw",
            maxHeight: "90vh",
            overflow: "auto",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 1,
          }}
        >
          <Typography variant="h5" gutterBottom>
            Add New Location
          </Typography>

          {/* Location Details */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ borderBottom: 1, borderColor: "divider", pb: 1 }}
            >
              Location Details
            </Typography>
            <TextField
              fullWidth
              label="Location Name"
              name="name"
              value={newLocation.name}
              onChange={handleChange}
              margin="normal"
              required
            />
          </Box>

          {/* Buildings and Departments Section */}
          <Accordion defaultExpanded sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                <BusinessIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Buildings
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {/* Building Form */}
              <Box
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  mb: 3,
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  Add Building
                </Typography>
                <TextField
                  fullWidth
                  label="Building Name"
                  value={tempBuildingName}
                  onChange={(e) => setTempBuildingName(e.target.value)}
                  margin="dense"
                  size="small"
                />

                <Box
                  sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
                >
                  <Button
                    variant="contained"
                    onClick={handleAddBuilding}
                    disabled={!tempBuildingName.trim()}
                  >
                    Add Building
                  </Button>
                </Box>
              </Box>

              {/* List of added buildings */}
              {newLocation.buildings.length > 0 ? (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Added Buildings:
                  </Typography>
                  <List>
                    {newLocation.buildings.map((building, index) => (
                      <ListItem
                        key={index}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => removeBuilding(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <ListItemText
                          primary={building.name}
                          secondary={`${
                            building.departments?.length || 0
                          } departments`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ) : (
                <Typography color="text.secondary">
                  No buildings added yet
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Departments and Rooms Section */}
          <Accordion defaultExpanded sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                <ApartmentIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Departments & Rooms
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {/* Building Selector */}
              <FormControl
                fullWidth
                margin="normal"
                size="small"
                sx={{ mb: 3 }}
              >
                <InputLabel>Select Building</InputLabel>
                <Select
                  value={
                    selectedBuilding
                      ? newLocation.buildings
                          .indexOf(selectedBuilding)
                          .toString()
                      : ""
                  }
                  onChange={(e) => {
                    const idx = parseInt(e.target.value);
                    setSelectedBuilding(newLocation.buildings[idx]);
                    setTempDepartments(
                      ensureRoomsArrayExists(
                        newLocation.buildings[idx]?.departments || []
                      )
                    );
                    setSelectedTempDepartment(null); // Reset selected department
                  }}
                  label="Select Building"
                >
                  {newLocation.buildings.map((building, index) => (
                    <MenuItem key={index} value={index.toString()}>
                      {building.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedBuilding && (
                <>
                  {/* Department Form */}
                  <Box
                    sx={{
                      p: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      mb: 3,
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom>
                      Add Department to {selectedBuilding.name}
                    </Typography>
                    <TextField
                      fullWidth
                      label="Department Name"
                      value={tempDepartmentName}
                      onChange={(e) => setTempDepartmentName(e.target.value)}
                      margin="dense"
                      size="small"
                    />

                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        variant="contained"
                        onClick={handleAddDepartment}
                        disabled={!tempDepartmentName.trim()}
                      >
                        Add Department
                      </Button>
                    </Box>
                  </Box>

                  {/* Departments list with selection capability */}
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Departments in {selectedBuilding.name}
                  </Typography>

                  {tempDepartments.length > 0 ? (
                    <List
                      sx={{
                        mb: 4,
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                        maxHeight: "200px",
                        overflow: "auto",
                      }}
                    >
                      {tempDepartments.map((dept, index) => (
                        <ListItem
                          key={index}
                          selected={selectedTempDepartment === dept}
                          secondaryAction={
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeTempDepartment(index);
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          }
                          button
                          onClick={() => setSelectedTempDepartment(dept)}
                          sx={{
                            borderBottom:
                              index < tempDepartments.length - 1
                                ? "1px solid #e0e0e0"
                                : "none",
                            backgroundColor:
                              selectedTempDepartment === dept
                                ? "#e3f2fd"
                                : "inherit",
                          }}
                        >
                          <ListItemText
                            primary={dept.name}
                            secondary={`${dept.rooms?.length || 0} rooms`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography color="text.secondary" sx={{ mb: 4 }}>
                      No departments added to this building yet
                    </Typography>
                  )}

                  {/* Room Management - Only show when a department is selected */}
                  {selectedTempDepartment && (
                    <>
                      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                        Rooms in {selectedTempDepartment.name}
                      </Typography>

                      <Box
                        sx={{
                          p: 2,
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="subtitle1" gutterBottom>
                          Add Room to {selectedTempDepartment.name}
                        </Typography>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <TextField
                            fullWidth
                            label="Room Name"
                            value={tempRoomName}
                            onChange={(e) => setTempRoomName(e.target.value)}
                            margin="dense"
                            size="small"
                          />
                          <Button
                            variant="contained"
                            onClick={handleAddRoom}
                            disabled={!tempRoomName.trim()}
                            sx={{ height: 40, mt: 0.5 }}
                          >
                            Add Room
                          </Button>
                        </Box>

                        {/* Rooms list */}
                        <Box sx={{ mt: 2 }}>
                          {selectedTempDepartment.rooms &&
                          selectedTempDepartment.rooms.length > 0 ? (
                            <List
                              dense
                              sx={{ border: "1px solid #eee", borderRadius: 1 }}
                            >
                              {selectedTempDepartment.rooms.map(
                                (room, roomIndex) => {
                                  const deptIndex = tempDepartments.indexOf(
                                    selectedTempDepartment
                                  );
                                  return (
                                    <ListItem
                                      key={roomIndex}
                                      secondaryAction={
                                        <IconButton
                                          edge="end"
                                          aria-label="delete"
                                          onClick={() =>
                                            removeRoom(deptIndex, roomIndex)
                                          }
                                        >
                                          <DeleteIcon />
                                        </IconButton>
                                      }
                                    >
                                      <MeetingRoomIcon
                                        fontSize="small"
                                        sx={{ mr: 1 }}
                                      />
                                      <ListItemText primary={room.name} />
                                    </ListItem>
                                  );
                                }
                              )}
                            </List>
                          ) : (
                            <Typography color="text.secondary">
                              No rooms added yet
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </>
                  )}

                  {/* Save departments and rooms to building */}
                  <Box
                    sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSaveDepartments}
                    >
                      Save Changes to Building
                    </Button>
                  </Box>
                </>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Submit Buttons */}
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={() => {
                resetForm();
                setModalOpen(false);
              }}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddLocation}
              disabled={!newLocation.name || newLocation.buildings.length === 0}
            >
              Save Location
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Edit Location Modal - Similar to Add but with pre-populated values */}
      <Modal
        open={editModalOpen}
        onClose={() => {
          resetForm();
          setEditModalOpen(false);
          setSelectedLocation(null);
        }}
        aria-labelledby="edit-location-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 700,
            maxWidth: "90vw",
            maxHeight: "90vh",
            overflow: "auto",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 1,
          }}
        >
          <Typography variant="h5" gutterBottom>
            Edit Location
          </Typography>

          {/* Location Details */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ borderBottom: 1, borderColor: "divider", pb: 1 }}
            >
              Location Details
            </Typography>
            <TextField
              fullWidth
              label="Location Name"
              name="name"
              value={newLocation.name}
              onChange={handleChange}
              margin="normal"
              required
            />
          </Box>

          {/* Buildings and Departments Section */}
          <Accordion defaultExpanded sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                <BusinessIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Buildings
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {/* Building Form */}
              <Box
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  mb: 3,
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  Add Building
                </Typography>
                <TextField
                  fullWidth
                  label="Building Name"
                  value={tempBuildingName}
                  onChange={(e) => setTempBuildingName(e.target.value)}
                  margin="dense"
                  size="small"
                />

                <Box
                  sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
                >
                  <Button
                    variant="contained"
                    onClick={handleAddBuilding}
                    disabled={!tempBuildingName.trim()}
                  >
                    Add Building
                  </Button>
                </Box>
              </Box>

              {/* List of added buildings */}
              {newLocation.buildings.length > 0 ? (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Added Buildings:
                  </Typography>
                  <List>
                    {newLocation.buildings.map((building, index) => (
                      <ListItem
                        key={index}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => removeBuilding(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <ListItemText
                          primary={building.name}
                          secondary={`${
                            building.departments?.length || 0
                          } departments`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ) : (
                <Typography color="text.secondary">
                  No buildings added yet
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Departments and Rooms Section */}
          <Accordion defaultExpanded sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                <ApartmentIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Departments & Rooms
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {/* Building Selector */}
              <FormControl
                fullWidth
                margin="normal"
                size="small"
                sx={{ mb: 3 }}
              >
                <InputLabel>Select Building</InputLabel>
                <Select
                  value={
                    selectedBuilding
                      ? newLocation.buildings
                          .indexOf(selectedBuilding)
                          .toString()
                      : ""
                  }
                  onChange={(e) => {
                    const idx = parseInt(e.target.value);
                    setSelectedBuilding(newLocation.buildings[idx]);
                    setTempDepartments(
                      ensureRoomsArrayExists(
                        newLocation.buildings[idx]?.departments || []
                      )
                    );
                    setSelectedTempDepartment(null); // Reset selected department
                  }}
                  label="Select Building"
                >
                  {newLocation.buildings.map((building, index) => (
                    <MenuItem key={index} value={index.toString()}>
                      {building.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedBuilding && (
                <>
                  {/* Department Form */}
                  <Box
                    sx={{
                      p: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      mb: 3,
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom>
                      Add Department to {selectedBuilding.name}
                    </Typography>
                    <TextField
                      fullWidth
                      label="Department Name"
                      value={tempDepartmentName}
                      onChange={(e) => setTempDepartmentName(e.target.value)}
                      margin="dense"
                      size="small"
                    />

                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        variant="contained"
                        onClick={handleAddDepartment}
                        disabled={!tempDepartmentName.trim()}
                      >
                        Add Department
                      </Button>
                    </Box>
                  </Box>

                  {/* Departments list with selection capability */}
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Departments in {selectedBuilding.name}
                  </Typography>

                  {tempDepartments.length > 0 ? (
                    <List
                      sx={{
                        mb: 4,
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                        maxHeight: "200px",
                        overflow: "auto",
                      }}
                    >
                      {tempDepartments.map((dept, index) => (
                        <ListItem
                          key={index}
                          selected={selectedTempDepartment === dept}
                          secondaryAction={
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeTempDepartment(index);
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          }
                          button
                          onClick={() => setSelectedTempDepartment(dept)}
                          sx={{
                            borderBottom:
                              index < tempDepartments.length - 1
                                ? "1px solid #e0e0e0"
                                : "none",
                            backgroundColor:
                              selectedTempDepartment === dept
                                ? "#e3f2fd"
                                : "inherit",
                          }}
                        >
                          <ListItemText
                            primary={dept.name}
                            secondary={`${dept.rooms?.length || 0} rooms`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography color="text.secondary" sx={{ mb: 4 }}>
                      No departments added to this building yet
                    </Typography>
                  )}

                  {/* Room Management - Only show when a department is selected */}
                  {selectedTempDepartment && (
                    <>
                      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                        Rooms in {selectedTempDepartment.name}
                      </Typography>

                      <Box
                        sx={{
                          p: 2,
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="subtitle1" gutterBottom>
                          Add Room to {selectedTempDepartment.name}
                        </Typography>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <TextField
                            fullWidth
                            label="Room Name"
                            value={tempRoomName}
                            onChange={(e) => setTempRoomName(e.target.value)}
                            margin="dense"
                            size="small"
                          />
                          <Button
                            variant="contained"
                            onClick={handleAddRoom}
                            disabled={!tempRoomName.trim()}
                            sx={{ height: 40, mt: 0.5 }}
                          >
                            Add Room
                          </Button>
                        </Box>

                        {/* Rooms list */}
                        <Box sx={{ mt: 2 }}>
                          {selectedTempDepartment.rooms &&
                          selectedTempDepartment.rooms.length > 0 ? (
                            <List
                              dense
                              sx={{ border: "1px solid #eee", borderRadius: 1 }}
                            >
                              {selectedTempDepartment.rooms.map(
                                (room, roomIndex) => {
                                  const deptIndex = tempDepartments.indexOf(
                                    selectedTempDepartment
                                  );
                                  return (
                                    <ListItem
                                      key={roomIndex}
                                      secondaryAction={
                                        <IconButton
                                          edge="end"
                                          aria-label="delete"
                                          onClick={() =>
                                            removeRoom(deptIndex, roomIndex)
                                          }
                                        >
                                          <DeleteIcon />
                                        </IconButton>
                                      }
                                    >
                                      <MeetingRoomIcon
                                        fontSize="small"
                                        sx={{ mr: 1 }}
                                      />
                                      <ListItemText primary={room.name} />
                                    </ListItem>
                                  );
                                }
                              )}
                            </List>
                          ) : (
                            <Typography color="text.secondary">
                              No rooms added yet
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </>
                  )}

                  {/* Save departments and rooms to building */}
                  <Box
                    sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSaveDepartments}
                    >
                      Save Changes to Building
                    </Button>
                  </Box>
                </>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Submit Buttons */}
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={() => {
                resetForm();
                setEditModalOpen(false);
                setSelectedLocation(null);
              }}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdateLocation}
              disabled={!newLocation.name}
            >
              Update Location
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Location Details Modal */}
      {selectedLocation && (
        <Modal
          open={!!selectedLocation && !editModalOpen}
          onClose={() => {
            setSelectedLocation(null);
            setSelectedBuilding(null);
          }}
          aria-labelledby="location-details-modal"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 600,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 1,
              maxHeight: "80vh",
              overflow: "auto",
            }}
          >
            {selectedBuilding ? (
              <>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Button
                    size="small"
                    onClick={() => setSelectedBuilding(null)}
                    sx={{ mr: 2 }}
                  >
                    Back to {selectedLocation.name}
                  </Button>
                  <Typography variant="h5">{selectedBuilding.name}</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    <ApartmentIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                    Departments
                  </Typography>
                  {selectedBuilding.departments &&
                  selectedBuilding.departments.length > 0 ? (
                    <List>
                      {selectedBuilding.departments.map((dept, idx) => (
                        <ListItem
                          key={dept.id || dept._id || idx}
                          sx={{
                            flexDirection: "column",
                            alignItems: "flex-start",
                          }}
                        >
                          <ListItemText primary={dept.name} />
                          <Box sx={{ pl: 2, width: "100%" }}>
                            <Typography variant="subtitle2">Rooms:</Typography>
                            {dept.rooms && dept.rooms.length > 0 ? (
                              <List dense disablePadding>
                                {dept.rooms.map((room, roomIdx) => (
                                  <ListItem
                                    key={room.id || room._id || roomIdx}
                                    dense
                                  >
                                    <MeetingRoomIcon
                                      fontSize="small"
                                      sx={{ mr: 1 }}
                                    />
                                    <ListItemText primary={room.name} />
                                  </ListItem>
                                ))}
                              </List>
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                No rooms added.
                              </Typography>
                            )}
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No departments added yet.
                    </Typography>
                  )}
                </Box>
              </>
            ) : (
              <>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h5" gutterBottom>
                    {selectedLocation.name}
                  </Typography>
                  <Box>
                    <IconButton
                      onClick={() => {
                        handleEditLocation(
                          selectedLocation,
                          new MouseEvent("click") as any
                        );
                      }}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    <BusinessIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                    Buildings
                  </Typography>
                  {selectedLocation.buildings.length > 0 ? (
                    <List>
                      {selectedLocation.buildings.map((building, idx) => (
                        <ListItem
                          key={building.id || building._id || idx}
                          button
                          onClick={() => viewBuildingDetails(building)}
                        >
                          <ListItemText
                            primary={building.name}
                            secondary={`${
                              building.departments?.length || 0
                            } departments, ${building.departments?.reduce(
                              (total, dept) =>
                                total + (dept.rooms?.length || 0),
                              0
                            )} total rooms`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No buildings added yet.
                    </Typography>
                  )}
                </Box>
              </>
            )}

            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setSelectedLocation(null);
                  setSelectedBuilding(null);
                }}
              >
                Close
              </Button>
            </Box>
          </Box>
        </Modal>
      )}
    </Layout>
  );
};

export default Locations;
