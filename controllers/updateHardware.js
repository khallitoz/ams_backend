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

const updateHardware = async (req, res) => {
  const { id } = req.params; // Get hardware ID from route params

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

    return console.log(req.body);

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

    // Update file paths if new files are uploaded
    if (images.length > 0) updatedFields.images = images;
    if (invoices.length > 0) updatedFields.invoices = invoices;
    if (manuals.length > 0) updatedFields.manuals = manuals;

    // Check if important fields have changed for QR Code regeneration
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

    // Update hardware details
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
