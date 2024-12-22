import { Box } from "@mui/material";
import React from "react";

const ImageDownload = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        marginTop: "100px",
      }}
    >
      <Box sx={{ width: "20%", height: "100vh", backgroundColor: "red" }}>
        hello
      </Box>
      <Box
        sx={{
          width: "80%",
          height: "100vh",
          backgroundColor: "green",
        }}
      >
        hello
      </Box>
    </Box>
  );
};

export default ImageDownload;
