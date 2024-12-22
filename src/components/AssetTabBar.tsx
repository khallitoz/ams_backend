import React, { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import AssetInfo from "./singleasset/AssetInfo";
import AssetFiles from "./singleasset/AssetFiles";
import Status from "./singleasset/Status";

export default function AssetTabBar() {
  const [value, setValue] = useState<number>(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <>
      {/* Asset Tab Bar */}
      <Box>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="Asset Tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Asset Info" />
            <Tab label="Asset Files" />
            <Tab label="Maintenance" />
            <Tab label="Check-in/Check-out" />
            <Tab label="Installed Software" />
            <Tab label="Related Items" />
          </Tabs>
        </Box>
        {value === 0 && <AssetInfo />}
        {value === 1 && <AssetFiles />}
        {value === 3 && <Status />}
      </Box>
    </>
  );
}
