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
import assetTypes from "@/utils/assetTypes";
import Sidebar from "@/components/Sidebar";
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

const BulkInstallation: React.FC = () => {
  const { fetchSoftwareCategoriesData, bulkSoftwareWareInstallation } =
    useAppContext();

  const [isLoading, setIsLoading] = useState(false);
  const [softwareCategories, setSoftwareCategories] =
    useState<string>("Computer");
  const [softwareData, setSoftwareData] = useState([]);
  const [hardwareData, setHardwareData] = useState([]);
  const [isInstalling, setIsInstalling] = useState(false); // Tracks installation state
  const [installProgress, setInstallProgress] = useState(0); // Tracks progress percentage
  const [selectedSoftware, setSelectedSoftware] = useState<string[] | null>([]);
  const [selectedHardware, setSelectedHardware] = useState<string[] | null>([]);

  // Handle Category Change
  const handleCategoryChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setSoftwareCategories(e.target.value as string);
    setSelectedSoftware(null);
    setSelectedHardware(null);
  };

  // Handle Multi-Select Change
  const handleSoftwareChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setSelectedSoftware(selected);
  };

  const handleHardwareChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setSelectedHardware(selected);
  };

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsInstalling(true); // Set isInstalling to true
    setInstallProgress(0); // Reset progress
    const simulateProgress = () => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setInstallProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsInstalling(false);
            setInstallProgress(0);
          }, 500);
        }
      }, 300);
    };

    simulateProgress();

    const isInstalled = await bulkSoftwareWareInstallation(
      selectedSoftware,
      selectedHardware
    );
  };

  // Fetch Category Data
  const fetchSoftwareCategories = async () => {
    setIsLoading(true);
    const data = await fetchSoftwareCategoriesData(softwareCategories);
    const softwareInfo = data.software;
    const hardwareInfo = data.hardware;
    setSoftwareData(softwareInfo);
    setHardwareData(hardwareInfo);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSoftwareCategories();
  }, [softwareCategories]);

  if (isLoading) {
    return (
      <CircularProgress
        sx={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
    );
  }

  return (
    <Box sx={dashboardDesign}>
      <Sidebar />

      <Box
        sx={{
          width: "100%",
          marginLeft: "18%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white",
          marginTop: "12px",
          borderTop: "1px solid #d5d5d5",
          gap: "20px",
          padding: "20px",
          marginBottom: "2px",
        }}
      >
        <Typography sx={{ fontSize: "25px", marginTop: "40px" }}></Typography>

        <Box
          sx={{
            width: "100%",
            marginLeft: "20px",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "white",
            marginTop: "-30px",

            gap: "20px",
            padding: "20px",
          }}
        >
          <Box sx={assetSoftwareDesign}>
            {/* Header */}
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
              Initiate Bulk Installations
            </Typography>

            {/* Progress Bar */}
            {isInstalling && (
              <Box sx={{ marginTop: "10px" }}>
                <LinearProgress
                  variant="determinate"
                  value={installProgress}
                  sx={{ height: "8px", borderRadius: "5px" }}
                />
              </Box>
            )}

            {/* Category Selection */}
            <Box sx={{ marginTop: "20px" }}>
              <FormControl variant="outlined" sx={textFieldStyling} fullWidth>
                <InputLabel id="software-category-label">
                  Select Software Category
                </InputLabel>
                <Select
                  labelId="software-category-label"
                  id="category"
                  name="category"
                  value={softwareCategories}
                  onChange={handleCategoryChange}
                  label="Select Software Category"
                >
                  {assetTypes.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Multi-Select Software & Hardware */}
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: "flex", gap: "20px", marginTop: "20px" }}>
                {/* Software Multi-Select */}
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: "bold", marginBottom: "5px" }}>
                    Select Desired Software
                  </Typography>
                  <select
                    id="software-select"
                    name="software"
                    onChange={handleSoftwareChange}
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

                {/* Hardware Multi-Select */}
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: "bold", marginBottom: "5px" }}>
                    Select Desired Hardware
                  </Typography>
                  <select
                    id="hardware-select"
                    name="hardware"
                    onChange={handleHardwareChange}
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
              </Box>

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
                  Install
                </Button>
              </Box>
            </form>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default BulkInstallation;
