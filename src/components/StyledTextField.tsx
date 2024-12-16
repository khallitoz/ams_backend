import React from "react";
import { TextField, TextFieldProps } from "@mui/material";

interface StyledTextFieldProps extends TextFieldProps {
  label: string;
  name: string;
  value: string | number | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean | string; // Can be a boolean or a string for the error message
  helperText?: string; // Optional custom helper text
}

const StyledTextField: React.FC<StyledTextFieldProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  helperText,
  type = "text",
  fullWidth = true,
  sx = {},
  ...props
}) => (
  <TextField
    label={label}
    name={name}
    value={value}
    onChange={onChange}
    type={type}
    error={!!error} // Convert to boolean to indicate error state
    helperText={typeof error === "string" ? error : helperText} // Show error message or custom helper text
    fullWidth={fullWidth}
    sx={{
      flex: "1 1 calc(33.33% - 16px)", // Matches the grid structure in the form
      "& .MuiInputBase-root": {
        height: "46px", // Consistent height
      },
      "& .MuiOutlinedInput-root": {
        padding: "0px",
      },
      ...sx, // Allow additional styles to be passed as props
    }}
    {...props}
  />
);

export default StyledTextField;
