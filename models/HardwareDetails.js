import mongoose from "mongoose";
import Counter from "./Counter.js";

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
    images: { type: [String], required: false },
    invoices: { type: [String], required: false },
    manuals: { type: [String], required: false },
    location: { type: String, required: true },
    building: { type: String, required: true },
    room: { type: String, required: true },
    department: { type: String, required: true },
    assetCount: { type: Number, default: 0 },
    uniqueId: { type: Number, unique: true },

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

assetSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      // Increment counter for Hardware model
      const counter = await Counter.findOneAndUpdate(
        { modelName: "Hardware" }, 
        { $inc: { count: 1 } }, 
        { new: true, upsert: true } 
      );

      if (!counter) {
        throw new Error(
          "Counter document not initialized. Run the initializer."
        );
      }

      this.uniqueId = counter.count; 
      next();
    } catch (error) {
      console.error("Error generating unique ID:", error.message);
      next(error);
    }
  } else {
    next();
  }
});
export default mongoose.model("Hardware", assetSchema);
