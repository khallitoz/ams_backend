import Hardware from "../models/HardwareDetails.js";
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

const updateHardware = async (req, res) => {
  const { id } = req.params;

  // Parse nested JSON fields
  parseNestedJSON(req.body, [
    "computerDetails",
    "routerDetails",
    "networkDevice",
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
      serialNo,
      modelNo,
      model,
      description,
      location,
      building,
      room,
      department,
      computerDetails,
      routerDetails,
      networkDevice,
    } = req.body;

    //  Step 2: Upload Files to Backblaze
    const images = req.files?.images
      ? await uploadToBackblaze("images", req.files.images)
      : [];
    const invoices = req.files?.invoices
      ? await uploadToBackblaze("invoices", req.files.invoices)
      : [];
    const manuals = req.files?.manuals
      ? await uploadToBackblaze("manuals", req.files.manuals)
      : [];

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
      serialNo: serialNo || existingHardware.serialNo,
      modelNo: modelNo || existingHardware.modelNo,
      model: model || existingHardware.model,
      description: description || existingHardware.description,
      location: location || existingHardware.location,
      building: building || existingHardware.building,
      room: room || existingHardware.room,
      department: department || existingHardware.department,
      computerDetails: computerDetails || existingHardware.computerDetails,
      routerDetails: routerDetails || existingHardware.routerDetails,
      networkDevice: networkDevice || existingHardware.networkDevice,
    };

    // Update Images Array Properly
    existingHardware.images = [
      ...(Array.isArray(existingHardware.images)
        ? existingHardware.images
        : []),
      ...(Array.isArray(images) ? images : [images]),
    ];

    existingHardware.invoices = [
      ...(Array.isArray(existingHardware.invoices)
        ? existingHardware.invoices
        : []),
      ...(Array.isArray(invoices) ? invoices : [invoices]),
    ];

    existingHardware.manuals = [
      ...(Array.isArray(existingHardware.manuals)
        ? existingHardware.manuals
        : []),
      ...(Array.isArray(manuals) ? manuals : [manuals]),
    ];
    await existingHardware.save();

    //  Generate QR Code Buffer
    const qrData = `
    ID: ${existingHardware.uniqueId}
    NAME: ${req.body.assetName}
    TYPE: ${req.body.assetType}
    MODEL: ${req.body.modelNo}
    `;
    const qrCodeBuffer = await QRCode.toBuffer(qrData);
    const qrCodeFileName = `${nanoid()}-qrcode.png`;

    // Step 5: Upload QR Code to Backblaze
    const [qrCodeUrl] = await uploadToBackblaze("qrcodes", [
      {
        originalname: qrCodeFileName,
        buffer: qrCodeBuffer,
        mimetype: "image/png",
      },
    ]);

    //  Step 6: Update Hardware with QR Code URL
    existingHardware.qrCode = qrCodeUrl;

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
