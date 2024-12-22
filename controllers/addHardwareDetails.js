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

const addHardwareDetails = async (req, res) => {
  try {
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
      computerDetails = {},
      routerDetails = {},
      switchDetails = {},
    } = req.body;

    // Ensure the qrcodes folder exists
    const qrCodesDir = path.join(__dirname, "../public/qrcodes");
    if (!fs.existsSync(qrCodesDir)) {
      fs.mkdirSync(qrCodesDir, { recursive: true });
    }

    // Step 1: Create the hardware record with uniqueId from pre-save middleware
    const hardwareDetails = new Hardware({
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
    });

    await hardwareDetails.save();

    // Step 3: Generate QR Code with nanoid
    const qrCodeId = nanoid(10); // Generate unique ID
    const qrCodeFileName = `${qrCodeId}.png`;
    const qrCodePath = path.join(qrCodesDir, qrCodeFileName);

    const qrData = JSON.stringify({
      assetName,
      assetType,
      modelNo,
      location,
      building,
      room,
      assignedTo,
      uniqueId: updatedHardware.uniqueId,
    });

    await QRCode.toFile(qrCodePath, qrData, {
      color: {
        dark: "#000", // Black dots
        light: "#FFF", // White background
      },
    });

    // Step 4: Save the QR Code Path
    updatedHardware.qrCode = `/qrcodes/${qrCodeFileName}`;
    await updatedHardware.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Hardware details submitted successfully with QR Code",
      data: updatedHardware,
      qrCode: updatedHardware.qrCode,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

export { addHardwareDetails };
