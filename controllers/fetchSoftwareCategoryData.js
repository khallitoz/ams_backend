import Hardware from "../models/HardwareDetails.js";
import Softwares from "../models/Softwares.js";
import { StatusCodes } from "http-status-codes";
import installedSoftwares from "../models/InstallSoftware.js";
import mongoose from "mongoose";

const fetchSoftwareCategoryData = async (req, res) => {
  const { category } = req.query;

  try {
    const availableCategorySoftware = await Softwares.find({
      category: category,
    }).select("_id name");

    const availableCategoryHardware = await Hardware.find({
      assetType: category,
    }).select("_id assetName");

    res.status(StatusCodes.OK).json({
      success: true,
      software: availableCategorySoftware,
      hardware: availableCategoryHardware,
      message: "Assets retrieved successfully",
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

const fetchSingleSoftwareCategoryData = async (req, res) => {
  const { category, softwareId } = req.query;
  console.log(softwareId, category);
  try {
    const availableCategorySoftware = await Softwares.findOne({
      category: category, // Filter by category
      _id: softwareId, // Filter by specific software ID
    }).select("_id name");

    const availableCategoryHardware = await Hardware.find({
      assetType: category,
    }).select("_id assetName");

    res.status(StatusCodes.OK).json({
      success: true,
      software: availableCategorySoftware,
      hardware: availableCategoryHardware,
      message: "Assets retrieved successfully",
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};
// Controller for Bulk Installation
const installSelectedCategories = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { softwareIds, hardwareIds } = req.body;

    //  Validate Inputs
    if (!Array.isArray(softwareIds) || softwareIds.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "At least one software ID must be provided.",
      });
    }

    if (!Array.isArray(hardwareIds) || hardwareIds.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "At least one hardware ID must be provided.",
      });
    }

    // Start Transaction
    await session.startTransaction();

    //  Step 1: Check for Already Installed Software on Hardware
    const alreadyInstalled = await installedSoftwares
      .find({
        hardwareId: { $in: hardwareIds },
        softwareId: { $in: softwareIds },
      })
      .populate({
        path: "softwareId",
        select: "name",
      })
      .populate({
        path: "hardwareId",
        select: "assetName",
      })
      .session(session);

    if (alreadyInstalled.length > 0) {
      // Map results into a meaningful error message
      const alreadyInstalledDetails = alreadyInstalled
        .map(
          (record) =>
            `${record.softwareId.name} has already been installed on ${record.hardwareId.assetName}`
        )
        .join("; ");

      await session.abortTransaction();
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `The following installations already exist: ${alreadyInstalledDetails}`,
      });
    }

    //   Validate Software Stock
    const softwareDetails = await Softwares.find({
      _id: { $in: softwareIds },
    }).session(session);

    for (const software of softwareDetails) {
      if (software.spares < hardwareIds.length) {
        await session.abortTransaction();
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: `Insufficient stock for software: ${software.name}. Available spares: ${software.spares}, Selected Hardware devices are: ${hardwareIds.length}`,
        });
      }
    }

    //  Step 3: Bulk Update Software Quantities
    const bulkUpdateOperations = softwareDetails.map((software) => ({
      updateOne: {
        filter: { _id: software._id },
        update: {
          $inc: {
            assignedQuantity: hardwareIds.length,
            spares: -hardwareIds.length,
          },
        },
      },
    }));

    await Softwares.bulkWrite(bulkUpdateOperations, { session });

    //  Step 4: Bulk Insert Installation Records
    const installedRecords = [];

    hardwareIds.forEach((hardwareId) => {
      softwareDetails.forEach((software) => {
        installedRecords.push({
          hardwareId,
          softwareId: software._id,
          date: new Date(),
          status: "Installed",
        });
      });
    });

    await installedSoftwares.insertMany(installedRecords, { session });

    // Commit Transaction
    await session.commitTransaction();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Software successfully installed on hardware devices.",
      data: installedRecords,
    });
  } catch (error) {
    // Rollback Transaction on Error
    await session.abortTransaction();
    console.error("Error during bulk installation:", error.message);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

const fetchMaintenanceData = async (req, res) => {
  const { maintenancetype, selectedCategory, specificCategory } = req.query;

  if (!maintenancetype || !selectedCategory) {
    return res.status(400).json({
      success: false,
      message:
        "Missing required parameters: maintenancetype or selectedCategory",
    });
  }

  try {
    if (maintenancetype === "Hardware") {
      // Start by creating the base query with only selectedCategory
      const query = { assetType: selectedCategory };

      // Only add specificCategory if it's non-null, non-undefined, and non-empty
      if (
        specificCategory &&
        specificCategory !== "null" &&
        specificCategory !== ""
      ) {
        query.category = specificCategory;
      }

      console.log("this is query", query); // Log the query for debugging

      const availableCategoryHardware = await Hardware.find(query).select(
        "_id assetName"
      );

      return res.status(200).json({
        success: true,
        data: availableCategoryHardware,
        message: "Hardware assets retrieved successfully",
      });
    }

    if (maintenancetype === "Software") {
      const query = {};

      // Only add category if selectedCategory is truthy
      if (selectedCategory) {
        query.category = selectedCategory;
      }

      const availableCategorySoftware = await Softwares.find(query).select(
        "_id name"
      );

      return res.status(200).json({
        success: true,
        data: availableCategorySoftware,
        message: "Software assets retrieved successfully",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Unsupported maintenance type",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

const addBulkMaintenance = async (req, res) => {
  const { values } = req.body;
  console.log(req.body);
};

export {
  fetchSoftwareCategoryData,
  installSelectedCategories,
  fetchSingleSoftwareCategoryData,
  fetchMaintenanceData,
  addBulkMaintenance,
};
