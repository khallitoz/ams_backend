import * as Yup from "yup";

const ipRegex =
  /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/;

// Common nested schema for validation
const computerDetailsSchema = Yup.object({
  os: Yup.string().trim().required("Operating System is required"),
  specificType: Yup.string().trim().required("Specific Type is required"),
  processor: Yup.string().trim().required("Processor is required"),
  memory: Yup.string().trim().required("Memory is required"),
  ipAddress: Yup.string()
    .trim()
    .matches(ipRegex, "Invalid IP Address")
    .required("IP Address is required"),
});

const switchDetailsSchema = Yup.object({
  os: Yup.string().trim().required("Operating System is required"),
  osVersion: Yup.string().trim().required("OS Version is required"),
  ipAddress: Yup.string()
    .trim()
    .matches(ipRegex, "Invalid IP Address")
    .required("IP Address is required"),
});

const routerDetailsSchema = Yup.object({
  os: Yup.string().trim().required("Operating System is required"),
  osVersion: Yup.string().trim().required("OS Version is required"),
  ipAddress: Yup.string()
    .trim()
    .matches(ipRegex, "Invalid IP Address")
    .required("IP Address is required"),
});

// Main Validation Schema
export const hardwareValidationSchema = Yup.object({
  assetName: Yup.string().trim().required("Asset name is required"),
  assetType: Yup.string().trim().required("Asset type is required"),
  condition: Yup.string().trim().required("Condition is required"),
  price: Yup.number()
    .positive("Price must be positive")
    .required("Price is required"),
  warrantyDate: Yup.date().required("Warranty date is required"),
  warrantyType: Yup.string().trim().required("Warranty type is required"),
  category: Yup.string().trim().required("Category is required"),
  vendor: Yup.string().trim().required("Vendor is required"),
  status: Yup.string().trim().required("Status is required"),
  modelNo: Yup.string().trim().required("Model number is required"),
  model: Yup.string().trim().required("Model is required"),
  description: Yup.string().trim().required("Description is required"),
  assignedTo: Yup.string().trim().required("Assigned To is required"),
  location: Yup.string().trim().required("Location is required"),
  building: Yup.string().trim().required("Building is required"),
  room: Yup.string().trim().required("Room is required"),
  department: Yup.string().trim().required("Department is required"),

  // Conditional Details Validation
  computerDetails: Yup.lazy((value, context) => {
    return context.parent.assetType === "Computer"
      ? computerDetailsSchema
      : Yup.object().notRequired();
  }),

  switchDetails: Yup.lazy((value, context) => {
    return context.parent.assetType === "Switch"
      ? switchDetailsSchema
      : Yup.object().notRequired();
  }),

  routerDetails: Yup.lazy((value, context) => {
    return context.parent.assetType === "Router"
      ? routerDetailsSchema
      : Yup.object().notRequired();
  }),
});
