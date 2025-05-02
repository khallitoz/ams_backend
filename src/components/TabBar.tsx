import React, { useState, useEffect } from "react";
import { Box, Tabs, Tab, CircularProgress, Typography } from "@mui/material";
import CheckOutAssets from "./allassets/CheckOutAssets";
import CheckInAssets from "./allassets/CheckInAssets";
import AllAssets from "./allassets/AllAssets";
import InActive from "./allassets/InActive";
import { useAppContext } from "../context/AppContext";

const TabBar: React.FC = () => {
  const { getTabBarCounter } = useAppContext();
  const [value, setValue] = useState<number>(0);
  const [counterValues, setCounterValues] = useState<{
    Total: number;
    "Check In": number;
    InActive: number;
    "Check Out": number;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  // Fetch counter values
  const getCounters = async () => {
    try {
      setLoading(true);
      const response = await getTabBarCounter();
      const info = response.data;

      setCounterValues({
        Total: info.Total || 0,
        "Check In": info["Check In"] || 0,
        InActive: info["InActive"] || 0,
        "Check Out": info["Check Out"] || 0,
      });
    } catch (error) {
      console.error("Failed to fetch counter values:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCounters();
  }, []);

  // Helper function to render styled counters
  const renderTabLabel = (label: string, count: number | string) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Typography>{label}</Typography>
      <Box
        sx={{
          backgroundColor: "#483D8B",
          color: "white",
          borderRadius: "50%",
          padding: "4px 10px",
          fontSize: "16px",
          fontWeight: "bold",
          textAlign: "center",
          minWidth: "28px",
        }}
      >
        {loading ? "..." : count}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ width: "100%" }}>
      {/* Tabs Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="Asset Tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          {/* Dynamic Counters in Tabs */}
          <Tab
            label={renderTabLabel("All Assets", counterValues?.Total ?? 0)}
          />
          <Tab
            label={renderTabLabel(
              "Check Out Assets",
              counterValues?.["Check Out"] ?? 0
            )}
          />
          <Tab
            label={renderTabLabel(
              "Check In Assets",
              counterValues?.["Check In"] ?? 0
            )}
          />
          <Tab
            label={renderTabLabel(
              "Inactive Assets",
              counterValues?.["InActive"] ?? 0
            )}
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {value === 0 && <AllAssets />}
            {value === 1 && <CheckOutAssets />}
            {value === 2 && <CheckInAssets />}
            {value === 3 && <InActive />}
          </>
        )}
      </Box>
    </Box>
  );
};

export default TabBar;
