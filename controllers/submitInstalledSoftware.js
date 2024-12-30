import SoftwareDetail from "../models/Software.js";
import Hardware from "../models/HardwareDetails.js";
import { StatusCodes } from "http-status-codes";

const submitInstalledSoftware = async (req, res) => {
  try {
    const { software, license, date, status, id } = req.body;

    // Validate required fields
    if (!id) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Hardware ID is required.",
      });
    }

    // Create a new Assigned Asset Entry
    const softwareAsset = new SoftwareDetail({
      hardwareId: id,
      software,
      license,
      date,
      status,
    });

    await softwareAsset.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message:
        "Assigned asset details added and hardware status updated successfully.",
      data: softwareAsset,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

const fetchSoftwareDetails = async (req, res) => {
  const { assetId } = req.query;

  try {
    const assets = await SoftwareDetail.find({ hardwareId: assetId }).sort({
      createdAt: -1,
    });

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

const deleteSoftwareDetails = async (req, res) => {
  const { assetId } = req.query;
  return console.log(assetId);

  try {
    const assets = await SoftwareDetail.find({ hardwareId: assetId }).sort({
      createdAt: -1,
    });

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

export { submitInstalledSoftware, fetchSoftwareDetails, deleteSoftwareDetails };
