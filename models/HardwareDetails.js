import mongoose from "mongoose";

// DEFINE ASSET-SPECIFIC SCHEMA
const assetSchema = new mongoose.Schema(
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
    status: { type: String, required: true },
    modelNo: { type: String, required: false },
    model: { type: String, required: false },
    description: { type: String, required: false },
    images: { type: [String], required: false }, // Store image file names
    invoices: { type: [String], required: false }, // Store invoice file names
    manuals: { type: [String], required: false }, // Store manual file names
    location: { type: String, required: true },
    building: { type: String, required: true },
    room: { type: String, required: true },
    department: { type: String, required: true },
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
    switchDetails: {
      os: { type: String },
      osVersion: { type: String },
      ipAddress: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Hardware", assetSchema);
