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
} from "@mui/material";
import InputAdornment from '@mui/material/InputAdornment/index.js';
import { useAppContext } from "../../context/AppContext";
import Sidebar from "@/components/Sidebar";

import SearchIcon from "@mui/icons-material/Search";
import { useDebounce } from "@/utils/useDebounce";

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
};

const HardwareTickets: React.FC = () => {
  const { fetchSoftwareTickets, singleStateData } = useAppContext();
  const [loading, setLoading] = useState<boolean>(true);
  const [assetData, setAssetData] = useState<any[]>([]);
  const [totalAssets, setTotalAssets] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setPage(0); // Reset to the first page
      getDetails(0, rowsPerPage); // Fetch data with the current search query
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setPage(0); // Reset to the first page
    setRowsPerPage(newRowsPerPage);
    getDetails(0, newRowsPerPage); // Fetch data with new configuration
  };

  const getDetails = async (
    currentPage = page,
    currentRowsPerPage = rowsPerPage
  ) => {
    setLoading(true);
    try {
      const { data: assets, totalAssets } = await fetchSoftwareTickets(
        currentPage + 1,
        currentRowsPerPage,
        searchQuery,
        singleStateData._id
      );

      setAssetData(Array.isArray(assets) ? assets : []);
      setTotalAssets(totalAssets);
    } catch (error: any) {
      console.error("Error fetching asset details:", error.message);
      setAssetData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDetails(page, rowsPerPage, debouncedSearchQuery); // Fetch data whenever debouncedSearchQuery, page, or rowsPerPage changes
  }, [page, rowsPerPage, debouncedSearchQuery]);

  return (
    <Box>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: "20px",
              marginTop: "40px",
            }}
          >
            <Typography variant="h4">
              {totalAssets} Ticket{totalAssets !== 1 && "s"} found
            </Typography>

            <TextField
              placeholder="Search by Asset Name"
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
                  <TableCell>Software Name</TableCell>
                  <TableCell>Requester</TableCell>
                  <TableCell>Requester Email</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assetData?.length > 0 ? (
                  assetData.map((asset, index) => (
                    <TableRow hover key={asset._id}>
                      <TableCell>{index + 1 + page * rowsPerPage}</TableCell>
                      <TableCell>{asset.assetName}</TableCell>
                      <TableCell>{asset.name}</TableCell>
                      <TableCell>{asset.email}</TableCell>
                      <TableCell>{asset.department}</TableCell>
                      <TableCell>{asset.priority}</TableCell>
                      <TableCell>{asset.title}</TableCell>
                      <TableCell>{asset.description}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} style={{ textAlign: "center" }}>
                      No tickets available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalAssets}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default HardwareTickets;
