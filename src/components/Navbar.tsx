import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/router";
import Link from "next/link";

const navbarDesign = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: "0 16px",
  width: "100%",
  position: "fixed",
  top: 0,
  left: 0,
  zIndex: 1000,
  backgroundColor: "white",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  paddingTop: "10px",
  paddingBottom: "10px",
};

const centerNavbarDesign = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  gap: 4,
  flexGrow: 1,
};

const linkDesign = {
  textDecoration: "none", // No underline
  cursor: "pointer",
  color: "#848484", // Default link color
  "&:hover": {
    textDecoration: "none", // No underline on hover
    color: "#343434", // Hover color
  },
};

const Navbar: React.FC = () => {
  const { token, logUserOff } = useAppContext();
  const [selectedUrl, setSelectedUrl] = useState<string>("IT Assets");
  const router = useRouter();

  const logoutUser = () => {
    logUserOff();
  };

  const handleLinkClick = (url: string) => {
    // Store the selected URL in localStorage
    localStorage.setItem("selectedUrl", url);
    setSelectedUrl(url); // Update the state
  };

  useEffect(() => {
    // Check if there is a stored value in localStorage for selectedUrl
    const storedUrl = localStorage.getItem("selectedUrl");
    if (storedUrl) {
      setSelectedUrl(storedUrl);
    }
  }, []);

  return (
    <>
      {token && (
        <Box sx={navbarDesign}>
          {/* Display the selected URL */}
          <Typography variant="h5" sx={{ color: "", fontWeight: "bold" }}>
            {selectedUrl}
          </Typography>

          {/* Center Aligned Links */}
          <Box sx={centerNavbarDesign}>
            <Link href="/help-desk-it" passHref>
              <Typography
                component="a"
                sx={linkDesign}
                onClick={() => handleLinkClick("Help Desk-IT")}
              >
                Help Desk-IT
              </Typography>
            </Link>
            <Link href="/procuras" passHref>
              <Typography
                component="a"
                sx={linkDesign}
                onClick={() => handleLinkClick("Procuras")}
              >
                Procuras
              </Typography>
            </Link>
            <Link href="/user/allassets" passHref>
              <Typography
                component="a"
                sx={linkDesign}
                onClick={() => handleLinkClick("IT Assets")}
              >
                IT Assets
              </Typography>
            </Link>
            <Link href="/request-approval" passHref>
              <Typography
                component="a"
                sx={linkDesign}
                onClick={() => handleLinkClick("Request/Approval")}
              >
                Request/Approval
              </Typography>
            </Link>
          </Box>
        </Box>
      )}
    </>
  );
};

export default Navbar;
