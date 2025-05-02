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
  Chip,
  Modal,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextareaAutosize,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useAppContext } from "@/context/AppContext";
import { useDebounce } from "@/utils/useDebounce";
import Layout from "@/components/Layout";

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
  modal: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 500,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: "12px",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalTitle: {
    marginBottom: 3,
    color: "#483D8B",
    fontWeight: "bold",
    fontSize: "1.5rem",
    borderBottom: "2px solid #483D8B",
    paddingBottom: 1,
  },
  modalSubtitle: {
    color: "#666",
    marginBottom: 1,
  },
  formControl: {
    marginBottom: 3,
    width: "100%",
    "& .MuiOutlinedInput-root": {
      "&:hover fieldset": {
        borderColor: "#483D8B",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#483D8B",
      },
    },
  },
  textArea: {
    width: "100%",
    minHeight: "50px",
    padding: "12px",
    marginBottom: "20px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
    fontFamily: "inherit",
    resize: "vertical",
    "&:focus": {
      outline: "none",
      borderColor: "#483D8B",
      boxShadow: "0 0 0 2px rgba(72, 61, 139, 0.1)",
    },
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 2,
    marginTop: 3,
    borderTop: "1px solid #eee",
    paddingTop: 2,
  },
  cancelButton: {
    color: "#666",
    borderColor: "#666",
    "&:hover": {
      borderColor: "#333",
      backgroundColor: "rgba(0, 0, 0, 0.04)",
    },
  },
  updateButton: {
    backgroundColor: "#483D8B",
    color: "white",
    "&:hover": {
      backgroundColor: "#3a2f6f",
    },
    "&:disabled": {
      backgroundColor: "rgba(72, 61, 139, 0.5)",
    },
  },
  taskInfo: {
    backgroundColor: "#f5f5f5",
    padding: 2,
    borderRadius: "8px",
    marginBottom: 3,
  },
  taskInfoRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 1,
    "&:last-child": {
      marginBottom: 0,
    },
  },
  taskInfoLabel: {
    color: "#666",
    fontWeight: "medium",
  },
  taskInfoValue: {
    color: "#333",
    fontWeight: "bold",
  },
  commentsHistory: {
    maxHeight: "200px",
    overflowY: "auto",
    marginBottom: 3,
    padding: 2,
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
  },
  commentItem: {
    padding: "12px",
    borderBottom: "1px solid #e0e0e0",
    "&:last-child": {
      borderBottom: "none",
    },
  },
  commentHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 1,
  },
  commentDate: {
    color: "#666",
    fontSize: "0.875rem",
  },
  commentText: {
    color: "#333",
    fontSize: "0.875rem",
    whiteSpace: "pre-wrap",
  },
  commentStatus: {
    fontSize: "0.75rem",
    padding: "2px 8px",
    borderRadius: "12px",
    backgroundColor: "#e0e0e0",
  },
};

// Status color mapping
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "#FFA500"; // Orange
    case "in progress":
      return "#2196F3"; // Blue
    case "completed":
      return "#4CAF50"; // Green
    case "deferred":
      return "#F44336"; // Red
    default:
      return "#757575"; // Grey
  }
};

// Priority color mapping
const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case "low":
      return "#4CAF50"; // Green
    case "medium":
      return "#FFA500"; // Orange
    case "high":
      return "#F44336"; // Red
    case "critical":
      return "#9C27B0"; // Purple
    default:
      return "#757575"; // Grey
  }
};

interface MaintenanceTask {
  _id: string;
  maintenanceId: string;
  taskName: string;
  assetName: string;
  category: string;
  status: string;
  priority: string;
  dueDate: string;
  assignedTo: string;
  comments?: { createdAt: string; text: string; status: string }[];
}

