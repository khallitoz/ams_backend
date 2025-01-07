import { StatusCodes } from "http-status-codes";
import Hardware from "../models/HardwareDetails.js";
import Softwares from "../models/Softwares.js";

const fetchAssetInfo = async (req, res) => {
  const { assetType, category } = req.query;

  try {
    if (!assetType) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Asset type is required.",
      });
    }

    if (assetType === "hardware") {
      const hardwareAssets = await Hardware.find().select("_id assetName");
      return res.status(StatusCodes.OK).json({
        success: true,
        data: hardwareAssets,
        message: "Hardware assets retrieved successfully.",
      });
    }

    if (assetType === "software") {
      const softwareAssets = await Softwares.find().select(
        "_id name"
      );
      return res.status(StatusCodes.OK).json({
        success: true,
        data: softwareAssets,
        message: "Software assets retrieved successfully.",
      });
    }

    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message:
        "Invalid asset type. Accepted types are 'Hardware' or 'Software'.",
    });
  } catch (error) {
    console.error("Error fetching asset info:", error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "An error occurred while fetching asset information.",
      error: error.message,
    });
  }
};

export { fetchAssetInfo };
