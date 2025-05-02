import mongoose from "mongoose";

// Get dashboard counters
export const getDashboardCounters = async (req, res) => {
  try {
    const { Hardware, AllSoftwares } = req.models;
    const { dateRange } = req.query;

    // Build date filter based on dateRange
    const dateFilter = getDateFilter(dateRange);

    // Count hardware assets
    const hardwareCount = await Hardware.countDocuments(dateFilter);

    // Count software assets
    const softwareCount = await AllSoftwares.countDocuments(dateFilter);

    // Calculate total assets
    const totalAssets = hardwareCount + softwareCount;

    res.status(200).json({
      success: true,
      totalAssets,
      totalHardwareAssets: hardwareCount,
      totalSoftwareAssets: softwareCount,
    });
  } catch (error) {
    console.error("Error fetching dashboard counters:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error when fetching dashboard counters",
    });
  }
};

// Get hardware assets by type
export const getHardwareByType = async (req, res) => {
  try {
    const { Hardware } = req.models;
    const { dateRange } = req.query;

    // Build date filter based on dateRange
    const dateFilter = getDateFilter(dateRange);

    // Aggregate hardware assets by type
    const hardwareByType = await Hardware.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$assetType",
          value: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          value: 1,
        },
      },
      { $sort: { value: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: hardwareByType,
    });
  } catch (error) {
    console.error("Error fetching hardware by type:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error when fetching hardware by type",
    });
  }
};

// Get hardware assets by status
export const getHardwareByStatus = async (req, res) => {
  try {
    const { Hardware } = req.models;
    const { dateRange } = req.query;

    // Build date filter based on dateRange
    const dateFilter = getDateFilter(dateRange);

    // Initialize status counts
    const statusCounts = [
      { name: "Check In", value: 0 },
      { name: "Check Out", value: 0 },
      { name: "InActive", value: 0 },
      { name: "In Service", value: 0 },
    ];

    // Count assets by status
    const hardwareAssets = await Hardware.find(dateFilter);

    // Process each asset
    hardwareAssets.forEach((asset) => {
      const statusArray = asset.checkoutstatus;
      if (statusArray && statusArray.length > 0) {
        const currentStatus = statusArray[statusArray.length - 1];

        // Find and increment the matching status
        const statusItem = statusCounts.find(
          (item) => item.name === currentStatus
        );
        if (statusItem) {
          statusItem.value++;
        }
      } else {
        // If no status is set, count as "In Service"
        const inServiceItem = statusCounts.find(
          (item) => item.name === "In Service"
        );
        if (inServiceItem) {
          inServiceItem.value++;
        }
      }
    });

    // Filter out statuses with zero count
    const filteredStatusCounts = statusCounts.filter((item) => item.value > 0);

    res.status(200).json({
      success: true,
      data: filteredStatusCounts,
    });
  } catch (error) {
    console.error("Error fetching hardware by status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error when fetching hardware by status",
    });
  }
};

// Get software assets by category
export const getSoftwareByCategory = async (req, res) => {
  try {
    const { AllSoftwares } = req.models;
    const { dateRange } = req.query;

    // Build date filter based on dateRange
    const dateFilter = getDateFilter(dateRange);

    // Aggregate software assets by category
    const softwareByCategory = await AllSoftwares.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$category",
          value: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          value: 1,
        },
      },
      { $sort: { value: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: softwareByCategory,
    });
  } catch (error) {
    console.error("Error fetching software by category:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error when fetching software by category",
    });
  }
};

// Helper function to create date filters based on the specified range
const getDateFilter = (dateRange) => {
  const now = new Date();
  const filter = {};

  if (!dateRange || dateRange === "all") {
    return filter;
  }

  const startDate = new Date();

  switch (dateRange) {
    case "today":
      startDate.setHours(0, 0, 0, 0);
      break;
    case "week":
      startDate.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
      startDate.setHours(0, 0, 0, 0);
      break;
    case "month":
      startDate.setDate(1); // Start of current month
      startDate.setHours(0, 0, 0, 0);
      break;
    case "quarter":
      const quarter = Math.floor(now.getMonth() / 3);
      startDate.setMonth(quarter * 3, 1); // Start of current quarter
      startDate.setHours(0, 0, 0, 0);
      break;
    case "year":
      startDate.setMonth(0, 1); // January 1st of current year
      startDate.setHours(0, 0, 0, 0);
      break;
    default:
      return filter;
  }

  return { createdAt: { $gte: startDate } };
};
