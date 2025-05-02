import Hardware from "../models/HardwareDetails.js";
import AssignedAssetDetail from "../models/AssignedAssetDetail.js";

import { StatusCodes } from "http-status-codes";

const fetchAssignAsset = async (req, res) => {
  const { assetId } = req.query;
  const AssignedAssetDetail = req.models.AssignedAsset;
  try {
    // Fetch all assets from the database

    const assets = await AssignedAssetDetail.find({ hardwareId: assetId }).sort(
      { createdAt: -1 }
    );

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

export { fetchAssignAsset };
