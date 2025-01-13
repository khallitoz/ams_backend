import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import assetForms from "@/utils/assetForms"; // Maintenance types (hardware/software)
import Sidebar from "@/components/Sidebar";
import assetTypeCategories from "@/utils/assetTypeCategories"; // Categories like computer, network
import assetTypes from "@/utils/assetTypes"; // Main categories like Computer, Printer
import { useAppContext } from "../../context/AppContext";
import StyledTextField from "@/components/StyledTextField";

// Styling constants
const textFieldStyling = {
  width: "100%",
  marginBottom: "20px",
  marginTop: "10px",
};

const selectBoxStyle = {
  width: "100%",
  height: "150px",
  borderRadius: "5px",
  padding: "5px",
  borderColor: "#ccc",
  fontSize: "14px",
  marginTop: "10px",
};

interface MaintenanceState {
  maintenanceType: string;
  assetType: string;
  selectedCategory: string | null;
  specificCategory: string | null;
  selectedAssets: string[];
  isInstalling: boolean;
  installProgress: number;
  assignedTo: string;
  taskName: string;
  status: string;
  dueDate: string;
}

const maintainanceTypes = ["Detective", "Preventive"];

const BulkMaintenance: React.FC = () => {
  const { fetchMaintenanceData, addBulkMaintenance } = useAppContext();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [formState, setFormState] = useState<MaintenanceState>({
    maintenanceType: "",
    assetType: "",
    taskName: "",
    selectedAssets: [],
    selectedCategory: "",
    specificCategory: null,
    isInstalling: false,
    installProgress: 0,
    assignedTo: "",
    status: "",
    dueDate: "",
  });

  const [assetData, setAssetData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    let validationErrors: { [key: string]: string } = {};
    let isValid = true;

    if (!formState.taskName) {
      validationErrors.taskName = "Task Name is required.";
      isValid = false;
    }

    if (!formState.maintenanceType) {
      validationErrors.maintenanceType = "Maintenance type is required.";
      isValid = false;
    }

    if (!formState.assetType) {
      validationErrors.assetType = "Asset type is required.";
      isValid = false;
    }

    if (formState.selectedAssets.length === 0) {
      validationErrors.selectedAssets = "At least one asset must be selected.";
      isValid = false;
    }

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

    setErrors(validationErrors);
    return isValid;
  };

  const handleChange = (
    e: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    if (name) {
      setFormState((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };
  // handel
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormState((prevState) => ({
      ...prevState,
      isInstalling: true,
      installProgress: 0,
    }));
    simulateProgress();

    await addBulkMaintenance(formState);
  };

  const fetchCategoryData = async () => {
    if (!formState.assetType || !formState.selectedCategory) return;

    setIsLoading(true);
    const data = await fetchMaintenanceData(
      formState.assetType,
      formState.selectedCategory,
      formState.specificCategory
    );
    setAssetData(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCategoryData();
  }, [
    formState.assetType,
    formState.selectedCategory,
    formState.specificCategory,
  ]);

  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
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
        }, 500);
      }
    }, 300);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box
        sx={{
          width: "100%",
          marginLeft: "18%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white",
          gap: "20px",
          padding: "20px",
          marginTop: "12px",
        }}
      >
        <form onSubmit={handleSubmit}>
          <Typography sx={{ fontSize: "25px", marginTop: "40px" }}>
            Initiate Bulk Maintenance
          </Typography>

          <StyledTextField
            label="Task Name"
            fullWidth
            name="taskName"
            sx={textFieldStyling}
            value={formState.taskName}
            onChange={handleChange}
            error={!!errors.taskName}
            helperText={errors.taskName}
          />

          {/* Maintenance Type */}
          <FormControl variant="outlined" sx={textFieldStyling} fullWidth>
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
            >
              {maintainanceTypes.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {errors.maintenanceType && (
              <FormHelperText error>{errors.maintenanceType}</FormHelperText>
            )}
          </FormControl>

          {/* Asset Type */}
          <FormControl variant="outlined" sx={textFieldStyling} fullWidth>
            <InputLabel id="asset-type-label">Asset Type</InputLabel>
            <Select
              labelId="asset-type-label"
              id="assetType"
              name="assetType"
              value={formState.assetType}
              onChange={(e) => {
                handleChange(e);
                setFormState((prevState) => ({
                  ...prevState,
                  selectedAssets: [], // Reset selected assets when asset type changes
                }));
              }}
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

          {/* Category */}
          <FormControl variant="outlined" sx={textFieldStyling} fullWidth>
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
              <FormHelperText error>{errors.selectedCategory}</FormHelperText>
            )}
          </FormControl>

          {/* Specific Category */}
          {formState.assetType === "Hardware" && (
            <FormControl variant="outlined" sx={textFieldStyling} fullWidth>
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
                {assetTypeCategories[formState.selectedCategory]?.map(
                  (category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  )
                )}
              </Select>
              {errors.specificCategory && (
                <FormHelperText error>{errors.specificCategory}</FormHelperText>
              )}
            </FormControl>
          )}

          {/* Select Assets */}
          {formState.assetType && (
            <Box sx={{ marginTop: "20px" }}>
              <Typography sx={{ fontWeight: "bold", marginBottom: "5px" }}>
                Select Desired {formState.assetType}
              </Typography>
              <select
                id={`${formState.assetType}-select`}
                name="selectedAssets"
                onChange={(e) => {
                  const selectedValues = Array.from(
                    e.target.selectedOptions,
                    (option) => option.value
                  );
                  setFormState((prevState) => ({
                    ...prevState,
                    selectedAssets: selectedValues,
                  }));
                }}
                multiple
                style={selectBoxStyle}
              >
                {assetData?.map((asset) => (
                  <option key={asset._id} value={asset._id}>
                    {formState.assetType === "Hardware"
                      ? asset.assetName
                      : asset.name}
                  </option>
                ))}
              </select>
              {errors.selectedAssets && (
                <FormHelperText error>{errors.selectedAssets}</FormHelperText>
              )}
            </Box>
          )}

          {/* Assigned To */}
          <StyledTextField
            label="Assigned To"
            fullWidth
            name="assignedTo"
            sx={textFieldStyling}
            value={formState.assignedTo}
            onChange={handleChange}
            error={!!errors.assignedTo}
            helperText={errors.assignedTo}
          />

          {/* Status */}
          <StyledTextField
            label="Status"
            fullWidth
            name="status"
            sx={textFieldStyling}
            value={formState.status}
            onChange={handleChange}
            error={!!errors.status}
            helperText={errors.status}
          />

          {/* Due Date */}
          <StyledTextField
            fullWidth
            label="Due Date"
            name="dueDate"
            type="date"
            sx={textFieldStyling}
            value={formState.dueDate}
            onChange={handleChange}
            error={!!errors.dueDate}
            InputLabelProps={{ shrink: true }}
            helperText={errors.dueDate}
          />
          {/* Submit Button */}
          <Box sx={{ textAlign: "center", marginTop: "30px" }}>
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: "#4cd964",
                padding: "10px 30px",
                fontWeight: "bold",
                textTransform: "uppercase",
                fontSize: "14px",
              }}
              onClick={handleSubmit}
            >
              Create Maintenance
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default BulkMaintenance;
