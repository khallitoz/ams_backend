import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import { useState } from "react";

const Navbar = () => {
  const [productAnchor, setProductAnchor] = useState(null);
  const [jobsAnchor, setJobsAnchor] = useState(null);

  // Handle Product menu
  const handleProductClick = (event) => {
    setProductAnchor(event.currentTarget);
  };
  const handleProductClose = () => {
    setProductAnchor(null);
  };

  // Handle Jobs menu
  const handleJobsClick = (event) => {
    setJobsAnchor(event.currentTarget);
  };
  const handleJobsClose = () => {
    setJobsAnchor(null);
  };

  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Logo */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: "#3B007F",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span
            style={{ fontWeight: "900", marginRight: "8px", color: "#FF8C00" }}
          >
            B
          </span>{" "}
          Belzir
        </Typography>

        {/* Menu */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Typography
            variant="body1"
            sx={{ cursor: "pointer", color: "#FF8C00" }}
          >
            Home
          </Typography>

          {/* Product Dropdown */}
          <Typography
            variant="body1"
            onClick={handleProductClick}
            sx={{ cursor: "pointer", position: "relative" }}
          >
            Product ▼
          </Typography>
          <Menu
            anchorEl={productAnchor}
            open={Boolean(productAnchor)}
            onClose={handleProductClose}
          >
            <MenuItem onClick={handleProductClose}>Product 1</MenuItem>
            <MenuItem onClick={handleProductClose}>Product 2</MenuItem>
          </Menu>

          {/* Pricing */}
          <Typography variant="body1" sx={{ cursor: "pointer" }}>
            Pricing
          </Typography>

          {/* About Us */}
          <Typography variant="body1" sx={{ cursor: "pointer" }}>
            About Us
          </Typography>

          {/* Jobs Dropdown */}
          <Typography
            variant="body1"
            onClick={handleJobsClick}
            sx={{ cursor: "pointer", position: "relative", color: "#FF8C00" }}
          >
            Jobs at Belzir ▼
          </Typography>
          <Menu
            anchorEl={jobsAnchor}
            open={Boolean(jobsAnchor)}
            onClose={handleJobsClose}
          >
            <MenuItem onClick={handleJobsClose}>Job 1</MenuItem>
            <MenuItem onClick={handleJobsClose}>Job 2</MenuItem>
          </Menu>
        </Box>

        {/* Book Your Demo Button */}
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#FF8C00",
            color: "#FFFFFF",
            "&:hover": { backgroundColor: "#e67900" },
          }}
        >
          Book Your Demo
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
