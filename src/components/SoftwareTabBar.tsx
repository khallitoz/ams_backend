import React, { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import SoftwareAssetInfo from "./softwareAsset/SoftwareAssetInfo";
import AssociatedHardware from "./softwareAsset/AssociatedHardware";
import BulkInstallation from "./softwareAsset/BulkInstallation";
import SoftwareTickets from "./softwareAsset/SoftwareTickets";

export default function SoftwareTabBar() {
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
            <Tab label="Software Info" />
            <Tab label="Associated Hardware Devices" />
            <Tab label="Bulk Installation" />
            <Tab label="Software Tickets" />
          </Tabs>
        </Box>
        {value === 0 && <SoftwareAssetInfo />}
        {value === 1 && <AssociatedHardware />}
        {value === 2 && <BulkInstallation />}
        {value === 3 && <SoftwareTickets />}
      </Box>
    </>
  );
}
