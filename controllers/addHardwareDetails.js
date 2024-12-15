import Hardware from "../models/HardwareDetails.js";
import { StatusCodes } from "http-status-codes";

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

    // Extract uploaded file names
    const images = req.files?.images?.map((file) => file.filename) || [];
    const invoices = req.files?.invoices?.map((file) => file.filename) || [];
    const manuals = req.files?.manuals?.map((file) => file.filename) || [];

    // Create a new hardware record
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
      images, // Save file names for images
      invoices, // Save file names for invoices
      manuals, // Save file names for manuals
      computerDetails,
      routerDetails,
      switchDetails,
    });

    await hardwareDetails.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Hardware details submitted successfully",
      data: hardwareDetails,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

export { addHardwareDetails };
