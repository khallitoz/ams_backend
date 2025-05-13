import Hardware from "../models/HardwareDetails.js";
import Softwares from "../models/Softwares.js";
import { StatusCodes } from "http-status-codes";
import installedSoftwares from "../models/InstallSoftware.js";
import mongoose from "mongoose";
import { nanoid } from "nanoid";

// Generate a unique ID for maintenance tasks
const generateUniqueId = () => {
  const timestamp = Date.now().toString(36); // Convert timestamp to base36
  const random = nanoid(8); // Generate 8 random characters
  return `MT-${timestamp}-${random}`; // Format: MT-timestamp-random
};

const fetchSoftwareCategoryData = async (req, res) => {
  const { category } = req.query;

  const AllSoftwares = req.models.AllSoftwares;
  const Hardware = req.models.Hardware;
  try {
    const availableCategorySoftware = await AllSoftwares.find({
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

  const AllSoftwares = req.models.AllSoftwares;
  const Hardware = req.models.Hardware;
  try {
    const availableCategorySoftware = await AllSoftwares.findOne({
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
  console.log(req.body);

  // Initialize session as null outside the try block
  let session = null;

  try {
    // Get models from req.models
    const AllSoftwares = req.models.AllSoftwares;
    const Hardware = req.models.Hardware;
    const installedSoftwares = req.models.InstallSoftware;

    // Try to start a session, but handle the case where it might not be supported
    try {
      session = await AllSoftwares.startSession();
      await session.startTransaction();
    } catch (sessionError) {
      console.log("Sessions/transactions not supported:", sessionError.message);
      // Continue without transaction support
    }

    const { softwareIds, hardwareIds } = req.body;

    // Validate inputs
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

    // Use session only if available
    const alreadyInstalledQuery = installedSoftwares
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
      });

    // Only use session if it's available
    if (session) {
      alreadyInstalledQuery.session(session);
    }

    const alreadyInstalled = await alreadyInstalledQuery;

    if (alreadyInstalled.length > 0) {
      // Map results into a meaningful error message
      const alreadyInstalledDetails = alreadyInstalled
        .map(
          (record) =>
            `${record.softwareId.name} has already been installed on ${record.hardwareId.assetName}`
        )
        .join("; ");

      if (session) {
        await session.abortTransaction();
      }

      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `The following installations already exist: ${alreadyInstalledDetails}`,
      });
    }

    // Validate Software Stock
    const softwareDetailsQuery = AllSoftwares.find({
      _id: { $in: softwareIds },
    });

    if (session) {
      softwareDetailsQuery.session(session);
    }

    const softwareDetails = await softwareDetailsQuery;

    for (const software of softwareDetails) {
      if (software.spares < hardwareIds.length) {
        if (session) {
          await session.abortTransaction();
        }

        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: `Insufficient stock for software: ${software.name}. Available spares: ${software.spares}, Selected Hardware devices are: ${hardwareIds.length}`,
        });
      }
    }

    // Step 3: Bulk Update Software Quantities
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

    const bulkWriteOptions = session ? { session } : {};
    await AllSoftwares.bulkWrite(bulkUpdateOperations, bulkWriteOptions);

    // Step 4: Bulk Insert Installation Records
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

    const insertManyOptions = session ? { session } : {};
    await installedSoftwares.insertMany(installedRecords, insertManyOptions);

    // Commit Transaction if session exists
    if (session) {
      await session.commitTransaction();
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Software successfully installed on hardware devices.",
      data: installedRecords,
    });
  } catch (error) {
    // Rollback Transaction on Error if session exists
    if (session) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error("Error aborting transaction:", abortError.message);
      }
    }

    console.error("Error during bulk installation:", error.message);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  } finally {
    // End session if it exists
    if (session) {
      try {
        session.endSession();
      } catch (endSessionError) {
        console.error("Error ending session:", endSessionError.message);
      }
    }
  }
};

