import React, { useState } from "react";
import { Box, Typography, Button, IconButton, Chip } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";

// Define file upload types
interface FileUploads {
  images: File[];
  invoices: File[];
  manuals: File[];
}

interface FileUploadProps {
  label: string;
  type: keyof FileUploads;
  fileUploads: FileUploads;
  setFileUploads: React.Dispatch<React.SetStateAction<FileUploads>>;
}

const FileUploadField: React.FC<FileUploadProps> = ({
  label,
  type,
  fileUploads,
  setFileUploads,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFileUploads((prev) => ({
      ...prev,
      [type]: [...(prev[type] || []), ...files],
    }));
  };

  const handleRemoveFile = (index: number) => {
    setFileUploads((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  return (
    <Box
      sx={{
        border: "2px dashed #483D8B",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        marginBottom: "16px",
        position: "relative",
        backgroundColor: "#F9F9FF",
      }}
    >
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        style={{
          display: "none",
        }}
        id={`file-upload-${type}`}
      />
      <label htmlFor={`file-upload-${type}`}>
        <Box
          sx={{
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 50, color: "#483D8B" }} />
          <Typography
            variant="body1"
            sx={{ marginTop: "8px", color: "#483D8B" }}
          >
            {label}
          </Typography>
        </Box>
      </label>
      {/* Display selected files */}
      <Box
        sx={{
          marginTop: "12px",
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          justifyContent: "center",
        }}
      >
        {fileUploads[type].map((file, index) => (
          <Chip
            key={index}
            label={file.name}
            onDelete={() => handleRemoveFile(index)}
            deleteIcon={<DeleteIcon />}
            sx={{ backgroundColor: "#D6BBFB", color: "#4A235A" }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default FileUploadField;
