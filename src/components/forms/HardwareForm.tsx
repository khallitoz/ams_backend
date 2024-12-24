import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Select,
  MenuItem,
  FormHelperText,
  InputLabel,
  FormControl,
  SelectChangeEvent,
} from "@mui/material";
import StyledTextField from "@/components/StyledTextField";
import {
  SwitchForm,
  ComputerDetailsForm,
  RouterDetailsForm,
} from "@/components/forms/ConditionalForms";
import FormSection from "./FormSection";
import assetTypes from "@/utils/assetTypes";
import conditions from "@/utils/conditions";
import LocationForm from "./LocationForm";
import { useAppContext } from "../../context/AppContext";
import { useRouter } from "next/router";
const textFieldStyling = {
  flex: {
    lg: "1 1 calc(33.33% - 16px)",

    xs: "1 1 calc(100% - 16px)",
    sm: "1 1 calc(100% - 16px)",
    md: "1 1 calc(50% - 16px)",
  },
};

const dropDownStyling = {
  flex: {
    lg: "1 1 calc(33.33% - 16px)",

    xs: "1 1 calc(100% - 16px)",
    sm: "1 1 calc(100% - 16px)",
    md: "1 1 calc(50% - 16px)",
  },
};
// Define interfaces for state and file uploads
interface ComputerDetails {
  os: string;
  specificType: string;
  processor: string;
  memory: string;
  ipAddress: string;
}

interface RouterDetails {
  os: string;
  osVersion: string;
  ipAddress: string;
}

interface SwitchDetails {
  os: string;
  osVersion: string;
  ipAddress: string;
}

export interface HardwareDetails {
  assetName: string;
  assetType: string;
  price: string | number;
  warrantyDate: string;
  warrantyType: string;
  assignedTo: string;
  condition: string;
  category: string;
  vendor: string;
  status: string;
  modelNo: string;
  model: string;
  description: string;
  location: string;
  building: string;
  room: string;
  department: string;
  computerDetails: ComputerDetails;
  routerDetails: RouterDetails;
  switchDetails: SwitchDetails;
}

interface FileUploads {
  images: File[];
  invoices: File[];
  manuals: File[];
}

// Initial state
const initialHardwareDetails: HardwareDetails = {
  assetName: "",
  assetType: "",
  price: "",
  warrantyDate: "",
  warrantyType: "",
  assignedTo: "",
  condition: "",
  category: "",
  vendor: "",
  status: "",
  modelNo: "",
  model: "",
  description: "",
  location: "",
  building: "",
  room: "",
  department: "",
  computerDetails: {
    os: "",
    specificType: "",
    processor: "",
    memory: "",
    ipAddress: "",
  },
  routerDetails: {
    os: "",
    osVersion: "",
    ipAddress: "",
  },
  switchDetails: {
    os: "",
    osVersion: "",
    ipAddress: "",
  },
};
interface HardwareFormProps {
  initialValues?: HardwareDetails; // Optional for new or edit mode
  onClose?: () => void; // To close the modal after submission
}

