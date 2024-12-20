import Hardware from "../models/HardwareDetails.js";
import { StatusCodes } from "http-status-codes";

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
    const assets = await Hardware.find(searchFilter).skip(skip).limit(limit);
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

export { requestAllAssets };
