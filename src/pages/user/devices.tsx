import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  TablePagination,
  Button,
  Chip,
  InputAdornment,
  keyframes,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DevicesIcon from "@mui/icons-material/Devices";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import ShieldIcon from "@mui/icons-material/Shield";
import { useAppContext } from "../../context/AppContext";
import { useDebounce } from "@/utils/useDebounce";
import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import Layout from "@/components/Layout";
import { useRouter } from "next/router";

// Define a blinking animation keyframe that alternates between outline and filled
const blinkingAnimation = keyframes`
  0%, 100% {
    color: #4CAF50;
    background-color: transparent;
    filter: drop-shadow(0 0 2px #4CAF50);
  }
  50% {
    color: white;
    background-color: #4CAF50;
    filter: drop-shadow(0 0 3px #4CAF50);
  }
`;

const dashboardStyles = {
  container: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
  },
  content: {
    width: "82%",
    marginLeft: "18%",
    marginTop: "80px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px",
    padding: "20px",
  },
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
  headerContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    color: "white",
    "&:hover": {
      backgroundColor: "#3e8e41",
    },
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    color: "#333",
    marginRight: "10px",
    "&:hover": {
      backgroundColor: "#e0e0e0",
    },
  },
  deviceIcon: {
    marginRight: "5px",
  },
  statusChip: {
    borderRadius: "4px",
    fontWeight: "bold",
    padding: "4px 8px",
  },
  activeChip: {
    backgroundColor: "#4CAF50",
    color: "white",
  },
  inactiveChip: {
    backgroundColor: "#F44336",
    color: "white",
  },
  securityCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  securedIcon: {
    animation: `${blinkingAnimation} 3s infinite ease-in-out`,
    padding: "3px",
    borderRadius: "50%",
    fontSize: "26px",
  },
};

interface Device {
  id: string;
  deviceName: string;
  status: "Active" | "Inactive";
  operatingSystem: string;
  assignedTo: string;
  department: string;
  location: string;
  isSecured: boolean;
}

const DevicesPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [totalDevices, setTotalDevices] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setPage(0);
      fetchDevices();
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setPage(0);
    setRowsPerPage(newRowsPerPage);
    fetchDevices();
  };

  // Mock data for demonstration
  const mockDevices: Device[] = [
    {
      id: "1",
      deviceName: 'Lenovo ThinkPad 14"',
      status: "Active",
      operatingSystem: "MacOS Sonoma",
      assignedTo: "Immanuel Imberg",
      department: "Marketing",
      location: "Berlin",
      isSecured: true,
    },
    {
      id: "2",
      deviceName: "MacBook Air",
      status: "Inactive",
      operatingSystem: "MacOS Monterey",
      assignedTo: "Unassigned",
      department: "Unassigned",
      location: "Unassigned",
      isSecured: false,
    },
    {
      id: "3",
      deviceName: "MacBook Pro",
      status: "Active",
      operatingSystem: "MacOS Sonoma",
      assignedTo: "Rebecca Lang",
      department: "Marketing",
      location: "Berlin",
      isSecured: true,
    },
    {
      id: "4",
      deviceName: "iPhone 16 Pro",
      status: "Active",
      operatingSystem: "iOS",
      assignedTo: "Laura Erdmann",
      department: "Production",
      location: "Munich",
      isSecured: true,
    },
    {
      id: "5",
      deviceName: 'iPad 10.9"',
      status: "Inactive",
      operatingSystem: "iOS",
      assignedTo: "Theo Hoffmann",
      department: "Production",
      location: "Hamburg",
      isSecured: false,
    },
  ];

  const fetchDevices = () => {
    setLoading(true);

    // Simulate API call with setTimeout
    setTimeout(() => {
      // Filter devices based on search query if needed
      const filteredDevices = mockDevices.filter(
        (device) =>
          device.deviceName
            .toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase()) ||
          device.operatingSystem
            .toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase()) ||
          device.assignedTo
            .toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase()) ||
          device.department
            .toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase()) ||
          device.location
            .toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase())
      );

      setDevices(filteredDevices);
      setTotalDevices(filteredDevices.length);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    fetchDevices();
  }, [debouncedSearchQuery, page, rowsPerPage]);

  const getStatusChipStyle = (status: string) => {
    switch (status) {
      case "Active":
        return { ...dashboardStyles.statusChip, ...dashboardStyles.activeChip };
      case "Inactive":
        return {
          ...dashboardStyles.statusChip,
          ...dashboardStyles.inactiveChip,
        };
      default:
        return dashboardStyles.statusChip;
    }
  };

  const router = useRouter();

  return (
    <Layout>
      <Box>
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <Box sx={dashboardStyles.headerContainer}>
              <Typography variant="h4">
                <DevicesIcon sx={dashboardStyles.deviceIcon} />
                Devices {totalDevices > 0 && `(${totalDevices})`}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <Typography variant="h6">
                {totalDevices} Device{totalDevices !== 1 && "s"} found
              </Typography>

              <TextField
                placeholder="Search by device name, OS, location..."
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
                sx={dashboardStyles.searchInput}
              />
            </Box>
            <TableContainer component={Paper} sx={dashboardStyles.table}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Device Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Operating System</TableCell>
                    <TableCell>Assigned To</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Security</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {devices
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((device, index) => (
                      <TableRow
                        key={device.id}
                        hover
                        component="tr"
                        sx={{ cursor: "pointer" }}
                        onClick={() =>
                          router.push(`/user/devices/${device.id}`)
                        }
                      >
                        <TableCell>{index + 1 + page * rowsPerPage}</TableCell>
                        <TableCell>{device.deviceName}</TableCell>
                        <TableCell>
                          <Chip
                            label={device.status}
                            sx={getStatusChipStyle(device.status)}
                          />
                        </TableCell>
                        <TableCell>{device.operatingSystem}</TableCell>
                        <TableCell>{device.assignedTo}</TableCell>
                        <TableCell>{device.department}</TableCell>
                        <TableCell>{device.location}</TableCell>
                        <TableCell sx={dashboardStyles.securityCell}>
                          {device.isSecured ? (
                            <>
                              <LockIcon sx={dashboardStyles.securedIcon} />
                              <ShieldIcon sx={dashboardStyles.securedIcon} />
                            </>
                          ) : (
                            <>
                              <LockOpenIcon color="error" />
                              <ShieldIcon color="error" />
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalDevices}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
    </Layout>
  );
};

export default DevicesPage;
