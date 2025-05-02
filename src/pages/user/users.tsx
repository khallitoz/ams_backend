import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TextField,
  Pagination,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { belzirAxiosGet } from "@/utils/axiosHelper";
import { toast } from "react-toastify";
import Sidebar from "@/components/Sidebar";

interface User {
  _id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  clientId: string;
  firstLogin: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UsersResponse {
  success: boolean;
  data: {
    users: User[];
    totalUsers: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

const UsersPage: React.FC = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalUsers, setTotalUsers] = useState<number>(0);

  const fetchUsers = async (pageNum: number = 1, search: string = "") => {
    try {
      setLoading(true);
      const response = await belzirAxiosGet(
        "http://localhost:4002/api/v1/amsservices/users",
        {
          page: pageNum,
          limit: 10,
          search: search,
        }
      );

      if (response.data.success) {
        setUsers(response.data.data.users);
        setTotalPages(response.data.data.totalPages);
        setTotalUsers(response.data.data.totalUsers);
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page, searchQuery);
  }, [page]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
    fetchUsers(1, searchQuery);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const handleEditUser = (userId: string) => {
    // Navigate to edit user page
    router.push(`/user/edit-user/${userId}`);
  };

  const handleDeleteUser = async (userId: string) => {
    // Implement delete user functionality
    if (window.confirm("Are you sure you want to delete this user?")) {
      // Call delete API
      toast.info("Delete functionality to be implemented");
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box
        sx={{
          width: "100%",
          marginLeft: "18%",
          padding: "20px",
          backgroundColor: "white",
        }}
      >
        <Typography variant="h4" sx={{ mb: 3 }}>
          Users Management
        </Typography>

        {/* Search Form */}
        <Box
          component="form"
          onSubmit={handleSearchSubmit}
          sx={{ display: "flex", mb: 3, gap: 2 }}
        >
          <TextField
            label="Search Users"
            variant="outlined"
            value={searchQuery}
            onChange={handleSearch}
            sx={{ width: "300px" }}
          />
          <Button variant="contained" type="submit">
            Search
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>User ID</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>First Login</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.userId}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>{user.firstLogin ? "Yes" : "No"}</TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Edit">
                            <IconButton
                              onClick={() => handleEditUser(user._id)}
                              color="primary"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              onClick={() => handleDeleteUser(user._id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}

            {/* Total Users Count */}
            <Typography variant="body2" sx={{ mt: 2, textAlign: "right" }}>
              Total Users: {totalUsers}
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
};

export default UsersPage;
