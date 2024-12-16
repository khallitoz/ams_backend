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
import { useAppContext } from "../../context/AppContext";
import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";

const dashboardStyles = {
  container: {
    display: "flex",
  },
  content: {
    width: "100%",
    marginLeft: "290px",
    marginTop: "100px",
    display: "flex",
    flexDirection: "column" as const,
    backgroundColor: "white",
    borderTop: "1px solid #d5d5d5",
    gap: "20px",
    padding: "20px",
  },
  table: {
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    overflow: "hidden",
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
    justifyContent: "flex-end",
    marginBottom: "10px",
  },
  searchInput: {
    width: "20%",
    "& .MuiInputBase-root": {
      borderBottom: "2px solid #483D8B",
    },
  },
};

const AllAssets: React.FC = () => {
  const { getAllAssetDetails } = useAppContext();
  const [loading, setLoading] = useState<boolean>(true);
  const [assetData, setAssetData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredData = Array.isArray(assetData)
    ? assetData.filter((asset) =>
      asset.assetName?.toLowerCase().includes(searchQuery)
    )
    : [];

  useEffect(() => {
    const getDetails = async () => {
      try {
        const assetDetails = await getAllAssetDetails();
        setAssetData(Array.isArray(assetDetails) ? assetDetails : []);
      } catch (error: any) {
        console.error("Error fetching asset details:", error.message);
        setAssetData([]); // Fallback to an empty array on error
      } finally {
        setLoading(false);
      }
    };
    getDetails();
  }, []);

  // if (loading) {
  //   return (
  //     <CircularProgress
  //       sx={{
  //         position: "fixed",
  //         top: "50%",
  //         left: "50%",
  //         transform: "translate(-50%, -50%)",
  //       }}
  //     />
  //   );
  // }

  return (
    <Box sx={dashboardStyles.container}>
      <Sidebar />

      <Box sx={dashboardStyles.content}>
        <Typography sx={{ fontSize: "25px" }}>
          All Assets
        </Typography>

        <Box>
          <TabBar />
        </Box>

        {/* Search Input */}
        <Box sx={dashboardStyles.searchContainer}>
          <TextField
            placeholder="Search by Asset Name"
            variant="outlined"
            onChange={handleSearch}
            sx={dashboardStyles.searchInput}
          />
        </Box>

        <Box>
          {filteredData.length > 0 ? (
            <>
              <TableContainer component={Paper} sx={dashboardStyles.table}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Asset Number</TableCell>
                      <TableCell>Asset Name</TableCell>
                      <TableCell>Asset Type</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Condition</TableCell>
                      <TableCell>Location</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredData
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((asset) => (
                        <Link
                          href={`/user/singleassetdetails/${asset._id}`}
                          key={asset._id}
                          passHref
                          legacyBehavior
                        >
                          <TableRow
                            sx={{ textDecoration: "none" }}
                            hover
                            component="a"
                          >
                            <TableCell >{asset.assetCount}</TableCell>
                            <TableCell>{asset.assetName}</TableCell>
                            <TableCell>{asset.assetType}</TableCell>
                            <TableCell>{asset.category || "N/A"}</TableCell>
                            <TableCell>{asset.condition}</TableCell>
                            <TableCell>{asset.location}</TableCell>
                          </TableRow>
                        </Link>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          ) : (
            <Typography>No assets available</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AllAssets;
