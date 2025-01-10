import React, { useEffect, useState } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Box,
  Button,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import assetForms from "@/utils/assetForms"; // Maintenance types (hardware/software)
import Sidebar from "@/components/Sidebar";
import assetTypeCategories from "@/utils/assetTypeCategories"; // Categories like computer, network
import assetTypes from "@/utils/assetTypes"; // Main categories like Computer, Printer
import { useAppContext } from "../../context/AppContext";

const assetSoftwareDesign = {
  marginTop: "5px",
  padding: "20px",
  backgroundColor: "#f4f6f8",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
};

const textFieldStyling = {
  width: "100%",
  marginBottom: "20px",
};

const dashboardDesign = {
  display: "flex",
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
// Interface to define the state shape
interface MaintenanceState {
  maintenanceType: string; // Hardware or Software
  selectedCategory: string; // Category (e.g., Computer, Printer)
  specificCategory: string | null; // Specific category like "Server" or "Router"
  selectedSoftware: string[] | null;
  selectedHardware: string[] | null;
  isInstalling: boolean; // Track installation state
  installProgress: number; // Track installation progress
}

const BulkMaintenance: React.FC = () => {
  const { fetchMaintenanceData, bulkSoftwareWareInstallation } =
    useAppContext();

  // Initial state using the interface
  const [formState, setFormState] = useState<MaintenanceState>({
    maintenanceType: "Hardware",
    selectedCategory: "Computer",
    specificCategory: null,
    selectedSoftware: [],
    selectedHardware: [],
    isInstalling: false,
    installProgress: 0,
  });

  const [softwareData, setSoftwareData] = useState([]);
  const [hardwareData, setHardwareData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Handle Form Change for all fields dynamically
  const handleChange = (
    e: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name!]: value,
    }));
  };

  // Fetch Category Data based on selected category and maintenance type
  const fetchCategoryData = async () => {
    setIsLoading(true);
    const data = await fetchMaintenanceData(
      formState.maintenanceType,
      formState.selectedCategory,
      formState.specificCategory
    );
    const softwareInfo = data?.software;
    const hardwareInfo = data?.hardware;
    setSoftwareData(softwareInfo);
    setHardwareData(hardwareInfo);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCategoryData();
  }, [
    formState.maintenanceType,
    formState.selectedCategory,
    formState.specificCategory,
  ]);

  // Simulate progress for the maintenance process
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

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState((prevState) => ({
      ...prevState,
      isInstalling: true,
      installProgress: 0,
    }));
    simulateProgress();

    const isInstalled = await bulkSoftwareWareInstallation(
      formState.selectedSoftware,
      formState.selectedHardware
    );
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar /> {/* Sidebar always visible */}
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
        <Typography sx={{ fontSize: "25px", marginTop: "40px" }}></Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <Box
            sx={{
              marginTop: "5px",
              padding: "20px",
              backgroundColor: "#f4f6f8",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography
              sx={{
                backgroundColor: "#5A4FCF",
                color: "white",
                width: "300px",
                margin: "0 auto",
                textAlign: "center",
                padding: "8px",
                borderRadius: "5px",
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              Initiate Bulk Maintenance
            </Typography>

            {formState.isInstalling && (
              <Box sx={{ marginTop: "10px" }}>
                <LinearProgress
                  variant="determinate"
                  value={formState.installProgress}
                  sx={{ height: "8px", borderRadius: "5px" }}
                />
              </Box>
            )}

            {/* Maintenance Type Selection (Hardware or Software) */}
            <Box sx={{ marginTop: "20px" }}>
              <FormControl variant="outlined" sx={textFieldStyling} fullWidth>
                <InputLabel id="maintenance-type-label">
                  Select Maintenance Type
                </InputLabel>
                <Select
                  labelId="maintenance-type-label"
                  id="maintenance-type"
                  name="maintenanceType"
                  value={formState.maintenanceType}
                  onChange={handleChange}
                  label="Select Maintenance Type"
                >
                  {assetForms.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Category Selection */}
            <Box sx={{ marginTop: "20px" }}>
              <FormControl variant="outlined" sx={textFieldStyling} fullWidth>
                <InputLabel id="category-label">Select Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category-select"
                  name="selectedCategory"
                  value={formState.selectedCategory}
                  onChange={handleChange}
                  label="Select Category"
                >
                  {assetTypes.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Specific Category Selection (like "Server", "Router", etc.) */}
            {formState.maintenanceType === "Hardware" && (
              <Box sx={{ marginTop: "20px" }}>
                <FormControl variant="outlined" sx={textFieldStyling} fullWidth>
                  <InputLabel id="specific-category-label">
                    Select Specific Type
                  </InputLabel>
                  <Select
                    labelId="specific-category-label"
                    id="specific-category-select"
                    name="specificCategory"
                    value={formState.specificCategory || ""}
                    onChange={handleChange}
                    label="Select Specific Type"
                  >
                    {assetTypeCategories[formState.selectedCategory]?.map(
                      (category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Box>
            )}

            {/* Hardware or Software Selection */}
            <form onSubmit={handleSubmit}>
              {formState.maintenanceType === "Hardware" && (
                <Box sx={{ marginTop: "20px" }}>
                  <Typography sx={{ fontWeight: "bold", marginBottom: "5px" }}>
                    Select Desired Hardware
                  </Typography>
                  <select
                    id="hardware-select"
                    name="hardware"
                    onChange={handleChange}
                    multiple
                    style={selectBoxStyle}
                  >
                    {hardwareData?.map((hardware) => (
                      <option key={hardware._id} value={hardware._id}>
                        {hardware.assetName}
                      </option>
                    ))}
                  </select>
                </Box>
              )}

              {formState.maintenanceType === "Software" && (
                <Box sx={{ marginTop: "20px" }}>
                  <Typography sx={{ fontWeight: "bold", marginBottom: "5px" }}>
                    Select Desired Software
                  </Typography>
                  <select
                    id="software-select"
                    name="software"
                    onChange={handleChange}
                    multiple
                    style={selectBoxStyle}
                  >
                    {softwareData?.map((software) => (
                      <option key={software._id} value={software._id}>
                        {software.name}
                      </option>
                    ))}
                  </select>
                </Box>
              )}

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
                >
                  Start Maintenance
                </Button>
              </Box>
            </form>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default BulkMaintenance;
