import Hardware from "../models/HardwareDetails.js";
import { StatusCodes } from "http-status-codes";

const requestSearchedAssets = async (req, res) => {
  const { searchQuery } = req.query;

  // Log the search query for debugging
  console.log("Search Query:", searchQuery);

  try {
    // Check if searchQuery is provided
    if (!searchQuery) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Search query is required.",
      });
    }

    // Perform a global search across multiple fields using `$or`
    const assets = await Hardware.find({
      $or: [
        { assetName: { $regex: searchQuery, $options: "i" } }, // Match in Asset Name
        { assetType: { $regex: searchQuery, $options: "i" } }, // Match in Asset Type
        { category: { $regex: searchQuery, $options: "i" } },  // Match in Category
        { condition: { $regex: searchQuery, $options: "i" } }, // Match in Condition
        { location: { $regex: searchQuery, $options: "i" } },  // Match in Location
      ],
    });

    // Respond with the filtered assets
    return res.status(StatusCodes.OK).json({
      success: true,
      data: assets,
      message: "Assets retrieved successfully.",
    });
  } catch (error) {
    // Handle any errors that occur
    console.error("Error retrieving assets:", error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

export { requestSearchedAssets };
