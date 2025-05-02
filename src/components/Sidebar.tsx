import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
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
import AddIcon from "@mui/icons-material/Add";
import InstallDesktopIcon from "@mui/icons-material/InstallDesktop";
import BuildIcon from "@mui/icons-material/Build";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";

const sidebarStyles = {
  container: {
    width: "240px",
    height: "100vh",
    background: "#5a5588",
    color: "white",
    position: "fixed",
    top: "64px",
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
      color: "white", // Keeping white for better contrast
    },
  },
  listItem: {
    borderRadius: "4px",
    margin: "0",
    padding: "8px 12px",
    "&:hover": {
      backgroundColor: "#6d6799",
    },
  },
  activeItem: {
    backgroundColor: "#6d6799",
    borderRadius: "4px",
    margin: "0",
    padding: "8px 12px",
  },
  sectionHeader: {
    marginTop: "8px",
    marginBottom: "4px",
  },
  nested: {
    paddingLeft: "40px",
    paddingTop: "4px",
    paddingBottom: "4px",
    "&:hover": {
      backgroundColor: "#6d6799",
    },
  },
  activeNested: {
    paddingLeft: "40px",
    paddingTop: "4px",
    paddingBottom: "4px",
    backgroundColor: "#6d6799",
  },
};

const Sidebar = () => {
  const router = useRouter();
  const path = router.pathname;

  // Check which section the current path belongs to
  const isAddAssetsPath =
    path.includes("/addhardwareasset") ||
    path.includes("/addsoftwareassets") ||
    path.includes("/bulkinstallations") ||
    path.includes("/bulkmaintanance");

  const isViewAssetsPath =
    path.includes("/allassets") ||
    path.includes("/softwareassets") ||
    path.includes("/allmaintenance");

  const isUsersPath = path.includes("/users");
  const isDevicesPath = path.includes("/devices");
  const isCustomisationPath = path.includes("/customisation");
  // Set initial state based on current path
  const [openAssets, setOpenAssets] = React.useState(isAddAssetsPath);
  const [viewAssets, setViewAssets] = React.useState(isViewAssetsPath);
  const [openUsers, setOpenUsers] = React.useState(isUsersPath);
  const [openDevices, setOpenDevices] = React.useState(isDevicesPath);
  const [openCustomisation, setOpenCustomisation] =
    React.useState(isCustomisationPath);
  // Update state when path changes
  useEffect(() => {
    if (isAddAssetsPath) setOpenAssets(true);
    if (isViewAssetsPath) setViewAssets(true);
    if (isUsersPath) setOpenUsers(true);
    if (isDevicesPath) setOpenDevices(true);
  }, [path, isAddAssetsPath, isViewAssetsPath, isUsersPath, isDevicesPath]);

  const handleAssetsClick = () => {
    setOpenAssets(!openAssets);
  };

  const handleViewAssets = () => {
    setViewAssets(!viewAssets);
  };

  const handleUsersClick = () => {
    setOpenUsers(!openUsers);
  };

  const handleDevicesClick = () => {
    setOpenDevices(!openDevices);
  };

  const handleCustomisationClick = () => {
    setOpenCustomisation(!openCustomisation);
  };

  return (
    <Box sx={sidebarStyles.container}>
      {/* Dashboard Link */}
      <Link href="/user/dashboard" style={sidebarStyles.link}>
        <ListItemButton
          sx={
            path === "/user/dashboard"
              ? sidebarStyles.activeItem
              : sidebarStyles.listItem
          }
        >
          <ListItemIcon>
            <DashboardIcon sx={{ color: "white" }} />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>
      </Link>

      {/* Add Assets Section */}
      <Box sx={sidebarStyles.sectionHeader}>
        <ListItemButton
          onClick={handleAssetsClick}
          sx={
            isAddAssetsPath ? sidebarStyles.activeItem : sidebarStyles.listItem
          }
        >
          <ListItemIcon>
            <AddIcon sx={{ color: "white" }} />
          </ListItemIcon>
          <ListItemText primary="Add Assets" />
          {openAssets ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemButton>
      </Box>

      {/* Assets Children */}
      <Collapse in={openAssets} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {/* New Asset */}
          <Link href="/user/addhardwareasset" style={sidebarStyles.link}>
            <ListItemButton
              sx={
                path.includes("/addhardwareasset")
                  ? sidebarStyles.activeNested
                  : sidebarStyles.nested
              }
            >
              <ListItemIcon>
                <ComputerIcon sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary="Hardwares" />
            </ListItemButton>
          </Link>

          {/* Software Assets */}
          <Link href="/user/addsoftwareassets" style={sidebarStyles.link}>
            <ListItemButton
              sx={
                path.includes("/addsoftwareassets")
                  ? sidebarStyles.activeNested
                  : sidebarStyles.nested
              }
            >
              <ListItemIcon>
                <WebhookIcon sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary="Softwares " />
            </ListItemButton>
          </Link>
          {/* Bulk Instalations */}
          <Link href="/user/bulkinstallations" style={sidebarStyles.link}>
            <ListItemButton
              sx={
                path.includes("/bulkinstallations")
                  ? sidebarStyles.activeNested
                  : sidebarStyles.nested
              }
            >
              <ListItemIcon>
                <InstallDesktopIcon sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary="Installations" />
            </ListItemButton>
          </Link>

          {/* Bulk Maintenance */}
          <Link href="/user/bulkmaintanance" style={sidebarStyles.link}>
            <ListItemButton
              sx={
                path.includes("/bulkmaintanance")
                  ? sidebarStyles.activeNested
                  : sidebarStyles.nested
              }
            >
              <ListItemIcon>
                <BuildIcon sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary="Maintenance" />
            </ListItemButton>
          </Link>
        </List>
      </Collapse>

      {/* Assets Section */}
      <Box sx={sidebarStyles.sectionHeader}>
        <ListItemButton
          onClick={handleViewAssets}
          sx={
            isViewAssetsPath ? sidebarStyles.activeItem : sidebarStyles.listItem
          }
        >
          <ListItemIcon>
            <WysiwygIcon sx={{ color: "white" }} />
          </ListItemIcon>
          <ListItemText primary="View Assets" />
          {viewAssets ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemButton>
      </Box>

      {/* View Assets Children */}
      <Collapse in={viewAssets} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {/* All Assets */}
          <Link href="/user/allassets" style={sidebarStyles.link}>
            <ListItemButton
              sx={
                path.includes("/allassets")
                  ? sidebarStyles.activeNested
                  : sidebarStyles.nested
              }
            >
              <ListItemIcon>
                <ComputerIcon sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary="Hardwares" />
            </ListItemButton>
          </Link>
        </List>
        <List component="div" disablePadding>
          {/* All Assets */}
          <Link href="/user/softwareassets" style={sidebarStyles.link}>
            <ListItemButton
              sx={
                path.includes("/softwareassets")
                  ? sidebarStyles.activeNested
                  : sidebarStyles.nested
              }
            >
              <ListItemIcon>
                <WebhookIcon sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary="Softwares" />
            </ListItemButton>
          </Link>
          <Link href="/user/allmaintenance" style={sidebarStyles.link}>
            <ListItemButton
              sx={
                path.includes("/allmaintenance")
                  ? sidebarStyles.activeNested
                  : sidebarStyles.nested
              }
            >
              <ListItemIcon>
                <BuildIcon sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary="Maintenance" />
            </ListItemButton>
          </Link>
        </List>
      </Collapse>

      {/* Users Management Section */}
      <Box sx={sidebarStyles.sectionHeader}>
        <ListItemButton
          onClick={handleUsersClick}
          sx={isUsersPath ? sidebarStyles.activeItem : sidebarStyles.listItem}
        >
          <ListItemIcon>
            <PeopleIcon sx={{ color: "white" }} />
          </ListItemIcon>
          <ListItemText primary="Users Management" />
          {openUsers ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemButton>
      </Box>

      {/* Users Children */}
      <Collapse in={openUsers} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <Link href="/user/users" style={sidebarStyles.link}>
            <ListItemButton
              sx={
                path.includes("/user/users")
                  ? sidebarStyles.activeNested
                  : sidebarStyles.nested
              }
            >
              <ListItemIcon>
                <PeopleIcon sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary="All Users" />
            </ListItemButton>
          </Link>
        </List>
      </Collapse>

      {/* Devices Section */}
      <Box sx={sidebarStyles.sectionHeader}>
        <ListItemButton
          onClick={handleDevicesClick}
          sx={isDevicesPath ? sidebarStyles.activeItem : sidebarStyles.listItem}
        >
          <ListItemIcon>
            <PeopleIcon sx={{ color: "white" }} />
          </ListItemIcon>
          <ListItemText primary="Devices" />
          {openDevices ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemButton>
      </Box>

      {/* Devices Children */}
      <Collapse in={openDevices} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <Link href="/user/devices" style={sidebarStyles.link}>
            <ListItemButton
              sx={
                path.includes("/user/devices")
                  ? sidebarStyles.activeNested
                  : sidebarStyles.nested
              }
            >
              <ListItemIcon>
                <PeopleIcon sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary="All Devices" />
            </ListItemButton>
          </Link>
        </List>
      </Collapse>

      {/* Customisation Section */}
      <Box sx={sidebarStyles.sectionHeader}>
        <ListItemButton
          onClick={handleCustomisationClick}
          sx={
            isCustomisationPath
              ? sidebarStyles.activeItem
              : sidebarStyles.listItem
          }
        >
          <ListItemIcon>
            <SettingsIcon sx={{ color: "white" }} />
          </ListItemIcon>
          <ListItemText primary="Customisation" />
          {openCustomisation ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemButton>
      </Box>

      {/* Customisation Children */}
      <Collapse in={openCustomisation} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <Link href="/user/departments" style={sidebarStyles.link}>
            <ListItemButton
              sx={
                path.includes("/user/adddepartments")
                  ? sidebarStyles.activeNested
                  : sidebarStyles.nested
              }
            >
              <ListItemIcon>
                <SettingsIcon sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary="Add Departments" />
            </ListItemButton>
          </Link>
          <Link href="/user/locations" style={sidebarStyles.link}>
            <ListItemButton
              sx={
                path.includes("/user/addlocations")
                  ? sidebarStyles.activeNested
                  : sidebarStyles.nested
              }
            >
              <ListItemIcon>
                <SettingsIcon sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary="Add Locations" />
            </ListItemButton>
          </Link>
          <Link href="/user/employees" style={sidebarStyles.link}>
            <ListItemButton
              sx={
                path.includes("/user/addemployees")
                  ? sidebarStyles.activeNested
                  : sidebarStyles.nested
              }
            >
              <ListItemIcon>
                <SettingsIcon sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary="Add Employees" />
            </ListItemButton>
          </Link>
          <Link href="/user/assettypes" style={sidebarStyles.link}>
            <ListItemButton
              sx={
                path.includes("/user/addassettypes")
                  ? sidebarStyles.activeNested
                  : sidebarStyles.nested
              }
            >
              <ListItemIcon>
                <SettingsIcon sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary="Add Asset Types" />
            </ListItemButton>
          </Link>
        </List>
      </Collapse>
    </Box>
  );
};

export default Sidebar;
