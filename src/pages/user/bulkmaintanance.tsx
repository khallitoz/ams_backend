import React, { useEffect, useState, ChangeEvent, ReactNode } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Box,
  Button,
  LinearProgress,
  FormHelperText,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Tooltip,
  IconButton,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Grid,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import assetForms from "@/utils/assetForms"; // Maintenance types (hardware/software)
import assetTypeCategories from "@/utils/assetTypeCategories"; // Categories like computer, network
import assetTypes from "@/utils/assetTypes"; // Main categories like Computer, Printer
import { useAppContext } from "../../context/AppContext";
import StyledTextField from "@/components/StyledTextField";
import Layout from "@/components/Layout";
import { useDebounce } from "@/utils/useDebounce";

// Styling constants
const textFieldStyling = {
  marginBottom: "20px",
  marginTop: "10px",
  "& .MuiInputBase-root": {
    height: "56px", // Standard height for single-line inputs
  },
  "& .MuiInputBase-multiline": {
    height: "auto", // Reset height for multiline inputs
    minHeight: "120px", // Minimum height for description box
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#e0e0e0",
  },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#483D8B !important",
  },
};

const textAreaStyling = {
  marginBottom: "20px",
  marginTop: "10px",
  "& .MuiInputBase-root": {
    minHeight: "120px",
    height: "auto",
  },
  "& .MuiOutlinedInput-input": {
    padding: "16px", // Add proper padding inside the textarea
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#e0e0e0",
  },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#483D8B !important",
  },
};

const selectStyling = {
  marginBottom: "20px",
  marginTop: "10px",
  "& .MuiInputBase-root": {
    height: "56px", // Match height with text fields
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#e0e0e0",
  },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#483D8B !important",
  },
};

