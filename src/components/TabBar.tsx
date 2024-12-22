import React, { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
// import Inservice from "@/pages/user/inservice";

interface TabBarProps {
  totalAssets: number;
}
const TabBar: React.FC = ({ totalAssets }) => {
  const [value, setValue] = useState<number>(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab label={`All Assets | ${totalAssets}`} />
          <Tab label="Check out Assets | 3" />
          <Tab label=" In-Service | 4" />
          <Tab label=" Inactive Assets | 0" />
        </Tabs>
      </Box>
      {/* {value === 2 && <Inservice />} */}
    </Box>
  );
};
export default TabBar;
