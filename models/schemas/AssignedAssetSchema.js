import mongoose from "mongoose";

const AssignedAssetSchema = new mongoose.Schema(
  {
    hardwareId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hardware",
      required: true,
    },
    action: { type: String, required: true },
    assignedTo: { type: String, required: true },
    date: { type: Date, required: true },
    status: { type: String, required: true },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

export default AssignedAssetSchema;
