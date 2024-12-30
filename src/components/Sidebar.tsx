import React from "react";
import Link from "next/link";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import WysiwygIcon from "@mui/icons-material/Wysiwyg";
import ComputerIcon from "@mui/icons-material/Computer";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WebhookIcon from "@mui/icons-material/Webhook";

const sidebarStyles = {
  container: {
    width: "18%",
    height: "100vh",
    background: "#666666", // Sidebar Background Color
    color: "white",
    position: "fixed",
    top: "55px",
    left: 0,
    display: "flex",
    flexDirection: "column",
    boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
    padding: "20px",
    overflowY: "auto",
  },
  link: {
    textDecoration: "none",
    color: "white",
    "&:hover": {
      color: "#FFD700", // Hover Text Color (Gold)
    },
  },
  listItem: {
    borderRadius: "4px",
    margin: "0", // Removed unnecessary margin
    padding: "8px 12px", // Controlled padding
    "&:hover": {
      backgroundColor: "#483D8B", // Hover Background Color (Light Purple)
    },
  },
  sectionHeader: {
    marginTop: "8px", // Slight spacing above
    marginBottom: "4px", // Slight spacing below
  },
  nested: {
    paddingLeft: "40px", // Indentation for children
    paddingTop: "4px",
    paddingBottom: "4px",
    "&:hover": {
      backgroundColor: "#483D8B", // Hover Background Color (Light Purple)
    },
  },
};

const Sidebar = () => {
  const [openAssets, setOpenAssets] = React.useState(true);

  const handleAssetsClick = () => {
    setOpenAssets(!openAssets);
  };

  return (
    <Box sx={sidebarStyles.container}>
      {/* Dashboard Link */}
      <Link href="/user/dashboard" style={sidebarStyles.link}>
        <ListItemButton sx={sidebarStyles.listItem}>
          <ListItemIcon>
            <DashboardIcon sx={{ color: "white" }} />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>
      </Link>

      {/* Assets Section */}
      <Box sx={sidebarStyles.sectionHeader}>
        <ListItemButton onClick={handleAssetsClick} sx={sidebarStyles.listItem}>
          <ListItemIcon>
            <InventoryIcon sx={{ color: "white" }} />
          </ListItemIcon>
          <ListItemText primary="Assets" />
          {openAssets ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemButton>
      </Box>

      {/* Assets Children */}
      <Collapse in={openAssets} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {/* All Assets */}
          <Link href="/user/allassets" style={sidebarStyles.link}>
            <ListItemButton sx={sidebarStyles.nested}>
              <ListItemIcon>
                <WysiwygIcon sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary="Hard Assets" />
            </ListItemButton>
          </Link>

          {/* New Asset */}
          <Link href="/user/addhardwareasset" style={sidebarStyles.link}>
            <ListItemButton sx={sidebarStyles.nested}>
              <ListItemIcon>
                <ComputerIcon sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary="New Hardware" />
            </ListItemButton>
          </Link>

          {/* Software Assets */}
          <Link href="/user/addsoftwareassets" style={sidebarStyles.link}>
            <ListItemButton sx={sidebarStyles.nested}>
              <ListItemIcon>
                <WebhookIcon sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary="Add Software" />
            </ListItemButton>
          </Link>
        </List>
      </Collapse>
    </Box>
  );
};

export default Sidebar;
