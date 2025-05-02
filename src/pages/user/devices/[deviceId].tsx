import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  Chip,
  Button,
  CircularProgress,
  IconButton,
  Breadcrumbs,
  Divider,
  Tooltip,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import ShieldIcon from "@mui/icons-material/Shield";
import LaptopIcon from "@mui/icons-material/Laptop";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import HomeIcon from "@mui/icons-material/Home";
import DevicesIcon from "@mui/icons-material/Devices";
import { useAppContext } from "@/context/AppContext";
import Layout from "@/components/Layout";
import Link from "next/link";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`device-tabpanel-${index}`}
      aria-labelledby={`device-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `device-tab-${index}`,
    "aria-controls": `device-tabpanel-${index}`,
  };
}

// Mock device data with different configurations based on ID
const getMockDeviceData = (deviceId: string | string[] | undefined) => {
  // Convert deviceId to string if it's an array
  const id = Array.isArray(deviceId) ? deviceId[0] : String(deviceId);

  // Sample data map to show different devices based on ID
  const deviceMap: { [key: string]: any } = {
    "1": {
      id: "1",
      deviceName: "MacBook Pro",
      assignedTo: "Rebecca Lang",
      department: "Marketing",
      location: "Warehouse",
      status: "Active",
      isProtected: true,
      isEncrypted: true,
      condition:
        "- Small scratches on display\n- Trackpad & Keyboard in good condition\n- Battery Health 90%",
      notes: "Device recently updated and restored by\nMr. Frank Hoffmann",
      systemStorage: "202,12GB of 500 GB used",
      specs: {
        serialNumber: "12345HU25",
        macAddress: "A1:B2:C3:D4:E5:F6",
        processor: "Apple M3",
        memory: "16 GB",
        operatingSystem: "Monetery (12.6)",
        lastScan: "April 02, 2025 16:00",
      },
    },
    "2": {
      id: "2",
      deviceName: "MacBook Air",
      assignedTo: "Unassigned",
      department: "Unassigned",
      location: "IT Storage",
      status: "Inactive",
      isProtected: false,
      isEncrypted: true,
      condition: "- New condition\n- Factory reset completed",
      notes: "Available for assignment",
      systemStorage: "50,24GB of 256 GB used",
      specs: {
        serialNumber: "AIR7890XYZ",
        macAddress: "F1:E2:D3:C4:B5:A6",
        processor: "Apple M2",
        memory: "8 GB",
        operatingSystem: "Monterey (12.4)",
        lastScan: "April 15, 2025 09:30",
      },
    },
    "3": {
      id: "3",
      deviceName: "MacBook Pro",
      assignedTo: "Rebecca Lang",
      department: "Marketing",
      location: "Berlin",
      status: "Active",
      isProtected: true,
      isEncrypted: true,
      condition: "- Excellent condition\n- Recently serviced",
      notes: "Premium device assigned to marketing lead",
      systemStorage: "350,75GB of 1 TB used",
      specs: {
        serialNumber: "PRO456789X",
        macAddress: "A0:B9:C8:D7:E6:F5",
        processor: "Apple M3 Pro",
        memory: "32 GB",
        operatingSystem: "Sonoma (14.3)",
        lastScan: "April 20, 2025 14:45",
      },
    },
    "4": {
      id: "4",
      deviceName: "iPhone 16 Pro",
      assignedTo: "Laura Erdmann",
      department: "Production",
      location: "Munich",
      status: "Active",
      isProtected: true,
      isEncrypted: true,
      condition: "- Like new\n- Screen protector applied\n- Battery Health 98%",
      notes: "Field device with advanced camera for production team",
      systemStorage: "89,35GB of 256 GB used",
      specs: {
        serialNumber: "IP16P789012",
        macAddress: "G1:H2:I3:J4:K5:L6",
        processor: "A18 Bionic",
        memory: "8 GB",
        operatingSystem: "iOS 18.2",
        lastScan: "April 18, 2025 10:15",
      },
    },
    "5": {
      id: "5",
      deviceName: 'iPad 10.9"',
      assignedTo: "Theo Hoffmann",
      department: "Production",
      location: "Hamburg",
      status: "Inactive",
      isProtected: false,
      isEncrypted: false,
      condition:
        "- Cracked screen (corner)\n- Battery Health 82%\n- Scheduled for repair",
      notes: "Needs service before reassignment",
      systemStorage: "45,12GB of 128 GB used",
      specs: {
        serialNumber: "PAD567890C",
        macAddress: "M1:N2:O3:P4:Q5:R6",
        processor: "A14 Bionic",
        memory: "4 GB",
        operatingSystem: "iPadOS 17.5",
        lastScan: "March 30, 2025 08:20",
      },
    },
  };

  // Return the specific device data or a default if ID not found
  return deviceMap[id] || deviceMap["1"];
};

const DeviceDetails: React.FC = () => {
  const router = useRouter();
  const { deviceId } = router.query;
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [device, setDevice] = useState<any>(null);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    if (deviceId) {
      // Get mock data based on deviceId
      const mockDevice = getMockDeviceData(deviceId);
      setDevice(mockDevice);
      setLoading(false);
    }
  }, [deviceId]);

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress size={60} thickness={4} sx={{ color: "#483D8B" }} />
        </Box>
      </Layout>
    );
  }

  const securityActions = [
    {
      icon: <PowerSettingsNewIcon />,
      label: "Shutdown",
      color: "#d32f2f", // red
      bgColor: "rgba(211, 47, 47, 0.1)",
      tooltip: "Power off the device remotely",
    },
    {
      icon: <RestartAltIcon />,
      label: "Restart",
      color: "#2e7d32", // green
      bgColor: "rgba(46, 125, 50, 0.1)",
      tooltip: "Restart the device remotely",
    },
    {
      icon: <VisibilityOffIcon />,
      label: "Lost Mode",
      color: "#ed6c02", // orange
      bgColor: "rgba(237, 108, 2, 0.1)",
      tooltip: "Activate lost mode to track and locate the device",
    },
    {
      icon: <LockOutlinedIcon />,
      label: "Remote Lock",
      color: "#0288d1", // blue
      bgColor: "rgba(2, 136, 209, 0.1)",
      tooltip: "Lock the device remotely",
    },
    {
      icon: <DeleteForeverIcon />,
      label: "Erase & Reset",
      color: "#9c27b0", // purple
      bgColor: "rgba(156, 39, 176, 0.1)",
      tooltip: "Erase all data and reset to factory settings",
    },
    {
      icon: <AdminPanelSettingsIcon />,
      label: "Corporate Wipe",
      color: "#6927b0", // darker purple
      bgColor: "rgba(105, 39, 176, 0.1)",
      tooltip: "Remove only corporate data while preserving personal files",
    },
  ];

  return (
    <Layout>
      <Box sx={{ px: 4, py: 3 }}>
        {/* Navigation */}
        <Box sx={{ mb: 3 }}>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
          >
            <Link href="/" passHref>
              <Box
                component="a"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: "#666",
                  textDecoration: "none",
                }}
              >
                <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
                Home
              </Box>
            </Link>
            <Link href="/user/devices" passHref>
              <Box
                component="a"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: "#666",
                  textDecoration: "none",
                }}
              >
                <DevicesIcon sx={{ mr: 0.5 }} fontSize="small" />
                Devices
              </Box>
            </Link>
            <Typography
              color="text.primary"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <LaptopIcon sx={{ mr: 0.5 }} fontSize="small" />
              {device?.deviceName}
            </Typography>
          </Breadcrumbs>

          <Box sx={{ mt: 1, display: "flex", alignItems: "center" }}>
            <IconButton
              onClick={() => router.push("/user/devices")}
              color="primary"
              sx={{
                mr: 1,
                bgcolor: "rgba(72, 61, 139, 0.1)",
                "&:hover": {
                  bgcolor: "rgba(72, 61, 139, 0.2)",
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography
              variant="h4"
              sx={{ display: "flex", alignItems: "center" }}
            >
              Device Details
              <Typography
                variant="h4"
                sx={{ ml: 1, fontWeight: "500", color: "#483D8B" }}
              >
                {device?.deviceName &&
                  `${device.assignedTo}'s ${device.deviceName}`}
              </Typography>
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Status Badges */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            alignItems: "center",
            mb: 3,
          }}
        >
          {device?.isProtected && (
            <Chip
              icon={<LockIcon />}
              label="Protected"
              color="success"
              variant="outlined"
              sx={{
                fontWeight: "bold",
                borderWidth: 2,
                "& .MuiChip-icon": { color: "#2e7d32" },
              }}
            />
          )}
          {!device?.isProtected && (
            <Chip
              icon={<LockIcon />}
              label="Unprotected"
              color="error"
              variant="outlined"
              sx={{
                fontWeight: "bold",
                borderWidth: 2,
                "& .MuiChip-icon": { color: "#d32f2f" },
              }}
            />
          )}
          {device?.isEncrypted && (
            <Chip
              icon={<ShieldIcon />}
              label="Encrypted"
              color="primary"
              variant="outlined"
              sx={{
                fontWeight: "bold",
                borderWidth: 2,
                "& .MuiChip-icon": { color: "#0288d1" },
              }}
            />
          )}
          {!device?.isEncrypted && (
            <Chip
              icon={<ShieldIcon />}
              label="Unencrypted"
              color="error"
              variant="outlined"
              sx={{
                fontWeight: "bold",
                borderWidth: 2,
                "& .MuiChip-icon": { color: "#d32f2f" },
              }}
            />
          )}
          <Chip
            label={device?.status}
            color={device?.status === "Active" ? "success" : "error"}
            sx={{ fontWeight: "bold" }}
          />
        </Box>

        {/* Security Action Buttons */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {securityActions.map((action, index) => (
            <Grid item xs={2} key={index}>
              <Tooltip title={action.tooltip} placement="top">
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    backgroundColor: action.bgColor,
                    borderRadius: "8px",
                    p: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: action.bgColor.replace("0.1", "0.2"),
                      cursor: "pointer",
                      transform: "translateY(-3px)",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      color: action.color,
                      fontSize: "28px",
                      "& .MuiSvgIcon-root": {
                        fontSize: "28px",
                      },
                    }}
                  >
                    {action.icon}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      fontWeight: "bold",
                      color: action.color,
                    }}
                  >
                    {action.label}
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>
          ))}
        </Grid>

        {/* Tabs */}
        <Box sx={{ width: "100%", mb: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="device tabs"
              sx={{
                "& .MuiTab-root": {
                  fontWeight: "bold",
                  fontSize: "15px",
                },
                "& .Mui-selected": {
                  color: "white !important",
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: "#483D8B",
                },
              }}
            >
              <Tab
                label="Device Info"
                {...a11yProps(0)}
                sx={{
                  bgcolor: tabValue === 0 ? "#483D8B" : "#e0e0e0",
                  color: tabValue === 0 ? "white !important" : "#333",
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                  mr: 1,
                  fontWeight: tabValue === 0 ? "bold" : "normal",
                }}
              />
              <Tab
                label="Security"
                {...a11yProps(1)}
                sx={{
                  bgcolor: tabValue === 1 ? "#483D8B" : "#e0e0e0",
                  color: tabValue === 1 ? "white !important" : "#333",
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                  mr: 1,
                  fontWeight: tabValue === 1 ? "bold" : "normal",
                }}
              />
              <Tab
                label="Software"
                {...a11yProps(2)}
                sx={{
                  bgcolor: tabValue === 2 ? "#483D8B" : "#e0e0e0",
                  color: tabValue === 2 ? "white !important" : "#333",
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                  fontWeight: tabValue === 2 ? "bold" : "normal",
                }}
              />
            </Tabs>
          </Box>

          {/* Device Info Tab */}
          <TabPanel value={tabValue} index={0}>
            <Paper
              elevation={0}
              sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: "8px" }}
            >
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        color="#483D8B"
                      >
                        Assigned To
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{device?.assignedTo}</Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        color="#483D8B"
                      >
                        Department
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{device?.department}</Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        color="#483D8B"
                      >
                        Location
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{device?.location}</Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        color="#483D8B"
                      >
                        Condition
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      {device?.condition
                        ?.split("\n")
                        .map((line: string, i: number) => (
                          <Typography key={i} variant="body2" sx={{ my: 0.25 }}>
                            {line}
                          </Typography>
                        ))}
                    </Grid>

                    <Grid item xs={4}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        color="#483D8B"
                      >
                        Notes
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      {device?.notes
                        ?.split("\n")
                        .map((line: string, i: number) => (
                          <Typography key={i} variant="body2" sx={{ my: 0.25 }}>
                            {line}
                          </Typography>
                        ))}
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={6}>
                  <Grid container spacing={1}>
                    <Grid item xs={5}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        color="#483D8B"
                      >
                        System Storage
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography>{device?.systemStorage}</Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        color="#483D8B"
                        sx={{ mt: 1, mb: 0.5 }}
                      >
                        Device Specs
                      </Typography>
                      <Divider />
                    </Grid>

                    <Grid item xs={5}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Serial Nr.
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="body2">
                        {device?.specs?.serialNumber}
                      </Typography>
                    </Grid>

                    <Grid item xs={5}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Mac Address
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="body2">
                        {device?.specs?.macAddress}
                      </Typography>
                    </Grid>

                    <Grid item xs={5}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Processor
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="body2">
                        {device?.specs?.processor}
                      </Typography>
                    </Grid>

                    <Grid item xs={5}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Memory
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="body2">
                        {device?.specs?.memory}
                      </Typography>
                    </Grid>

                    <Grid item xs={5}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Operating System
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="body2">
                        {device?.specs?.operatingSystem}
                      </Typography>
                    </Grid>

                    <Grid item xs={5}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Last Scan
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="body2">
                        {device?.specs?.lastScan}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          </TabPanel>

          {/* Security Tab */}
          <TabPanel value={tabValue} index={1}>
            <Paper
              elevation={0}
              sx={{ p: 3, border: "1px solid #e0e0e0", borderRadius: "8px" }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    sx={{ mb: 2, color: "#483D8B", fontWeight: "bold" }}
                  >
                    Security Status
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Protection Status
                      </Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <Chip
                        label={
                          device?.isProtected ? "Protected" : "Unprotected"
                        }
                        color={device?.isProtected ? "success" : "error"}
                        sx={{ fontWeight: "bold" }}
                      />
                    </Grid>

                    <Grid item xs={3}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Encryption
                      </Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <Chip
                        label={
                          device?.isEncrypted ? "Encrypted" : "Unencrypted"
                        }
                        color={device?.isEncrypted ? "primary" : "error"}
                        sx={{ fontWeight: "bold" }}
                      />
                    </Grid>

                    <Grid item xs={3}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Last Security Scan
                      </Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <Typography>{device?.specs?.lastScan}</Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ mt: 3 }}>
                        <Button
                          variant="contained"
                          sx={{
                            mr: 2,
                            bgcolor: "#483D8B",
                            fontWeight: "bold",
                            "&:hover": {
                              bgcolor: "#372d7a",
                            },
                          }}
                        >
                          Run Security Scan
                        </Button>
                        <Button
                          variant="outlined"
                          color="success"
                          sx={{
                            fontWeight: "bold",
                            borderWidth: "2px",
                            "&:hover": {
                              borderWidth: "2px",
                            },
                          }}
                        >
                          Update Protection
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          </TabPanel>

          {/* Software Tab */}
          <TabPanel value={tabValue} index={2}>
            <Paper
              elevation={0}
              sx={{ p: 3, border: "1px solid #e0e0e0", borderRadius: "8px" }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    sx={{ mb: 2, color: "#483D8B", fontWeight: "bold" }}
                  >
                    Installed Software
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          border: "1px solid #e0e0e0",
                          borderRadius: 2,
                          height: "100%",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                            borderColor: "#483D8B",
                          },
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          color="#483D8B"
                        >
                          Operating System
                        </Typography>
                        <Typography variant="body1">
                          {device?.specs?.operatingSystem}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          Last Update: April 28, 2025
                        </Typography>
                        <Chip
                          label="Up to date"
                          size="small"
                          color="success"
                          sx={{ mt: 1 }}
                        />
                      </Paper>
                    </Grid>

                    <Grid item xs={4}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          border: "1px solid #e0e0e0",
                          borderRadius: 2,
                          height: "100%",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                            borderColor: "#483D8B",
                          },
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          color="#483D8B"
                        >
                          Microsoft Office
                        </Typography>
                        <Typography variant="body1">Version 16.76</Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          License: Enterprise (Valid until Dec 2025)
                        </Typography>
                        <Chip
                          label="Update available"
                          size="small"
                          color="primary"
                          sx={{ mt: 1 }}
                        />
                      </Paper>
                    </Grid>

                    <Grid item xs={4}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          border: "1px solid #e0e0e0",
                          borderRadius: 2,
                          height: "100%",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                            borderColor: "#483D8B",
                          },
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          color="#483D8B"
                        >
                          Adobe Creative Suite
                        </Typography>
                        <Typography variant="body1">Version 2025</Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          License: Enterprise (Valid until Oct 2025)
                        </Typography>
                        <Chip
                          label="Up to date"
                          size="small"
                          color="success"
                          sx={{ mt: 1 }}
                        />
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sx={{ mt: 3 }}>
                      <Button
                        variant="contained"
                        sx={{
                          mr: 2,
                          bgcolor: "#483D8B",
                          fontWeight: "bold",
                          "&:hover": {
                            bgcolor: "#372d7a",
                          },
                        }}
                      >
                        Install New Software
                      </Button>
                      <Button
                        variant="outlined"
                        sx={{
                          fontWeight: "bold",
                          borderWidth: "2px",
                          borderColor: "#483D8B",
                          color: "#483D8B",
                          "&:hover": {
                            borderWidth: "2px",
                            borderColor: "#372d7a",
                          },
                        }}
                      >
                        View All Software
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          </TabPanel>
        </Box>
      </Box>
    </Layout>
  );
};

export default DeviceDetails;
