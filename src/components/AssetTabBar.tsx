import React, { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
// import Inservice from "@/pages/user/inservice";

export default function AssetTabBar() {
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
                    aria-label="tabs"
                >
                    <Tab label="Asset Info" />
                    <Tab label="Asset Files" />
                    <Tab label="Asset Type" />
                    <Tab label="Maintenance" />
                    <Tab label=" Check-in/Check-out" />
                    <Tab label=" Installed Software" />
                    <Tab label=" Related Items" />
                </Tabs>
            </Box>
            {/* {value === 2 && <Inservice />} */}
        </Box>
    );
}
