import Softwares from "../models/Softwares.js";
import { StatusCodes } from "http-status-codes";

const validateForm = (values) => {
  const errors = {};

  if (!values.name.trim()) newErrors.name = "Software name is required.";
  if (!values.vendor.trim()) newErrors.vendor = "Vendor is required.";
  if (!values.licenseType.trim()) newErrors.vendor = "License is required.";

  if (!values.quantity || values.quantity <= 0) {
    newErrors.quantity = "Quantity must be a valid positive number.";
  }

  if (!values.price || values.price <= 0) {
    newErrors.price = "Price must be a valid positive number.";
  }

  if (!values.date.trim()) {
    newErrors.date = "Date is required.";
  }

  return errors;
};

const addSoftware = async (req, res) => {
  try {
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

    const softwaresInstalled = new Softwares({
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
    const retrievedSoftware = await Softwares.find();

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

export { addSoftware, retrieveSoftwareList };
