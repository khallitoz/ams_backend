import Hardware from "../models/HardwareDetails.js";
import { StatusCodes } from "http-status-codes";

const requestAllAssets = async (req, res) => {
  try {
    // Fetch all assets from the database
    const assets = await Hardware.find({});

    // Respond with the assets
    res.status(StatusCodes.OK).json({
      success: true,
      data: assets,
      message: "Assets retrieved successfully",
    });
  } catch (error) {
    // Handle any errors that occur
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

export { requestAllAssets };
