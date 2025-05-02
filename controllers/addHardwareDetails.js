import { StatusCodes } from "http-status-codes";
import QRCode from "qrcode";
import { nanoid } from "nanoid";
import uploadToBackblaze from "../utils/blazeUploads.js";

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
  if (!data.serialNo) errors.serialNo = "Status is required.";
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

  // Network details validation
  if (data.assetType === "Network") {
    if (!data.networkDevice?.os)
      errors["networkDevice.os"] = "Operating System is required.";
    if (!data.networkDevice?.osVersion)
      errors["networkDevice.osVersion"] = "OS Version is required.";
    if (!data.networkDevice?.ipAddress) {
      errors["networkDevice.ipAddress"] = "IP Address is required.";
    } else if (!ipRegex.test(data.networkDevice.ipAddress)) {
      errors["networkDevice.ipAddress"] =
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
  parseNestedJSON(req.body, [
    "computerDetails",
    "routerDetails",
    "networkDevice",
  ]);

  try {
    //  Validate Form Data
    const Hardware = req.models.Hardware;
    const errors = validateForm(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    // Generate a date-based sequential asset number
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");

    // Create a separate variable for start of day
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    // Count hardware assets created today
    const countToday = await Hardware.countDocuments({
      createdAt: {
        $gte: startOfDay,
      },
    });

    // Format as 3-digit sequence (001, 002, etc.)
    const sequence = (countToday + 1).toString().padStart(3, "0");

    // Create asset number: HW-20230615-001
    const assetNumber = `HW-${dateStr}-${sequence}`;

    //   Upload Files to Backblaze
    const images = req.files?.images
      ? await uploadToBackblaze("images", req.files.images)
      : [];
    const invoices = req.files?.invoices
      ? await uploadToBackblaze("invoices", req.files.invoices)
      : [];
    const manuals = req.files?.manuals
      ? await uploadToBackblaze("manuals", req.files.manuals)
      : [];

    //   Save Hardware Details to MongoDB with the generated asset number
    const hardwareDetails = new Hardware({
      ...req.body,
      assetNumber,
      images, // Save image URLs
      invoices, // Save invoice URLs
      manuals, // Save manual URLs
    });

    const updatedHardware = await hardwareDetails.save();

    //  Generate QR Code Buffer
    const qrData = `
    ID: ${updatedHardware.assetNumber}
    NAME: ${req.body.assetName}
    TYPE: ${req.body.assetType}
    MODEL: ${req.body.modelNo}
    `;

    const qrCodeBuffer = await QRCode.toBuffer(qrData);
    const qrCodeFileName = `${nanoid()}-qrcode.png`;

    //  Upload QR Code to Backblaze
    const [qrCodeUrl] = await uploadToBackblaze("qrcodes", [
      {
        originalname: qrCodeFileName,
        buffer: qrCodeBuffer,
        mimetype: "image/png",
      },
    ]);

    //   Update Hardware with QR Code URL
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
