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
const categories = ["Computer", "Switch", "Router"];
// Styling for TextFields
const textFieldStyling = {
  flex: {
    lg: "1 1 calc(33.33% - 16px)",
    xs: "1 1 calc(100% - 16px)",
    sm: "1 1 calc(100% - 16px)",
    md: "1 1 calc(50% - 16px)",
  },
  // height: "58px", // Ensure consistent height across inputs
  // ".MuiOutlinedInput-root": {
  //   height: "50px", // Apply height to outlined inputs
  // },
  // ".MuiSelect-select": {
  //   height: "55px",
  // },
};

// Interface for software details
export interface SoftwareDetails {
  name: string;
  vendor: string;
  price: number | null;
  quantity: number | null;
  category: string;
  date: string;
  licenseType: string;
  serviceSupportDate?: string; // For Perpetual License
  installedDate?: string; // For Subscription License
  expiredDate?: string; // For Subscription License
}

// Initial State
const initialSoftwareDetails: SoftwareDetails = {
  name: "",
  vendor: "",
  quantity: null,
  price: null,
  date: "",
  category: "",
  licenseType: "",
  serviceSupportDate: "",
  installedDate: "",
  expiredDate: "",
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
    if (!values.category.trim()) {
      newErrors.category = "Category is required.";
    }
    if (!values.licenseType.trim())
      newErrors.licenseType = "License type is required.";

    // Conditional Validations
    if (values.licenseType === "Perpetual" && !values.serviceSupportDate) {
      newErrors.serviceSupportDate = "Service Support Date is required.";
    }

    if (values.licenseType === "Subscription") {
      if (!values.installedDate) {
        newErrors.installedDate = "Installed Date is required.";
      }
      if (!values.expiredDate) {
        newErrors.expiredDate = "Expired Date is required.";
      }
    }

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

    setValues((prev) => {
      const updatedValues = { ...prev, [name!]: value };

      if (name === "licenseType") {
        if (value === "Perpetual") {
          updatedValues.installedDate = "";
          updatedValues.expiredDate = "";
        } else if (value === "Subscription") {
          updatedValues.serviceSupportDate = "";
        }
      }

      return updatedValues;
    });
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
            <FormControl variant="outlined" sx={textFieldStyling}>
              <InputLabel id="license-type-label">Category</InputLabel>
              <Select
                labelId="Category"
                id="category"
                name="category"
                value={values.category}
                onChange={handleChange}
                label="Category" // This explicitly links to InputLabel
                displayEmpty
              >
                {categories.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
              {errors.category && (
                <Typography variant="caption" color="error">
                  {errors.category}
                </Typography>
              )}
            </FormControl>
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
        {values.licenseType === "Perpetual" && (
          <FormSection title="Perpetual License Details">
            <StyledTextField
              label="Service Support Date"
              type="date"
              name="serviceSupportDate"
              sx={textFieldStyling}
              value={values.serviceSupportDate}
              onChange={handleChange}
              error={errors.serviceSupportDate}
              InputLabelProps={{ shrink: true }}
            />
          </FormSection>
        )}

        {values.licenseType === "Subscription" && (
          <FormSection title="Subscription License Details">
            <StyledTextField
              label="Installed Date"
              type="date"
              name="installedDate"
              sx={textFieldStyling}
              value={values.installedDate}
              onChange={handleChange}
              error={errors.installedDate}
              InputLabelProps={{ shrink: true }}
            />
            <StyledTextField
              label="Expired Date"
              type="date"
              name="expiredDate"
              sx={textFieldStyling}
              value={values.expiredDate}
              onChange={handleChange}
              error={errors.expiredDate}
              InputLabelProps={{ shrink: true }}
            />
          </FormSection>
        )}
      </form>
    </Box>
  );
};

export default SoftwareForm;
