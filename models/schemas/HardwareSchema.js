import mongoose from "mongoose";

// DEFINE ASSET-SPECIFIC SCHEMA
const HardwareSchema = new mongoose.Schema(
  {
    assetName: { type: String, required: true },
    assetType: { type: String, required: true },
    category: { type: String, required: false },
    condition: { type: String, required: true },
    assignedTo: { type: String, required: false },
    price: { type: Number, required: false },
    warrantyDate: { type: Date, required: true },
    warrantyType: { type: String, required: true },
    vendor: { type: String, required: false },
    serialNo: { type: String, required: true },
    modelNo: { type: String, required: false },
    model: { type: String, required: false },
    description: { type: String, required: false },
    images: { type: [String], required: false },
    invoices: { type: [String], required: false },
    manuals: { type: [String], required: false },
    location: { type: String, required: true },
    building: { type: String, required: true },
    room: { type: String, required: true },
    department: { type: String, required: true },
    uniqueId: { type: Number, unique: true },
    qrCode: { type: String, unique: true }, // Unique QR Code field
    checkoutstatus: {
      type: [String],
      enum: ["Check Out", "Check In", "InActive"],
      default: ["InActive"],
    },

    computerDetails: {
      os: { type: String },
      specificType: { type: String },
      processor: { type: String },
      memory: { type: String },
      ipAddress: { type: String },
    },
    routerDetails: {
      os: { type: String },
      osVersion: { type: String },
      ipAddress: { type: String },
    },
    networkDevice: {
      os: { type: String },
      osVersion: { type: String },
      ipAddress: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

// We'll handle the pre-save middleware in the createModels function
// to reference the correct Counter model from the same connection

export default HardwareSchema;
