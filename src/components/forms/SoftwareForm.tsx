import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import StyledTextField from "@/components/StyledTextField";

import FormSection from "./FormSection";
import { useAppContext } from "../../context/AppContext";
import { useRouter } from "next/router";

const licenseOptions = ["Perpetual", "Subscription"];

// Styling for TextFields
const textFieldStyling = {
  flex: {
    lg: "1 1 calc(33.33% - 16px)",
    xs: "1 1 calc(100% - 16px)",
    sm: "1 1 calc(100% - 16px)",
    md: "1 1 calc(50% - 16px)",
  },
};

// Interface for software details
export interface SoftwareDetails {
  name: string;
  vendor: string;
  price: number | null;
  quantity: number | null;
  date: string;
  licenseType: string;
}

// Initial State
const initialSoftwareDetails: SoftwareDetails = {
  name: "",
  vendor: "",
  quantity: null,
  price: null,
  date: "",
  licenseType: "",
};

// Props Interface
interface SoftwareFormProps {
  initialValues?: SoftwareDetails; // Optional for edit mode
  onClose?: () => void; // To close the modal after submission
}

const SoftwareForm: React.FC<SoftwareFormProps> = ({
  initialValues = initialSoftwareDetails,
  onClose,
}) => {
  const [values, setValues] = useState<SoftwareDetails>({
    ...initialSoftwareDetails,
    ...initialValues,
    date: initialValues?.date
      ? new Date(initialValues.date).toISOString().split("T")[0]
      : "",
  });

  const router = useRouter();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { addSofwareDetails, updateSoftwareDetails } = useAppContext();

  /**
   * Refresh the page after a slight delay.
   */
  const refreshPageWithDelay = () => {
    setTimeout(() => {
      router.reload();
    }, 1200); // 1.2 seconds delay
  };

  /**
   * Validate the form fields.
   */
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!values.name.trim()) newErrors.name = "Software name is required.";
    if (!values.vendor.trim()) newErrors.vendor = "Vendor is required.";

    if (!values.quantity || values.quantity <= 0) {
      newErrors.quantity = "Quantity must be a valid positive number.";
    }

    if (!values.price || values.price <= 0) {
      newErrors.price = "Price must be a valid positive number.";
    }

    if (!values.date.trim()) {
      newErrors.date = "Date is required.";
    }
    if (!values.licenseType.trim())
      newErrors.licenseType = "License name is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle input changes dynamically.
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handle form submission.
   */
  const uploadRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      let isSuccess = false;

      if (initialValues?._id) {
        isSuccess = await updateSoftwareDetails(initialValues._id, values);
        if (isSuccess && onClose) {
          onClose();
          refreshPageWithDelay();
        }
      } else {
        isSuccess = await addSofwareDetails(values);
      }

      if (isSuccess) {
        setValues(initialSoftwareDetails);
      }
    } catch (error) {
      console.error("Error during software upload:", error);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <form onSubmit={uploadRequest}>
        {/* Header Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            padding: "20px 0",
            marginTop: "30px",
          }}
        >
          <Typography
            variant="h5"
            sx={{ marginBottom: "20px", fontWeight: "bold" }}
          >
            {initialValues?._id
              ? "Update Software Asset"
              : "Add New Software Asset"}
          </Typography>
          <Button
            type="submit"
            variant="contained"
            sx={{ backgroundColor: "#483D8B", width: "200px" }}
          >
            {initialValues?._id ? "Update" : "Submit"}
          </Button>
        </Box>

        {/* Form Fields Section */}
        <FormSection title="Software Info">
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            {/* Software */}
            <StyledTextField
              label="Software"
              sx={textFieldStyling}
              name="name"
              value={values.name}
              onChange={handleChange}
              error={errors.name}
            />

            {/* Vendor */}
            <StyledTextField
              label="Vendor"
              sx={textFieldStyling}
              name="vendor"
              value={values.vendor}
              onChange={handleChange}
              error={errors.vendor}
            />

            <FormControl variant="outlined" sx={textFieldStyling}>
              <InputLabel id="license-type-label">License Type</InputLabel>
              <Select
                labelId="license-type-label"
                id="licenseType"
                name="licenseType"
                value={values.licenseType}
                onChange={handleChange}
                label="License Type" // This explicitly links to InputLabel
                displayEmpty
              >
                {licenseOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
              {errors.licenseType && (
                <Typography variant="caption" color="error">
                  {errors.licenseType}
                </Typography>
              )}
            </FormControl>

            {/* Quantity */}
            <StyledTextField
              label="Quantity"
              fullWidth
              name="quantity"
              type="number"
              sx={textFieldStyling}
              value={values.quantity ?? ""}
              onChange={handleChange}
              error={errors.quantity}
            />

            {/* Price */}
            <StyledTextField
              label="Unit Price"
              fullWidth
              name="price"
              type="number"
              sx={textFieldStyling}
              value={values.price ?? ""}
              onChange={handleChange}
              error={errors.price}
            />

            {/* Date */}
            <StyledTextField
              label="Date Purchased"
              type="date"
              name="date"
              fullWidth
              sx={textFieldStyling}
              InputLabelProps={{ shrink: true }}
              value={values.date}
              onChange={handleChange}
              error={errors.date}
            />
          </Box>
        </FormSection>
      </form>
    </Box>
  );
};

export default SoftwareForm;
