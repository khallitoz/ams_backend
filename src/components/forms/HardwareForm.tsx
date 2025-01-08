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
  ComputerDetailsForm,
  NetworkForm,
} from "@/components/forms/ConditionalForms";
import FormSection from "./FormSection";
import assetTypes from "@/utils/assetTypes";
import conditions from "@/utils/conditions";
import LocationForm from "./LocationForm";
import { useAppContext } from "../../context/AppContext";
import { useRouter } from "next/router";
import FileUploadField from "./FileUploadField";
import assetTypeCategories from "@/utils/assetTypeCategories";
import { validateHardwareForm } from "../validations/hardwareFormValidation";
const textFieldStyling = {
  flex: {
    lg: "1 1 calc(33.33% - 16px)",

    xs: "1 1 calc(100% - 16px)",
    sm: "1 1 calc(100% - 16px)",
    md: "1 1 calc(50% - 16px)",
  },
};

const dropDownStyling = {
  flex: "1 1 calc(33.33% - 16px)",
  "& .MuiOutlinedInput-root": {
    height: "46px",
    padding: "0px",
  },
  "& .MuiInputLabel-root": {
    backgroundColor: "white",
    padding: "0 4px",
    transform: "translate(14px, 14px) scale(1)",
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

interface NetworkInfo {
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
  serialNo: string;
  modelNo: string;
  model: string;
  description: string;
  location: string;
  building: string;
  room: string;
  department: string;
  computerDetails: ComputerDetails;
  routerDetails: RouterDetails;
  networkDevice: NetworkInfo;
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
  serialNo: "",
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
  networkDevice: {
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
    networkDevice: {
      ...initialHardwareDetails.networkDevice,
      ...(initialValues?.networkDevice || {}),
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
    }, 1200); // 2 seconds delay
  };

  const handleFileUpload = (
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
    networkDevice: {
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
            category: "",
            ...resetNestedValues(),
          };
        }

        return updatedValues;
      });
    }
  };

  const uploadRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateHardwareForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors); // Use React state to store errors
      return;
    }

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
        if (isSuccess) {
          if (onClose) {
            onClose();
            refreshPageWithDelay();
          }
        }
      } else {
        isSuccess = await addHardwareDetails(formData);
      }

      if (isSuccess) {
        setValues(initialHardwareDetails);

        setFileUploads({ images: [], invoices: [], manuals: [] });
        setErrors({});
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach((input) => {
          (input as HTMLInputElement).value = "";
        });
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
            {initialValues?._id
              ? "Update Hardware Asset"
              : "Add New Hardware Asset"}
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
              error={!!errors.assetType}
              sx={dropDownStyling}
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

            {/* Category Field */}
            {values.assetType === "Other" ? (
              <StyledTextField
                label="Category"
                name="category"
                sx={textFieldStyling}
                value={values.category}
                onChange={handleChange}
                error={errors.category}
              />
            ) : (
              <FormControl
                fullWidth
                error={!!errors.category}
                sx={dropDownStyling}
                disabled={!values.assetType}
              >
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={values.category}
                  onChange={handleChange}
                  sx={{ "& .MuiSelect-select": { padding: "8px" } }}
                >
                  {values.assetType &&
                    assetTypeCategories[values.assetType]?.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                </Select>
                {errors.category && (
                  <FormHelperText>{errors.category}</FormHelperText>
                )}
              </FormControl>
            )}

            <FormControl
              fullWidth
              error={!!errors.condition}
              sx={dropDownStyling}
            >
              <InputLabel>Condition</InputLabel>
              <Select
                name="condition"
                value={values.condition}
                onChange={handleChange}
                sx={{
                  "& .MuiSelect-select": {
                    padding: "8px",
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
              label="Vendor"
              name="vendor"
              sx={textFieldStyling}
              value={values.vendor}
              onChange={handleChange}
              error={errors.vendor}
            />
            <StyledTextField
              label="Serial Number"
              name="serialNo"
              sx={textFieldStyling}
              value={values.serialNo}
              onChange={handleChange}
              error={errors.serialNo}
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
              <FileUploadField
                label="Upload Images"
                type="images"
                fileUploads={fileUploads}
                setFileUploads={setFileUploads}
              />
            </Box>

            <Box sx={textFieldStyling}>
              <FileUploadField
                label="Upload pdf"
                type="invoices"
                fileUploads={fileUploads}
                setFileUploads={setFileUploads}
              />
            </Box>

            <Box sx={textFieldStyling}>
              <FileUploadField
                label="Upload manuals"
                type="manuals"
                fileUploads={fileUploads}
                setFileUploads={setFileUploads}
              />
            </Box>
          </Box>
        </FormSection>

        <LocationForm
          values={values}
          handleChange={handleChange}
          errors={errors}
        />

        {values.assetType === "Computer" && values.category !== "Monitor" && (
          <ComputerDetailsForm
            values={values}
            handleChange={handleChange}
            errors={errors}
          />
        )}

        {values.assetType === "Network" && (
          <NetworkForm
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