const HardwareForm: React.FC<HardwareFormProps> = ({
  initialValues = initialHardwareDetails,
  onClose,
}) => {
  const [values, setValues] = useState<HardwareDetails>({
    ...initialHardwareDetails,
    ...initialValues,
    warrantyDate: initialValues?.warrantyDate
      ? new Date(initialValues.warrantyDate).toISOString().split("T")[0]
      : "",
    computerDetails: {
      ...initialHardwareDetails.computerDetails,
      ...(initialValues?.computerDetails || {}),
    },
    routerDetails: {
      ...initialHardwareDetails.routerDetails,
      ...(initialValues?.routerDetails || {}),
    },
    switchDetails: {
      ...initialHardwareDetails.switchDetails,
      ...(initialValues?.switchDetails || {}),
    },
  });
  const router = useRouter();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [fileUploads, setFileUploads] = useState<FileUploads>({
    images: [],
    invoices: [],
    manuals: [],
  });

  const { addHardwareDetails, updateHardwareDetails } = useAppContext();

  const refreshPageWithDelay = () => {
    setTimeout(() => {
      router.reload();
    }, 2000); // 2 seconds delay
  };
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Main form validations
    if (!values.assetName) newErrors.assetName = "Asset name is required.";
    if (!values.assetType) newErrors.assetType = "Asset type is required.";
    if (!values.condition) newErrors.condition = "Condition is required.";
    if (!values.price) {
      newErrors.price = "Price is required.";
    } else if (isNaN(Number(values.price)) || Number(values.price) <= 0) {
      newErrors.price = "Price must be a valid positive number.";
    }
    if (!values.warrantyDate)
      newErrors.warrantyDate = "Warranty date is required.";
    if (!values.warrantyType)
      newErrors.warrantyType = "Warranty type is required.";
    if (!values.category) newErrors.category = "Category is required.";
    if (!values.vendor) newErrors.vendor = "Vendor is required.";
    if (!values.status) newErrors.status = "Status is required.";
    if (!values.modelNo) newErrors.modelNo = "Model number is required.";
    if (!values.model) newErrors.model = "Model is required.";
    if (!values.description) newErrors.description = "Description is required.";

    // Location form validation
    if (!values.assignedTo)
      newErrors.assignedTo = "Assigned To field is required.";
    if (!values.location) newErrors.location = "Location is required.";
    if (!values.building) newErrors.building = "Building is required.";
    if (!values.room) newErrors.room = "Room is required.";
    if (!values.department) newErrors.department = "Department is required.";

    // Regular expression for validating an IPv4 address
    const ipRegex =
      /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/;

    // Computer details validation
    if (values.assetType === "Computer") {
      if (!values.computerDetails.os)
        newErrors["computerDetails.os"] = "Operating System is required.";
      if (!values.computerDetails.specificType)
        newErrors["computerDetails.specificType"] =
          "Specific Type is required.";
      if (!values.computerDetails.processor)
        newErrors["computerDetails.processor"] = "Processor is required.";
      if (!values.computerDetails.memory)
        newErrors["computerDetails.memory"] = "Memory is required.";
      if (!values.computerDetails.ipAddress) {
        newErrors["computerDetails.ipAddress"] = "IP Address is required.";
      } else if (!ipRegex.test(values.computerDetails.ipAddress)) {
        newErrors["computerDetails.ipAddress"] =
          "Invalid IP Address. Example: 192.168.1.1";
      }
    }

    // Switch details validation
    if (values.assetType === "Switch") {
      if (!values.switchDetails.os)
        newErrors["switchDetails.os"] = "Operating System is required.";
      if (!values.switchDetails.osVersion)
        newErrors["switchDetails.osVersion"] = "OS Version is required.";
      if (!values.switchDetails.ipAddress) {
        newErrors["switchDetails.ipAddress"] = "IP Address is required.";
      } else if (!ipRegex.test(values.switchDetails.ipAddress)) {
        newErrors["switchDetails.ipAddress"] =
          "Invalid IP Address. Example: 192.168.1.1";
      }
    }

    // Router details validation
    if (values.assetType === "Router") {
      if (!values.routerDetails.os)
        newErrors["routerDetails.os"] = "Operating System is required.";
      if (!values.routerDetails.osVersion)
        newErrors["routerDetails.osVersion"] = "OS Version is required.";
      if (!values.routerDetails.ipAddress) {
        newErrors["routerDetails.ipAddress"] = "IP Address is required.";
      } else if (!ipRegex.test(values.routerDetails.ipAddress)) {
        newErrors["routerDetails.ipAddress"] =
          "Invalid IP Address. Example: 192.168.1.1";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: keyof FileUploads
  ) => {
    const files = Array.from(e.target.files || []);
    setFileUploads((prev) => ({
      ...prev,
      [type]: [...(prev[type] || []), ...files],
    }));
  };

  const resetNestedValues = () => ({
    computerDetails: {
      os: "",
      specificType: "",
      processor: "",
      memory: "",
      ipAddress: "",
    },
    routerDetails: {
      os: "",
      osVersion: "",
      ipAddress: "",
    },
    switchDetails: {
      os: "",
      osVersion: "",
      ipAddress: "",
    },
  });

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;

    // Handle nested fields with dot notation
    const keys = name.split(".");
    if (keys.length > 1) {
      setValues((prev) => {
        const firstKey = keys[0] as keyof HardwareDetails;
        const nestedObject = prev[firstKey];

        if (typeof nestedObject === "object" && nestedObject !== null) {
          return {
            ...prev,
            [firstKey]: {
              ...nestedObject,
              [keys[1]]: value,
            },
          };
        }
        return prev;
      });
    } else {
      // Handle flat fields
      setValues((prev) => {
        let updatedValues = { ...prev, [name]: value };

        if (name === "assetType") {
          updatedValues = {
            ...updatedValues,
            ...resetNestedValues(),
          };
        }

        return updatedValues;
      });
    }
  };

  const uploadRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const formData = new FormData();

    // Append all primitive fields directly
    for (const key in values) {
      const value = values[key as keyof HardwareDetails];
      if (
        typeof value === "object" &&
        !Array.isArray(value) &&
        value !== null
      ) {
        // Serialize nested objects as JSON
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    }

    // Append files
    for (const type in fileUploads) {
      fileUploads[type as keyof FileUploads].forEach((file) => {
        formData.append(type, file);
      });
    }

    try {
      let isSuccess = false;
      if (initialValues?._id) {
        isSuccess = await updateHardwareDetails(initialValues._id, formData);
        if (onClose) {
          onClose();
        }
        refreshPageWithDelay();
      } else {
        isSuccess = await addHardwareDetails(formData);
      }

      if (isSuccess) {
        setValues(initialHardwareDetails);
        setFileUploads({ images: [], invoices: [], manuals: [] });
      }
    } catch (error) {
      console.error("Error during hardware upload:", error);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <form>
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
            Add New Hardware Asset
          </Typography>
          <Button
            variant="contained"
            onClick={uploadRequest}
            sx={{ backgroundColor: "#483D8B", width: "200px" }}
          >
            {initialValues?._id ? "Update" : "Submit"}
          </Button>
        </Box>

        <FormSection title="Asset Info">
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            {/* Asset Name */}
            <StyledTextField
              label="Asset Name"
              sx={textFieldStyling}
              name="assetName"
              value={values.assetName}
              onChange={handleChange}
              error={errors.assetName}
            />
            <FormControl
              fullWidth
              error={!!errors.assetType} // Highlights the field in red if there's an error
              sx={{
                flex: "1 1 calc(33.33% - 16px)", // Consistent flexbox rules
                "& .MuiOutlinedInput-root": {
                  height: "46px", // Matches StyledTextField height
                  padding: "0px", // Ensure padding doesn't affect alignment
                },
                "& .MuiInputLabel-root": {
                  backgroundColor: "white", // Prevent overlap with the border
                  padding: "0 4px", // Add padding to give space around the label
                  transform: "translate(14px, 14px) scale(1)", // Initial position of label
                  transition: "all 0.2s ease-out", // Smooth transition for label movement
                },
                "& .Mui-focused .MuiInputLabel-root, & .MuiInputLabel-shrink": {
                  transform: "translate(14px, -6px) scale(0.75)", // Position when focused or populated
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(0, 0, 0, 0.23)", // Default border color
                },
                "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#483D8B", // Border color on focus
                },
              }}
            >
              <InputLabel>Asset Type</InputLabel>
              <Select
                name="assetType"
                value={values.assetType} // Controlled component
                onChange={handleChange} // Update state on selection change
                sx={{
                  "& .MuiSelect-select": {
                    padding: "8px", // Consistent padding with StyledTextField
                  },
                }}
              >
                {assetTypes.map((type, index) => (
                  <MenuItem key={index} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
              {errors.assetType && (
                <FormHelperText>{errors.assetType}</FormHelperText> // Show error message
              )}
            </FormControl>

            <FormControl
              fullWidth
              error={!!errors.condition} // Highlights the field in red if there's an error
              sx={{
                flex: "1 1 calc(33.33% - 16px)", // Consistent flexbox rules
                "& .MuiOutlinedInput-root": {
                  height: "46px", // Matches StyledTextField height
                  padding: "0px", // Ensure padding doesn't affect alignment
                },
                "& .MuiInputLabel-root": {
                  backgroundColor: "white", // Prevent overlap with the border
                  padding: "0 4px", // Add padding to give space around the label
                  transform: "translate(14px, 14px) scale(1)", // Initial position of label
                  transition: "all 0.2s ease-out", // Smooth transition for label movement
                },
                "& .Mui-focused .MuiInputLabel-root, & .MuiInputLabel-shrink": {
                  transform: "translate(14px, -6px) scale(0.75)", // Position when focused or populated
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(0, 0, 0, 0.23)", // Default border color
                },
                "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#483D8B", // Border color on focus
                },
              }}
            >
              <InputLabel>Condition</InputLabel>
              <Select
                name="condition"
                value={values.condition} // Controlled component
                onChange={handleChange} // Update state on selection change
                sx={{
                  "& .MuiSelect-select": {
                    padding: "8px", // Consistent padding with StyledTextField
                  },
                }}
              >
                {conditions.map((type, index) => (
                  <MenuItem key={index} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
              {errors.condition && (
                <FormHelperText>{errors.condition}</FormHelperText> // Show error message
              )}
            </FormControl>
            <StyledTextField
              label="Price"
              fullWidth
              name="price"
              sx={textFieldStyling}
              value={values.price}
              onChange={handleChange}
              error={errors.price}
            />
            <StyledTextField
              label="Warranty Date"
              type="date"
              name="warrantyDate"
              fullWidth
              sx={textFieldStyling}
              InputLabelProps={{ shrink: true }}
              value={values.warrantyDate}
              onChange={handleChange}
              error={errors.warrantyDate}
            />
            <StyledTextField
              label="Warranty Type"
              name="warrantyType"
              sx={textFieldStyling}
              value={values.warrantyType}
              onChange={handleChange}
              error={errors.warrantyType}
            />
            <StyledTextField
              label="Category"
              name="category"
              sx={textFieldStyling}
              value={values.category}
              onChange={handleChange}
              error={errors.category}
            />
            <StyledTextField
              label="Vendor"
              name="vendor"
              sx={textFieldStyling}
              value={values.vendor}
              onChange={handleChange}
              error={errors.vendor}
            />
            <StyledTextField
              label="Status"
              name="status"
              sx={textFieldStyling}
              value={values.status}
              onChange={handleChange}
              error={errors.status}
            />
            <StyledTextField
              label="Model Number"
              name="modelNo"
              sx={textFieldStyling}
              value={values.modelNo}
              onChange={handleChange}
              error={errors.modelNo}
            />
            <StyledTextField
              label="Model"
              name="model"
              sx={textFieldStyling}
              value={values.model}
              onChange={handleChange}
              error={errors.model}
            />
            <StyledTextField
              label="Description"
              name="description"
              sx={textFieldStyling}
              value={values.description}
              onChange={handleChange}
              error={errors.description}
            />
            <Box sx={textFieldStyling}>
              <Typography>Images</Typography>
              <input
                type="file"
                multiple
                onChange={(e) => handleImageChange(e, "images")}
              />
            </Box>

            <Box sx={textFieldStyling}>
              <Typography>Invoice</Typography>
              <input
                type="file"
                multiple
                onChange={(e) => handleImageChange(e, "invoices")}
              />
            </Box>

            <Box sx={textFieldStyling}>
              <Typography>User Manual</Typography>
              <input
                type="file"
                multiple
                onChange={(e) => handleImageChange(e, "manuals")}
              />
            </Box>
          </Box>
        </FormSection>

        <LocationForm
          values={values}
          handleChange={handleChange}
          errors={errors}
        />

        {values.assetType === "Computer" && (
          <ComputerDetailsForm
            values={values}
            handleChange={handleChange}
            errors={errors}
          />
        )}

        {values.assetType === "Switch" && (
          <SwitchForm
            values={values}
            handleChange={handleChange}
            errors={errors}
          />
        )}

        {values.assetType === "Router" && (
          <RouterDetailsForm
            values={values}
            handleChange={handleChange}
            errors={errors}
          />
        )}
      </form>
    </Box>
  );
};

export default HardwareForm;
