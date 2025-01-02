import Hardware from "../models/HardwareDetails.js";
import Softwares from "../models/Softwares.js";
import { StatusCodes } from "http-status-codes";
import installedSoftwares from "../models/InstallSoftware.js";

const requestAllSingleAssets = async (req, res) => {
  const { assetId } = req.query;

  try {
    // Fetch all assets from the database

    const assets = await Hardware.findOne({ _id: assetId });

    // Respond with the assets
    res.status(StatusCodes.OK).json({
      success: true,
      data: assets,
      message: "Assets retrieved successfully",
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

const requestSoftwareAssetDetails = async (req, res) => {
  const { assetId } = req.query;

  try {
    // Fetch all assets from the database

    const assets = await Softwares.findOne({ _id: assetId });

    // Respond with the assets
    res.status(StatusCodes.OK).json({
      success: true,
      data: assets,
      message: "Assets retrieved successfully",
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};
const fetchAssociatedHardwares = async (req, res) => {
  const { assetId } = req.query;

  try {
    const assets = await installedSoftwares
      .find({ softwareId: assetId })
      .populate({
        path: "softwareId",
        select: "name vendor licenseType price date",
      })
      .populate({
        path: "hardwareId",
        select:
          "assetName category condition assignedTo location building room department uniqueId",
      })
      .select("_id license date status");

    res.status(StatusCodes.OK).json({
      success: true,
      data: assets,
      message: "Assets retrieved successfully",
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  requestAllSingleAssets,
  requestSoftwareAssetDetails,
  fetchAssociatedHardwares,
};