const AllMaintenance: React.FC = () => {
  const { fetchAllMaintenance, updateMaintenanceStatus } = useAppContext();
  const [loading, setLoading] = useState<boolean>(true);
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceTask[]>([]);
  const [totalMaintenance, setTotalMaintenance] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(
    null
  );
  const [newStatus, setNewStatus] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [updating, setUpdating] = useState<boolean>(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setPage(0);
      getMaintenanceData();
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    getMaintenanceData(newPage + 1, rowsPerPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setPage(0);
    setRowsPerPage(newRowsPerPage);
    getMaintenanceData(1, newRowsPerPage);
  };

  const getMaintenanceData = async (
    currentPage = page + 1,
    currentRowsPerPage = rowsPerPage
  ) => {
    setLoading(true);
    try {
      const response = await fetchAllMaintenance(
        currentPage,
        currentRowsPerPage,
        debouncedSearchQuery
      );
      if (response?.success) {
        setMaintenanceData(response.data);
        setTotalMaintenance(response.totalMaintenance);
      }
    } catch (error: any) {
      console.error("Error fetching maintenance data:", error.message);
      setMaintenanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (task: MaintenanceTask) => {
    setSelectedTask(task);
    setNewStatus(task.status);
    setComment("");
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedTask(null);
    setNewStatus("");
    setComment("");
  };

  const handleStatusUpdate = async () => {
    if (!selectedTask || !newStatus) return;

    setUpdating(true);
    try {
      const response = await updateMaintenanceStatus(selectedTask._id, {
        status: newStatus,
        comment: comment,
      });

      if (response?.success) {
        // Refresh the data
        await getMaintenanceData();
        handleModalClose();
      }
    } catch (error: any) {
      console.error("Error updating maintenance status:", error.message);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    getMaintenanceData();
  }, [debouncedSearchQuery]);

  return (
    <Layout>
      <Box>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <Typography variant="h4">
                {totalMaintenance} Maintenance Task
                {totalMaintenance !== 1 && "s"} found
              </Typography>

              <TextField
                placeholder="Search by Task Name"
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
                    <TableCell>Maintenance ID</TableCell>
                    <TableCell>Task Name</TableCell>
                    <TableCell>Asset Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Assigned To</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {maintenanceData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((task, index) => (
                      <TableRow
                        hover
                        key={task._id}
                        onClick={() => handleRowClick(task)}
                        sx={{ cursor: "pointer" }}
                      >
                        <TableCell>{index + 1 + page * rowsPerPage}</TableCell>
                        <TableCell>{task.maintenanceId}</TableCell>
                        <TableCell>{task.taskName}</TableCell>
                        <TableCell>{task.assetName}</TableCell>
                        <TableCell>{task.category}</TableCell>
                        <TableCell>
                          <Chip
                            label={task.status}
                            sx={{
                              backgroundColor: getStatusColor(task.status),
                              color: "white",
                              fontWeight: "bold",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={task.priority}
                            sx={{
                              backgroundColor: getPriorityColor(task.priority),
                              color: "white",
                              fontWeight: "bold",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(task.dueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{task.assignedTo}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={totalMaintenance}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />

            <Modal
              open={modalOpen}
              onClose={handleModalClose}
              aria-labelledby="maintenance-update-modal"
            >
              <Box sx={dashboardStyles.modal}>
                <Typography
                  variant="h6"
                  component="h2"
                  sx={dashboardStyles.modalTitle}
                >
                  Update Maintenance Status
                </Typography>
                {selectedTask && (
                  <>
                    <Box sx={dashboardStyles.taskInfo}>
                      <Box sx={dashboardStyles.taskInfoRow}>
                        <Typography sx={dashboardStyles.taskInfoLabel}>
                          Task Name:
                        </Typography>
                        <Typography sx={dashboardStyles.taskInfoValue}>
                          {selectedTask.taskName}
                        </Typography>
                      </Box>
                      <Box sx={dashboardStyles.taskInfoRow}>
                        <Typography sx={dashboardStyles.taskInfoLabel}>
                          Maintenance ID:
                        </Typography>
                        <Typography sx={dashboardStyles.taskInfoValue}>
                          {selectedTask.maintenanceId}
                        </Typography>
                      </Box>
                      <Box sx={dashboardStyles.taskInfoRow}>
                        <Typography sx={dashboardStyles.taskInfoLabel}>
                          Asset:
                        </Typography>
                        <Typography sx={dashboardStyles.taskInfoValue}>
                          {selectedTask.assetName}
                        </Typography>
                      </Box>
                      <Box sx={dashboardStyles.taskInfoRow}>
                        <Typography sx={dashboardStyles.taskInfoLabel}>
                          Current Status:
                        </Typography>
                        <Chip
                          label={selectedTask.status}
                          sx={{
                            backgroundColor: getStatusColor(
                              selectedTask.status
                            ),
                            color: "white",
                          }}
                        />
                      </Box>
                    </Box>

                    <Typography
                      variant="subtitle1"
                      sx={dashboardStyles.modalSubtitle}
                    >
                      New Status
                    </Typography>
                    <FormControl sx={dashboardStyles.formControl}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={newStatus}
                        label="Status"
                        onChange={(e) => setNewStatus(e.target.value)}
                      >
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="In Progress">In Progress</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                        <MenuItem value="Deferred">Deferred</MenuItem>
                      </Select>
                    </FormControl>

                    <Typography
                      variant="subtitle1"
                      sx={dashboardStyles.modalSubtitle}
                    >
                      Previous Comments
                    </Typography>
                    <Box sx={dashboardStyles.commentsHistory}>
                      {selectedTask.comments &&
                      selectedTask.comments.length > 0 ? (
                        selectedTask.comments.map((comment, index) => (
                          <Box key={index} sx={dashboardStyles.commentItem}>
                            <Box sx={dashboardStyles.commentHeader}>
                              <Typography sx={dashboardStyles.commentDate}>
                                {new Date(comment.createdAt).toLocaleString()}
                              </Typography>
                              <Chip
                                label={comment.status}
                                size="small"
                                sx={{
                                  backgroundColor: getStatusColor(
                                    comment.status
                                  ),
                                  color: "white",
                                }}
                              />
                            </Box>
                            <Typography sx={dashboardStyles.commentText}>
                              {comment.text}
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Typography
                          sx={{ color: "#666", textAlign: "center", py: 2 }}
                        >
                          No previous comments
                        </Typography>
                      )}
                    </Box>

                    <Typography
                      variant="subtitle1"
                      sx={dashboardStyles.modalSubtitle}
                    >
                      Add Comment
                    </Typography>
                    <TextareaAutosize
                      minRows={2}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Enter your comment here..."
                      style={dashboardStyles.textArea}
                    />

                    <Box sx={dashboardStyles.buttonContainer}>
                      <Button
                        variant="outlined"
                        onClick={handleModalClose}
                        disabled={updating}
                        sx={dashboardStyles.cancelButton}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleStatusUpdate}
                        disabled={updating || !newStatus}
                        sx={dashboardStyles.updateButton}
                      >
                        {updating ? "Updating..." : "Update Status"}
                      </Button>
                    </Box>
                  </>
                )}
              </Box>
            </Modal>
          </>
        )}
      </Box>
    </Layout>
  );
};

export default AllMaintenance;