const fetchMaintenanceData = async (req, res) => {
  const { maintenancetype, selectedCategory, specificCategory } = req.query;
  const AllSoftwares = req.models.AllSoftwares;
  const Hardware = req.models.Hardware;
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

      const availableCategorySoftware = await AllSoftwares.find(query).select(
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
  const {
    selectedAssets,
    assignedTo,
    status,
    priority,
    taskName,
    description,
    dueDate,
  } = req.body;

  console.log("this is req.body", req.body);
  const Maintenance = req.models.Maintenance;

  // Validate required fields
  const requiredFields = {
    selectedAssets,
    assignedTo,
    status,
    priority,
    taskName,
    description,
    dueDate,
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }

  // Validate selectedAssets is an array and not empty
  if (!Array.isArray(selectedAssets) || selectedAssets.length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one asset must be selected",
    });
  }

  // Validate status and priority values
  const validStatuses = ["Pending", "In Progress", "Completed", "Deferred"];
  const validPriorities = ["Low", "Medium", "High", "Critical"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
    });
  }

  if (!validPriorities.includes(priority)) {
    return res.status(400).json({
      success: false,
      message: `Invalid priority. Must be one of: ${validPriorities.join(
        ", "
      )}`,
    });
  }

  // Validate dueDate is a valid future date
  const dueDateObj = new Date(dueDate);
  if (isNaN(dueDateObj.getTime()) || dueDateObj < new Date()) {
    return res.status(400).json({
      success: false,
      message: "Due date must be a valid future date",
    });
  }

  // Generate a date-based sequential asset number
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");

  // Create a separate variable for start of day
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  // Count hardware assets created today
  const countToday = await Maintenance.countDocuments({
    createdAt: {
      $gte: startOfDay,
    },
  });

  // Format as 3-digit sequence (001, 002, etc.)
  const sequence = (countToday + 1).toString().padStart(3, "0");

  // Create asset number: HW-20230615-001
  const maintenanceId = `MT-${dateStr}-${sequence}`;

  // Start a session for transaction
  const session = await Maintenance.startSession();
  session.startTransaction();

  try {
    // Create maintenance records for each selected asset
    const maintenanceRecords = selectedAssets.map((asset) => ({
      maintenanceId,
      assetName: asset.name || asset.assetName,
      assetId: asset._id,
      assetType: asset.assetType,
      category: asset.category,
      assignedTo,
      status,
      priority,
      taskName,
      description,
      dueDate: dueDateObj,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Insert all maintenance records
    await Maintenance.insertMany(maintenanceRecords, { session });

    // Commit the transaction
    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: `Successfully created ${maintenanceRecords.length} maintenance tasks`,
      data: {
        count: maintenanceRecords.length,
        tasks: maintenanceRecords,
      },
    });
  } catch (error) {
    // If anything fails, abort the transaction
    await session.abortTransaction();

    console.error("Error creating bulk maintenance tasks:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create maintenance tasks",
      error: error.message,
    });
  } finally {
    // Always end the session
    session.endSession();
  }
};

const fetchAllMaintenance = async (req, res) => {
  const { page = 1, limit = 10, searchQuery = "" } = req.query;
  const Maintenance = req.models.Maintenance;

  try {
    // Create search query
    const query = searchQuery
      ? {
          $or: [
            { taskName: { $regex: searchQuery, $options: "i" } },
            { assetName: { $regex: searchQuery, $options: "i" } },
            { maintenanceId: { $regex: searchQuery, $options: "i" } },
            { category: { $regex: searchQuery, $options: "i" } },
            { status: { $regex: searchQuery, $options: "i" } },
            { priority: { $regex: searchQuery, $options: "i" } },
            { assignedTo: { $regex: searchQuery, $options: "i" } },
          ],
        }
      : {};

    // Get total count for pagination
    const total = await Maintenance.countDocuments(query);

    // Fetch maintenance tasks with pagination
    const maintenanceTasks = await Maintenance.find(query)
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    return res.status(200).json({
      success: true,
      data: maintenanceTasks,
      totalMaintenance: total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching maintenance tasks:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch maintenance tasks",
      error: error.message,
    });
  }
};

export {
  fetchSoftwareCategoryData,
  installSelectedCategories,
  fetchSingleSoftwareCategoryData,
  fetchMaintenanceData,
  addBulkMaintenance,
  fetchAllMaintenance,
};
