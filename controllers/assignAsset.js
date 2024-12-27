import AssignedAssetDetail from "../models/AssignedAssetDetail.js";
import Hardware from "../models/HardwareDetails.js";
import { StatusCodes } from "http-status-codes";

const assignAsset = async (req, res) => {
  try {
    const { action, assignedTo, date, status, id } = req.body;

    // Validate required fields
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

    // Update hardware checkoutstatus based on action
    if (action === "Check In") {
      await Hardware.findByIdAndUpdate(
        id,
        { $set: { checkoutstatus: ["Check In"] } }, // Set to "Check In"
        { new: true, runValidators: true }
      );
    } else if (action === "Check Out") {
      await Hardware.findByIdAndUpdate(
        id,
        { $set: { checkoutstatus: ["Check Out"] } }, // Set to "Check Out"
        { new: true, runValidators: true }
      );
    }

    // Send a response after updates are complete
    res.status(StatusCodes.OK).json({
      success: true,
      message:
        "Assigned asset details added and hardware status updated successfully.",
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
