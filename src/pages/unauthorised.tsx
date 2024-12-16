import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Box, Typography } from "@mui/material";

const unauthorizedDesign = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  textAlign: "center",
  backgroundColor: "#f0f0f0",
  color: "#333",
};
const Unauthorized: React.FC = () => {
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Get role from localStorage
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  return (
    <Box sx={unauthorizedDesign}>
      <Typography variant="h1">
        You are not authorized to view this page
      </Typography>
      <p></p>
      <Typography variant="h3">
        If you are redirected here, it may be because you need the appropriate
        permissions.
      </Typography>

      {role === "user" ? (
        <Link href="/user/dashboard">Home</Link>
      ) : role === "admin" ? (
        <Link href="/admin/dashboard">Home</Link>
      ) : (
        <Link href="/">Home</Link>
      )}
    </Box>
  );
};

export default Unauthorized;
