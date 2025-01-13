import Hardware from "../models/HardwareDetails.js";
import { StatusCodes } from "http-status-codes";
import Softwares from "../models/Softwares.js";

const requestAllAssets = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1; // 1-based index
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.searchQuery || ""; // Retrieve the search query

    // If there's a search query, apply filtering
    const searchFilter = searchQuery
      ? {
          $or: [
            { assetName: { $regex: searchQuery, $options: "i" } },
            { assetType: { $regex: searchQuery, $options: "i" } },
            { category: { $regex: searchQuery, $options: "i" } },
            { condition: { $regex: searchQuery, $options: "i" } },
            { location: { $regex: searchQuery, $options: "i" } },
          ],
        }
      : {}; // No filter if searchQuery is empty

    // Apply filtering and pagination
    const assets = await Hardware.find(searchFilter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const totalAssets = await Hardware.countDocuments(searchFilter); // Total matching asset count

    res.status(StatusCodes.OK).json({
      data: assets,
      totalAssets,
      numberOfPages: Math.ceil(totalAssets / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

const requestSoftwareAssets = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1; // 1-based index
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.searchQuery || ""; // Retrieve the search query

    // If there's a search query, apply filteringss
    const searchFilter = searchQuery
      ? {
          $or: [
            { name: { $regex: searchQuery, $options: "i" } },
            { vendor: { $regex: searchQuery, $options: "i" } },
            { licenseType: { $regex: searchQuery, $options: "i" } },
            { price: { $regex: searchQuery, $options: "i" } },
            { quantity: { $regex: searchQuery, $options: "i" } },
          ],
        }
      : {}; // No filter if searchQuery is empty

    // Apply filtering and pagination
    const assets = await Softwares.find(searchFilter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const totalAssets = await Softwares.countDocuments(searchFilter); // Total matching asset count

    res.status(StatusCodes.OK).json({
      data: assets,
      totalAssets,
      numberOfPages: Math.ceil(totalAssets / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

const requestCheckOutassets = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1; // 1-based index
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.searchQuery || ""; // Retrieve the search query

    // Base filter for "In Active"
    const statusFilter = { checkoutstatus: { $in: ["Check Out"] } };

    //  Apply filtering
    const searchFilter = searchQuery
      ? {
          $and: [
            statusFilter,
            {
              $or: [
                { assetName: { $regex: searchQuery, $options: "i" } },
                { assetType: { $regex: searchQuery, $options: "i" } },
                { category: { $regex: searchQuery, $options: "i" } },
                { condition: { $regex: searchQuery, $options: "i" } },
                { location: { $regex: searchQuery, $options: "i" } },
              ],
            },
          ],
        }
      : statusFilter;

    // Apply filtering and pagination
    const assets = await Hardware.find(searchFilter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const totalAssets = await Hardware.countDocuments(searchFilter); // Total matching asset count

    res.status(StatusCodes.OK).json({
      data: assets,
      totalAssets,
      numberOfPages: Math.ceil(totalAssets / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};
const requestCheckInassets = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1; // 1-based index
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.searchQuery || ""; // Retrieve the search query

    const statusFilter = { checkoutstatus: { $in: ["Check In"] } };

    //  Apply filtering
    const searchFilter = searchQuery
      ? {
          $and: [
            statusFilter,
            {
              $or: [
                { assetName: { $regex: searchQuery, $options: "i" } },
                { assetType: { $regex: searchQuery, $options: "i" } },
                { category: { $regex: searchQuery, $options: "i" } },
                { condition: { $regex: searchQuery, $options: "i" } },
                { location: { $regex: searchQuery, $options: "i" } },
              ],
            },
          ],
        }
      : statusFilter;

    // Apply filtering and pagination
    const assets = await Hardware.find(searchFilter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const totalAssets = await Hardware.countDocuments(searchFilter); // Total matching asset count

    res.status(StatusCodes.OK).json({
      data: assets,
      totalAssets,
      numberOfPages: Math.ceil(totalAssets / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};
const requestInActiveassets = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1; // 1-based index
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.searchQuery || ""; // Retrieve the search query

    const statusFilter = { checkoutstatus: { $in: ["InActive"] } };

    //  Apply filtering
    const searchFilter = searchQuery
      ? {
          $and: [
            statusFilter,
            {
              $or: [
                { assetName: { $regex: searchQuery, $options: "i" } },
                { assetType: { $regex: searchQuery, $options: "i" } },
                { category: { $regex: searchQuery, $options: "i" } },
                { condition: { $regex: searchQuery, $options: "i" } },
                { location: { $regex: searchQuery, $options: "i" } },
              ],
            },
          ],
        }
      : statusFilter;

    // Apply filtering and pagination
    const assets = await Hardware.find(searchFilter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const totalAssets = await Hardware.countDocuments(searchFilter); // Total matching asset count

    res.status(StatusCodes.OK).json({
      data: assets,
      totalAssets,
      numberOfPages: Math.ceil(totalAssets / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

// API to get counts of hardware statuses and total assets
const tabbarCounter = async (req, res) => {
  try {
    const statusCounts = await Hardware.aggregate([
      {
        $facet: {
          statusCounts: [
            { $unwind: "$checkoutstatus" },
            {
              $match: {
                checkoutstatus: { $in: ["Check In", "InActive", "Check Out"] },
              },
            },
            {
              $group: {
                _id: "$checkoutstatus",
                count: { $sum: 1 },
              },
            },
          ],
          totalHardware: [
            {
              $count: "count",
            },
          ],
        },
      },
    ]);

    // Default structure
    const defaultCounts = {
      "Check In": 0,
      InActive: 0,
      "Check Out": 0,
      Total: 0,
    };

    // Map status counts
    statusCounts[0].statusCounts.forEach((item) => {
      defaultCounts[item._id] = item.count;
    });

    // Map total count
    defaultCounts.Total = statusCounts[0].totalHardware[0]?.count || 0;

    // Send the response
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Asset status counts retrieved successfully.",
      data: defaultCounts,
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
  requestAllAssets,
  requestCheckInassets,
  requestCheckOutassets,
  requestInActiveassets,
  tabbarCounter,
  requestSoftwareAssets,
};
