import Softwares from "../models/Softwares.js";
import installedSoftwares from "../models/InstallSoftware.js";
import { StatusCodes } from "http-status-codes";

const validateForm = (values) => {
  const errors = {};

  if (!values.name.trim()) errors.name = "Software name is required.";
  if (!values.vendor.trim()) errors.vendor = "Vendor is required.";
  if (!values.licenseType.trim()) errors.vendor = "License is required.";

  if (!values.quantity || values.quantity <= 0) {
    errors.quantity = "Quantity must be a valid positive number.";
  }

  if (!values.price || values.price <= 0) {
    errors.price = "Price must be a valid positive number.";
  }

  if (!values.date.trim()) {
    errors.date = "Date is required.";
  }

  // Conditional Validations
  if (values.licenseType === "Perpetual" && !values.serviceSupportDate) {
    errors.serviceSupportDate = "Service Support Date is required.";
  }

  if (values.licenseType === "Subscription") {
    if (!values.installedDate) {
      errors.installedDate = "Installed Date is required.";
    }
    if (!values.expiredDate) {
      errors.expiredDate = "Expired Date is required.";
    }
  }

  return errors;
};

const addSoftware = async (req, res) => {
  try {
    const AllSoftwares = req.models.AllSoftwares;
    const errors = validateForm(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }
    const { price, quantity } = req.body;
    const totalCost = price * quantity;

    const softwaresInstalled = new AllSoftwares({
      ...req.body,
      totalCost: totalCost,
      assignedQuantity: 0,
      spares: quantity,
    });

    await softwaresInstalled.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Software add successfully",
    });
  } catch (error) {
    console.error(" Error in addSoftwareDetails:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error occurred.",
      error: error.message,
    });
  }
};

const retrieveSoftwareList = async (req, res) => {
  try {
    const AllSoftwares = req.models.AllSoftwares;
    const retrievedSoftware = await AllSoftwares.find();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Software retrieved successfully",
      data: retrievedSoftware,
    });
  } catch (error) {
    console.error(" Error in addSoftwareDetails:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error occurred.",
      error: error.message,
    });
  }
};

const updateSoftware = async (req, res) => {
  const { id } = req.params;

  try {
    const errors = validateForm(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const softwareDetail = await Softwares.findById(id);
    if (!softwareDetail) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Software not found.",
      });
    }
    const { quantity, price } = req.body;
    const Assigned = softwareDetail.assignedQuantity;
    if (quantity < Assigned) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message:
          "Please unassign all hardware devices before modifying the quantity",
      });
    }

    const newTotalCost = quantity * price;
    const spares = quantity - softwareDetail.assignedQuantity;

    const updatedSoftware = await Softwares.findByIdAndUpdate(
      id,
      {
        ...req.body,
        totalCost: newTotalCost,
        spares: spares,
      },
      { new: true, runValidators: true }
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Software Updated",
      data: updatedSoftware,
    });
  } catch (error) {
    console.error("Error updating hardware:", error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update software details.",
      error: error.message,
    });
  }
};

export { addSoftware, retrieveSoftwareList, updateSoftware };
