import { StatusCodes } from "http-status-codes";

/**
 * Controller to get all users for a specific client
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllUsers = async (req, res) => {
  try {
    // Get the User model from req.models
    const User = req.models.User;

    // Get query parameters for pagination and search
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchQuery = req.query.search || "";

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build the search filter
    const searchFilter = searchQuery
      ? {
          $or: [
            { name: { $regex: searchQuery, $options: "i" } },
            { email: { $regex: searchQuery, $options: "i" } },
            { userId: { $regex: searchQuery, $options: "i" } },
          ],
        }
      : {};

    // Add clientId to the filter to ensure data isolation
    const filter = {
      ...searchFilter,
      clientId: req.client_id,
    };

    // Get users with pagination
    const users = await User.find(filter)
      .select("-password") // Exclude password field
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalUsers = await User.countDocuments(filter);

    // Calculate total pages
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        users,
        totalUsers,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

export { getAllUsers };
