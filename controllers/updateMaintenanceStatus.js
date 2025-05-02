import { StatusCodes } from "http-status-codes";

const updateMaintenanceStatus = async (req, res) => {
  const { id } = req.params;
  const { status, comment } = req.body;
  const Maintenance = req.models.Maintenance;

  try {
    // Validate required fields
    if (!status) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Status is required",
      });
    }

    // Validate status value
    const validStatuses = ["Pending", "In Progress", "Completed", "Deferred"];
    if (!validStatuses.includes(status)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Find and update the maintenance task
    const updatedMaintenance = await Maintenance.findByIdAndUpdate(
      id,
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
        $push: {
          comments: {
            text: comment,
            createdAt: new Date(),
            status: status,
          },
        },
      },
      { new: true }
    );

    if (!updatedMaintenance) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Maintenance task not found",
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Maintenance status updated successfully",
      data: updatedMaintenance,
    });
  } catch (error) {
    console.error("Error updating maintenance status:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update maintenance status",
      error: error.message,
    });
  }
};

export { updateMaintenanceStatus };