const formCardStyle = {
  padding: "20px",
  marginBottom: "20px",
  borderTop: "4px solid #483D8B",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

// Add new interfaces for asset types
interface AssetItem {
  _id: string;
  name?: string;
  assetName?: string;
  assetType?: string;
  category?: string;
  selected?: boolean;
}

interface MaintenanceState {
  maintenanceType: string;
  assetType: string;
  selectedCategory: string | null;
  specificCategory: string | null;
  selectedAssets: AssetItem[]; // Changed from string[] to AssetItem[]
  isInstalling: boolean;
  installProgress: number;
  assignedTo: string;
  taskName: string;
  status: string;
  dueDate: string;
  description: string;
  priority: string;
  searchQuery: string;
}

const maintainanceTypes = ["Detective", "Preventive"];
const statusOptions = ["Pending", "In Progress", "Completed", "Deferred"];
const priorityOptions = ["Low", "Medium", "High", "Critical"];

const steps = ["Task Information", "Asset Selection", "Assignment Details"];

const BulkMaintenance: React.FC = () => {
  const { fetchMaintenanceData, addBulkMaintenance } = useAppContext();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [progressError, setProgressError] = useState(false);

  const [formState, setFormState] = useState<MaintenanceState>({
    maintenanceType: "",
    assetType: "",
    taskName: "",
    selectedAssets: [], // Changed from string[] to AssetItem[]
    selectedCategory: "",
    specificCategory: null,
    isInstalling: false,
    installProgress: 0,
    assignedTo: "",
    status: "Pending",
    dueDate: "",
    description: "",
    priority: "Medium",
    searchQuery: "",
  });

  const [assetData, setAssetData] = useState<AssetItem[]>([]);
  const [filteredAssetData, setFilteredAssetData] = useState<AssetItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce search query to prevent too many API calls
  const debouncedSearchQuery = useDebounce(formState.searchQuery, 500);

  // Filter assets based on search query
  useEffect(() => {
    if (assetData.length > 0) {
      if (!debouncedSearchQuery) {
        setFilteredAssetData(assetData);
      } else {
        const query = debouncedSearchQuery.toLowerCase();
        const filtered = assetData.filter((asset) => {
          const name = asset.assetName || asset.name || "";
          const type = asset.assetType || "";
          const category = asset.category || "";

          return (
            name.toLowerCase().includes(query) ||
            type.toLowerCase().includes(query) ||
            category.toLowerCase().includes(query)
          );
        });
        setFilteredAssetData(filtered);
      }
    } else {
      setFilteredAssetData([]);
    }
  }, [debouncedSearchQuery, assetData]);

  const validateStep = (step: number): boolean => {
    let validationErrors: { [key: string]: string } = {};
    let isValid = true;

    if (step === 0) {
      // Validate task information
      if (!formState.taskName) {
        validationErrors.taskName = "Task Name is required.";
        isValid = false;
      }

      if (!formState.maintenanceType) {
        validationErrors.maintenanceType = "Maintenance type is required.";
        isValid = false;
      }

      if (!formState.description) {
        validationErrors.description = "Description is required.";
        isValid = false;
      }
    } else if (step === 1) {
      // Validate asset selection
      if (!formState.assetType) {
        validationErrors.assetType = "Asset type is required.";
        isValid = false;
      }

      if (formState.selectedAssets.length === 0) {
        validationErrors.selectedAssets =
          "At least one asset must be selected.";
        isValid = false;
      }
    } else if (step === 2) {
      // Validate assignment details
      if (!formState.assignedTo) {
        validationErrors.assignedTo = "Assigned To is required.";
        isValid = false;
      }

      if (!formState.status) {
        validationErrors.status = "Status is required.";
        isValid = false;
      }

      if (!formState.dueDate) {
        validationErrors.dueDate = "Due Date is required.";
        isValid = false;
      }
    }

    setErrors(validationErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleChange = (
    e:
      | SelectChangeEvent<string>
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name) {
      setFormState((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  // Handle search query changes
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({
      ...prev,
      searchQuery: e.target.value,
    }));
  };

  // Handle asset selection
  const handleAssetSelection = (asset: AssetItem) => {
    setFormState((prev) => {
      // Check if asset is already selected
      const isSelected = prev.selectedAssets.some((a) => a._id === asset._id);

      if (isSelected) {
        // Remove from selection
        return {
          ...prev,
          selectedAssets: prev.selectedAssets.filter(
            (a) => a._id !== asset._id
          ),
        };
      } else {
        // Add to selection
        return {
          ...prev,
          selectedAssets: [...prev.selectedAssets, asset],
        };
      }
    });
  };

  // Remove asset from selection
  const removeAsset = (assetId: string) => {
    setFormState((prev) => ({
      ...prev,
      selectedAssets: prev.selectedAssets.filter(
        (asset) => asset._id !== assetId
      ),
    }));
  };

  // Clear all selected assets
  const clearSelectedAssets = () => {
    setFormState((prev) => ({
      ...prev,
      selectedAssets: [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateStep(activeStep)) return;

    setSubmitting(true);
    setFormState((prevState) => ({
      ...prevState,
      isInstalling: true,
      installProgress: 0,
    }));

    try {
      // Convert selected assets to the format expected by the backend
      const formData = {
        ...formState,
      };
      console.log(formData);
      const response = await addBulkMaintenance(formData);

      if (response) {
        simulateProgress(true); // Pass true for success
        // Reset form after successful submission
        setTimeout(() => {
          setFormState({
            maintenanceType: "",
            assetType: "",
            taskName: "",
            selectedAssets: [],
            selectedCategory: "",
            specificCategory: null,
            isInstalling: false,
            installProgress: 0,
            assignedTo: "",
            status: "Pending",
            dueDate: "",
            description: "",
            priority: "Medium",
            searchQuery: "",
          });
          setFilteredAssetData([]);
          setAssetData([]);
          setActiveStep(0);
          setSubmitting(false);
        }, 3000);
      } else {
        simulateProgress(false); // Pass false for failure
        // Reset form state after failed submission
        setTimeout(() => {
          setFormState((prev) => ({
            ...prev,
            isInstalling: false,
            installProgress: 0,
          }));
          setSubmitting(false);
        }, 3000);
      }
    } catch (error) {
      simulateProgress(false); // Pass false for failure
      // Reset form state after error
      setTimeout(() => {
        setFormState((prev) => ({
          ...prev,
          isInstalling: false,
          installProgress: 0,
        }));
        setSubmitting(false);
      }, 3000);
    }
  };

  // Fetch category data
  const fetchCategoryData = async () => {
    if (!formState.assetType || !formState.selectedCategory) return;

    setIsLoading(true);
    try {
      const data = await fetchMaintenanceData(
        formState.assetType,
        formState.selectedCategory,
        formState.specificCategory
      );

      // Convert the returned data to AssetItem[]
      const assets = data.map((item: any) => ({
        _id: item._id,
        name: item.name || null,
        assetName: item.assetName || null,
        assetType: item.assetType || formState.assetType,
        category: item.category || formState.selectedCategory,
        // Check if this asset is already selected
        selected: formState.selectedAssets.some((a) => a._id === item._id),
      }));

      setAssetData(assets);
    } catch (error) {
      console.error("Error fetching asset data:", error);
      setAssetData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryData();
  }, [
    formState.assetType,
    formState.selectedCategory,
    formState.specificCategory,
  ]);

  // Update simulateProgress to handle success/failure states
  const simulateProgress = (isSuccess: boolean) => {
    let progress = 0;
    setProgressError(!isSuccess);

    const interval = setInterval(() => {
      progress += 10;
      if (!isSuccess && progress >= 90) {
        clearInterval(interval);
        setFormState((prevState) => ({
          ...prevState,
          installProgress: 90,
        }));
        setTimeout(() => {
          setFormState((prevState) => ({
            ...prevState,
            isInstalling: false,
            installProgress: 0,
          }));
          setProgressError(false);
        }, 2000);
        return;
      }

      setFormState((prevState) => ({
        ...prevState,
        installProgress: progress,
      }));

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setFormState((prevState) => ({
            ...prevState,
            isInstalling: false,
            installProgress: 0,
          }));
          setProgressError(false);
        }, 500);
      }
    }, 300);
  };

  // Modify the Asset Selection step in renderStepContent
  const renderAssetSelectionStep = () => {
    return (
      <Card sx={formCardStyle}>
        <CardContent>
          <Typography
            variant="h6"
            sx={{ marginBottom: "20px", color: "#483D8B" }}
          >
            Asset Selection
          </Typography>
          <Divider sx={{ marginBottom: "20px" }} />

          <Grid container spacing={3}>
            {/* Asset filters section */}
            <Grid item xs={12} md={6}>
              <FormControl variant="outlined" sx={selectStyling} fullWidth>
                <InputLabel id="asset-type-label">Asset Type</InputLabel>
                <Select
                  labelId="asset-type-label"
                  id="assetType"
                  name="assetType"
                  value={formState.assetType}
                  onChange={handleChange}
                  label="Asset Type"
                  error={!!errors.assetType}
                >
                  {assetForms.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
                {errors.assetType && (
                  <FormHelperText error>{errors.assetType}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl variant="outlined" sx={selectStyling} fullWidth>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="selectedCategory"
                  name="selectedCategory"
                  value={formState.selectedCategory || ""}
                  onChange={handleChange}
                  label="Category"
                  error={!!errors.selectedCategory}
                >
                  {assetTypes.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
                {errors.selectedCategory && (
                  <FormHelperText error>
                    {errors.selectedCategory}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>

            {formState.assetType === "Hardware" && (
              <Grid item xs={12} md={6}>
                <FormControl variant="outlined" sx={selectStyling} fullWidth>
                  <InputLabel id="specific-category-label">
                    Specific Category
                  </InputLabel>
                  <Select
                    labelId="specific-category-label"
                    id="specificCategory"
                    name="specificCategory"
                    value={formState.specificCategory || ""}
                    onChange={handleChange}
                    label="Specific Category"
                    error={!!errors.specificCategory}
                  >
                    {assetTypeCategories[formState.selectedCategory || ""]?.map(
                      (category: string) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      )
                    )}
                  </Select>
                  {errors.specificCategory && (
                    <FormHelperText error>
                      {errors.specificCategory}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )}

            {/* Search field */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                placeholder="Search assets..."
                value={formState.searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  marginBottom: "20px",
                  "& .MuiOutlinedInput-root": {
                    height: "56px",
                  },
                }}
              />
            </Grid>

            {/* Selected assets section */}
            {formState.selectedAssets.length > 0 && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px",
                    padding: "16px",
                    marginBottom: "20px",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      Selected Assets ({formState.selectedAssets.length})
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={clearSelectedAssets}
                      startIcon={<DeleteIcon />}
                    >
                      Clear All
                    </Button>
                  </Box>

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {formState.selectedAssets.map((asset) => (
                      <Chip
                        key={asset._id}
                        label={asset.assetName || asset.name}
                        onDelete={() => removeAsset(asset._id)}
                        sx={{
                          backgroundColor: "#eceafc",
                          color: "#483D8B",
                          m: 0.5,
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>
            )}

            {/* Available assets table */}
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                Available Assets
                {isLoading && <CircularProgress size={20} sx={{ ml: 2 }} />}
              </Typography>

              {filteredAssetData.length > 0 ? (
                <TableContainer
                  component={Paper}
                  sx={{ maxHeight: 400, overflow: "auto" }}
                >
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox"></TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Category</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredAssetData.map((asset) => {
                        const isSelected = formState.selectedAssets.some(
                          (a) => a._id === asset._id
                        );
                        return (
                          <TableRow
                            key={asset._id}
                            hover
                            onClick={() => handleAssetSelection(asset)}
                            sx={{
                              cursor: "pointer",
                              backgroundColor: isSelected
                                ? "rgba(73, 63, 139, 0.08)"
                                : "inherit",
                            }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox checked={isSelected} />
                            </TableCell>
                            <TableCell>
                              {asset.assetName || asset.name}
                            </TableCell>
                            <TableCell>
                              {asset.assetType || formState.assetType}
                            </TableCell>
                            <TableCell>
                              {asset.category || formState.selectedCategory}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 4,
                    backgroundColor: "#f9f9f9",
                    borderRadius: "8px",
                  }}
                >
                  <Typography color="textSecondary">
                    {isLoading
                      ? "Loading assets..."
                      : "No assets found. Try changing your filters or search term."}
                  </Typography>
                </Box>
              )}

              {errors.selectedAssets && (
                <FormHelperText error sx={{ mt: 1 }}>
                  {errors.selectedAssets}
                </FormHelperText>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // Update the assignment details step to show better asset summary
  const renderAssignmentStep = () => {
    return (
      <Card sx={formCardStyle}>
        <CardContent>
          <Typography
            variant="h6"
            sx={{ marginBottom: "20px", color: "#483D8B" }}
          >
            Assignment Details
          </Typography>
          <Divider sx={{ marginBottom: "20px" }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <StyledTextField
                label="Assigned To"
                name="assignedTo"
                sx={textFieldStyling}
                value={formState.assignedTo}
                onChange={handleChange}
                error={!!errors.assignedTo}
                helperText={
                  errors.assignedTo ||
                  "Person or team responsible for this maintenance"
                }
                placeholder="E.g., IT Support Team"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl variant="outlined" sx={selectStyling} fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formState.status}
                  onChange={handleChange}
                  label="Status"
                  error={!!errors.status}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {errors.status && (
                  <FormHelperText error>{errors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <StyledTextField
                label="Due Date"
                name="dueDate"
                type="date"
                sx={textFieldStyling}
                value={formState.dueDate}
                onChange={handleChange}
                error={!!errors.dueDate}
                InputLabelProps={{ shrink: true }}
                helperText={
                  errors.dueDate ||
                  "When this maintenance should be completed by"
                }
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, p: 3, bgcolor: "#f5f5f5", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              Maintenance Summary
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  <strong>Task:</strong> {formState.taskName || "-"}
                </Typography>
                <Typography variant="body1">
                  <strong>Type:</strong> {formState.maintenanceType || "-"}
                </Typography>
                <Typography variant="body1">
                  <strong>Priority:</strong> {formState.priority || "-"}
                </Typography>
                <Typography variant="body1">
                  <strong>Assigned To:</strong> {formState.assignedTo || "-"}
                </Typography>
                <Typography variant="body1">
                  <strong>Due Date:</strong> {formState.dueDate || "-"}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Assets:</strong> {formState.selectedAssets.length}{" "}
                  selected
                </Typography>

                {/* Group assets by type/category */}
                {formState.selectedAssets.length > 0 && (
                  <Box sx={{ maxHeight: 200, overflow: "auto", mt: 1 }}>
                    {/* Group assets by category */}
                    {Object.entries(
                      formState.selectedAssets.reduce((acc, asset) => {
                        const category = asset.category || "Other";
                        if (!acc[category]) {
                          acc[category] = [];
                        }
                        acc[category].push(asset);
                        return acc;
                      }, {} as Record<string, AssetItem[]>)
                    ).map(([category, assets]) => (
                      <Box key={category} sx={{ mb: 1.5 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: "bold" }}
                        >
                          {category} ({assets.length})
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.5,
                            ml: 2,
                          }}
                        >
                          {assets.map((asset) => (
                            <Chip
                              key={asset._id}
                              label={asset.assetName || asset.name}
                              size="small"
                              sx={{
                                backgroundColor: "#eceafc",
                                color: "#483D8B",
                                mb: 0.5,
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Grid>
            </Grid>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body1">
                <strong>Description:</strong>
              </Typography>
              <Typography
                variant="body2"
                sx={{ mt: 1, pl: 2, fontStyle: "italic" }}
              >
                {formState.description || "-"}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Update the renderStepContent function with our updated steps
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Card sx={formCardStyle}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ marginBottom: "20px", color: "#483D8B" }}
              >
                Task Information
              </Typography>
              <Divider sx={{ marginBottom: "20px" }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <StyledTextField
                    label="Task Name"
                    name="taskName"
                    sx={textFieldStyling}
                    value={formState.taskName}
                    onChange={handleChange}
                    error={!!errors.taskName}
                    helperText={errors.taskName}
                    placeholder="E.g., Annual Hardware Maintenance"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl variant="outlined" sx={selectStyling} fullWidth>
                    <InputLabel id="maintenance-type-label">
                      Maintenance Type
                    </InputLabel>
                    <Select
                      labelId="maintenance-type-label"
                      id="maintenanceType"
                      name="maintenanceType"
                      value={formState.maintenanceType}
                      onChange={handleChange}
                      label="Maintenance Type"
                      error={!!errors.maintenanceType}
                      endAdornment={
                        <Tooltip title="Preventive maintenance prevents future failures. Detective maintenance identifies existing issues.">
                          <IconButton size="small" sx={{ marginRight: 1 }}>
                            <HelpOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      }
                    >
                      {maintainanceTypes.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.maintenanceType && (
                      <FormHelperText error>
                        {errors.maintenanceType}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl variant="outlined" sx={selectStyling} fullWidth>
                    <InputLabel id="priority-label">Priority</InputLabel>
                    <Select
                      labelId="priority-label"
                      id="priority"
                      name="priority"
                      value={formState.priority}
                      onChange={handleChange}
                      label="Priority"
                    >
                      {priorityOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <StyledTextField
                    label="Description"
                    name="description"
                    multiline
                    rows={4}
                    sx={textAreaStyling}
                    value={formState.description}
                    onChange={handleChange}
                    error={!!errors.description}
                    helperText={
                      errors.description ||
                      "Provide details about what this maintenance will address"
                    }
                    placeholder="E.g., Annual checkup of all network equipment to ensure optimal performance"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      case 1:
        return renderAssetSelectionStep();

      case 2:
        return renderAssignmentStep();

      default:
        return null;
    }
  };

  return (
    <Layout>
      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          marginLeft: "0",
          padding: { xs: "10px", sm: "15px" },
        }}
      >
        <Typography
          variant="h5"
          sx={{ marginBottom: "20px", color: "#483D8B", fontWeight: "bold" }}
        >
          Bulk Maintenance Management
        </Typography>

        <Stepper
          activeStep={activeStep}
          sx={{
            marginBottom: 3,
            overflowX: { xs: "auto", sm: "visible" },
          }}
          orientation="horizontal"
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleSubmit}>
          {renderStepContent(activeStep)}

          {formState.isInstalling && (
            <Box sx={{ width: "100%", marginBottom: 2 }}>
              <LinearProgress
                variant="determinate"
                value={formState.installProgress}
                sx={{
                  backgroundColor: progressError ? "#ffebee" : undefined,
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: progressError ? "#f44336" : undefined,
                  },
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  mt: 1,
                  textAlign: "center",
                  color: progressError ? "#f44336" : "inherit",
                }}
              >
                {progressError
                  ? "Operation failed. Please try again."
                  : `Processing maintenance task... ${formState.installProgress}%`}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button
              disabled={activeStep === 0 || submitting}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>

            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  type="submit"
                  disabled={submitting}
                  sx={{
                    backgroundColor: "#4cd964",
                    "&:hover": {
                      backgroundColor: "#45c359",
                    },
                  }}
                >
                  {submitting ? (
                    <>
                      <CircularProgress
                        size={20}
                        sx={{ mr: 1, color: "white" }}
                      />
                      Processing...
                    </>
                  ) : (
                    "Create Maintenance Task"
                  )}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    backgroundColor: "#483D8B",
                    "&:hover": {
                      backgroundColor: "#3c327a",
                    },
                  }}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Box>
    </Layout>
  );
};

export default BulkMaintenance;
