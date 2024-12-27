import Hardware from "../models/HardwareDetails.js";
import { StatusCodes } from "http-status-codes";
import QRCode from "qrcode";
import { nanoid } from "nanoid";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

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

const updateHardware = async (req, res) => {
  const { id } = req.params;

  // Parse nested JSON fields
  parseNestedJSON(req.body, [
    "computerDetails",
    "routerDetails",
    "switchDetails",
  ]);

  try {
    if (!id) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Hardware ID is required for updating.",
      });
    }
    const errors = validateForm(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    // Validate if the hardware exists
    const existingHardware = await Hardware.findById(id);
    if (!existingHardware) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Hardware with the specified ID not found.",
      });
    }

    // Destructure fields from the request body
    const {
      assetName,
      assetType,
      price,
      warrantyDate,
      warrantyType,
      assignedTo,
      condition,
      category,
      vendor,
      status,
      modelNo,
      model,
      description,
      location,
      building,
      room,
      department,
      computerDetails,
      routerDetails,
      switchDetails,
    } = req.body;

    // Handle file uploads
    const images = req.files?.images?.map((file) => file.filename) || [];
    const invoices = req.files?.invoices?.map((file) => file.filename) || [];
    const manuals = req.files?.manuals?.map((file) => file.filename) || [];

    // Prepare updated fields
    const updatedFields = {
      assetName: assetName || existingHardware.assetName,
      assetType: assetType || existingHardware.assetType,
      price: price || existingHardware.price,
      warrantyDate: warrantyDate || existingHardware.warrantyDate,
      warrantyType: warrantyType || existingHardware.warrantyType,
      assignedTo: assignedTo || existingHardware.assignedTo,
      condition: condition || existingHardware.condition,
      category: category || existingHardware.category,
      vendor: vendor || existingHardware.vendor,
      status: status || existingHardware.status,
      modelNo: modelNo || existingHardware.modelNo,
      model: model || existingHardware.model,
      description: description || existingHardware.description,
      location: location || existingHardware.location,
      building: building || existingHardware.building,
      room: room || existingHardware.room,
      department: department || existingHardware.department,
      computerDetails: computerDetails || existingHardware.computerDetails,
      routerDetails: routerDetails || existingHardware.routerDetails,
      switchDetails: switchDetails || existingHardware.switchDetails,
    };

    // Update Images Array Properly
    existingHardware.images = [
      ...(Array.isArray(existingHardware.images)
        ? existingHardware.images
        : []),
      ...(Array.isArray(images) ? images : [images]),
    ];

    await existingHardware.save();

    // Check if QR Code should be updated
    const shouldUpdateQRCode =
      assetName || modelNo || location || building || room || assignedTo;

    if (shouldUpdateQRCode) {
      const qrCodesDir = path.join(__dirname, "../public/qrcodes");
      if (!fs.existsSync(qrCodesDir)) {
        fs.mkdirSync(qrCodesDir, { recursive: true });
      }

      const qrCodeId = nanoid(10); // Generate unique ID
      const qrCodeFileName = `${qrCodeId}.png`;
      const qrCodePath = path.join(qrCodesDir, qrCodeFileName);

      const qrData = JSON.stringify({
        assetName: updatedFields.assetName,
        assetType: updatedFields.assetType,
        modelNo: updatedFields.modelNo,
        location: updatedFields.location,
        building: updatedFields.building,
        room: updatedFields.room,
        assignedTo: updatedFields.assignedTo,
        uniqueId: existingHardware.uniqueId,
      });

      await QRCode.toFile(qrCodePath, qrData, {
        color: {
          dark: "#000",
          light: "#FFF",
        },
      });

      updatedFields.qrCode = `/qrcodes/${qrCodeFileName}`;
    }

    // Update hardware details in MongoDB
    const updatedHardware = await Hardware.findByIdAndUpdate(
      id,
      { $set: updatedFields },
      { new: true, runValidators: true }
    );

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Hardware details updated successfully.",
      data: updatedHardware,
      qrCode: updatedFields.qrCode || existingHardware.qrCode,
    });
  } catch (error) {
    console.error("Error updating hardware:", error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update hardware details.",
      error: error.message,
    });
  }
};

export { updateHardware };
