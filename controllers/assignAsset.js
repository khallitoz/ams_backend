import AssignedAssetDetail from "../models/AssignedAssetDetail.js";
import { StatusCodes } from "http-status-codes";

const assignAsset = async (req, res) => {
  try {
    const { action, assignedTo, date, status, id } = req.body;

    if (!id) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Hardware ID is required.",
      });
    }

    // Create a new Assigned Asset Entry
    const assignedAsset = new AssignedAssetDetail({
      hardwareId: id,
      action,
      assignedTo,
      date,
      status,
    });

    await assignedAsset.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Assigned asset details added successfully.",
      data: assignedAsset,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

export { assignAsset };
