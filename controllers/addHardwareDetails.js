import Hardware from "../models/HardwareDetails.js";
import { StatusCodes } from "http-status-codes";
import QRCode from "qrcode";
import { nanoid } from "nanoid";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import uploadToBackblaze from "../utils/blazeUploads.js";

// Handle __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper function to parse JSON strings safely
const parseNestedJSON = (reqBody, keys) => {
  keys.forEach((key) => {
    if (reqBody[key] && typeof reqBody[key] === "string") {
      try {
        reqBody[key] = JSON.parse(reqBody[key]);
      } catch (error) {
        console.warn(`Failed to parse ${key}:`, error.message);
        reqBody[key] = {}; // Fallback to an empty object if parsing fails
      }
    }
  });
};

// Helper function for validation
const validateForm = (data) => {
  const errors = {};

  // Main form validations
  if (!data.assetName) errors.assetName = "Asset name is required.";
  if (!data.assetType) errors.assetType = "Asset type is required.";
  if (!data.condition) errors.condition = "Condition is required.";
  if (!data.price) {
    errors.price = "Price is required.";
  } else if (isNaN(Number(data.price)) || Number(data.price) <= 0) {
    errors.price = "Price must be a valid positive number.";
  }
  if (!data.warrantyDate) errors.warrantyDate = "Warranty date is required.";
  if (!data.warrantyType) errors.warrantyType = "Warranty type is required.";
  if (!data.category) errors.category = "Category is required.";
  if (!data.vendor) errors.vendor = "Vendor is required.";
  if (!data.status) errors.status = "Status is required.";
  if (!data.modelNo) errors.modelNo = "Model number is required.";
  if (!data.model) errors.model = "Model is required.";
  if (!data.description) errors.description = "Description is required.";

  // Location form validation
  if (!data.assignedTo) errors.assignedTo = "Assigned To field is required.";
  if (!data.location) errors.location = "Location is required.";
  if (!data.building) errors.building = "Building is required.";
  if (!data.room) errors.room = "Room is required.";
  if (!data.department) errors.department = "Department is required.";

  // Regular expression for validating an IPv4 address
  const ipRegex =
    /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/;

  // Computer details validation
  if (data.assetType === "Computer") {
    if (!data.computerDetails?.os)
      errors["computerDetails.os"] = "Operating System is required.";
    if (!data.computerDetails?.specificType)
      errors["computerDetails.specificType"] = "Specific Type is required.";
    if (!data.computerDetails?.processor)
      errors["computerDetails.processor"] = "Processor is required.";
    if (!data.computerDetails?.memory)
      errors["computerDetails.memory"] = "Memory is required.";
    if (!data.computerDetails?.ipAddress) {
      errors["computerDetails.ipAddress"] = "IP Address is required.";
    } else if (!ipRegex.test(data.computerDetails.ipAddress)) {
      errors["computerDetails.ipAddress"] =
        "Invalid IP Address. Example: 192.168.1.1";
    }
  }

  // Switch details validation
  if (data.assetType === "Switch") {
    if (!data.switchDetails?.os)
      errors["switchDetails.os"] = "Operating System is required.";
    if (!data.switchDetails?.osVersion)
      errors["switchDetails.osVersion"] = "OS Version is required.";
    if (!data.switchDetails?.ipAddress) {
      errors["switchDetails.ipAddress"] = "IP Address is required.";
    } else if (!ipRegex.test(data.switchDetails.ipAddress)) {
      errors["switchDetails.ipAddress"] =
        "Invalid IP Address. Example: 192.168.1.1";
    }
  }

  // Router details validation
  if (data.assetType === "Router") {
    if (!data.routerDetails?.os)
      errors["routerDetails.os"] = "Operating System is required.";
    if (!data.routerDetails?.osVersion)
      errors["routerDetails.osVersion"] = "OS Version is required.";
    if (!data.routerDetails?.ipAddress) {
      errors["routerDetails.ipAddress"] = "IP Address is required.";
    } else if (!ipRegex.test(data.routerDetails.ipAddress)) {
      errors["routerDetails.ipAddress"] =
        "Invalid IP Address. Example: 192.168.1.1";
    }
  }

  return errors;
};

const addHardwareDetails = async (req, res) => {
  parseNestedJSON(req.body, ["computerDetails", "routerDetails", "switchDetails"]);

  try {
    // 🔹 Step 1: Validate Form Data
    const errors = validateForm(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    // 🔹 Step 2: Upload Files to Backblaze
    const images = req.files?.images
      ? await uploadToBackblaze("images", req.files.images)
      : [];
    const invoices = req.files?.invoices
      ? await uploadToBackblaze("invoices", req.files.invoices)
      : [];
    const manuals = req.files?.manuals
      ? await uploadToBackblaze("manuals", req.files.manuals)
      : [];

    //  Step 3: Save Hardware Details to MongoDB
    const hardwareDetails = new Hardware({
      ...req.body,
      images,   // Save image URLs
      invoices, // Save invoice URLs
      manuals,  // Save manual URLs
    });

    const updatedHardware = await hardwareDetails.save();

    // Step 4: Generate QR Code Buffer
    const qrData = JSON.stringify({
      assetName: req.body.assetName,
      assetType: req.body.assetType,
      modelNo: req.body.modelNo,
      uniqueId: updatedHardware.uniqueId,
    });

    const qrCodeBuffer = await QRCode.toBuffer(qrData);
    const qrCodeFileName = `${nanoid()}-qrcode.png`;

    // Step 5: Upload QR Code to Backblaze
    const [qrCodeUrl] = await uploadToBackblaze("qrcodes", [
      { originalname: qrCodeFileName, buffer: qrCodeBuffer, mimetype: "image/png" },
    ]);

    //  Step 6: Update Hardware with QR Code URL
    updatedHardware.qrCode = qrCodeUrl;
    await updatedHardware.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Hardware details submitted successfully with QR Code",
      data: updatedHardware,
    });
  } catch (error) {
    console.error(" Error in addHardwareDetails:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error occurred.",
      error: error.message,
    });
  }
};

export { addHardwareDetails };

