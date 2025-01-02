import installedSoftwares from "../models/InstallSoftware.js";
import Softwares from "../models/Softwares.js";
import { StatusCodes } from "http-status-codes";

const submitInstalledSoftware = async (req, res) => {
  try {
    const { software, date, status, id } = req.body;

    // Validate Required Fields
    if (!id) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Hardware ID is required.",
      });
    }

    if (!Array.isArray(software) || software.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "At least one software ID must be provided.",
      });
    }

    if (!date || !status) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Date and status are required.",
      });
    }

    const alreadyInstalled = await installedSoftwares
      .find({
        hardwareId: id,
        softwareId: { $in: software }, // Ensure softwareId exists in the array
      })
      .populate("softwareId", "name"); // Fetch the software name from AllSoftwares

    if (alreadyInstalled.length > 0) {
      const alreadyInstalledNames = alreadyInstalled
        .map((s) => s.name)
        .join(", ");

      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `The following software is already installed on this hardware: ${alreadyInstalledNames}`,
      });
    }

    // Validate Software Availability and Update Quantity
    const invalidSoftwares = [];
    const validSoftwares = [];
    const softwareAssets = []; // To store each installed software record

    for (const softwareId of software) {
      const softwareData = await Softwares.findById(softwareId);

      if (!softwareData) {
        invalidSoftwares.push(softwareId);
        continue;
      }

      if (softwareData.quantity <= 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: `Software ${softwareData.name} is out of stock. Contact your administrator.`,
        });
      }

      // Update software quantity
      softwareData.assignedQuantity += 1;
      softwareData.spares =
        softwareData.quantity - softwareData.assignedQuantity;
      await softwareData.save();

      validSoftwares.push({
        id: softwareData._id, // Add the softwareId for reference
        name: softwareData.name,
        license: softwareData.licenseType || "N/A",
      });
    }

    if (invalidSoftwares.length > 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Some software IDs are invalid.",
        invalidSoftwares,
      });
    }

    //Save Installed Software Records
    for (const { id: softwareId, name, license } of validSoftwares) {
      const softwareAsset = new installedSoftwares({
        hardwareId: id,
        softwareId, // Reference to the software table
        name: name,
        license,
        date,
        status,
      });
      await softwareAsset.save();
      softwareAssets.push(softwareAsset);
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Software installed successfully on hardware.",
      data: softwareAssets,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

const fetchInstalledSoftwares = async (req, res) => {
  const { assetId } = req.query;

  try {
    const assets = await installedSoftwares.find({ hardwareId: assetId }).sort({
      createdAt: -1,
    });

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

const deleteSoftwareDetails = async (req, res) => {
  const { softwareId } = req.query;

  try {
    // Fetch the installed software record
    const installedSoftware = await installedSoftwares.findById(softwareId);
    if (!installedSoftware) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Installed software record not found.",
      });
    }

    // Update software quantity
    const softwareData = await Softwares.findById(installedSoftware.softwareId);
    if (softwareData) {
      softwareData.spares += 1;
      softwareData.assignedQuantity -= 1;
      // Increment the quantity
      await softwareData.save();
    }

    // Delete the installed software record
    await installedSoftwares.deleteOne({ _id: softwareId });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Software details deleted successfully.",
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  submitInstalledSoftware,
  fetchInstalledSoftwares,
  deleteSoftwareDetails,
};
