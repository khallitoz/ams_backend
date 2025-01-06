import mongoose from "mongoose";

const SoftwareDetailSchema = new mongoose.Schema(
  {
    hardwareId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hardware",
      required: true,
    },
    softwareId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AllSoftwares", // Reference to the Softwares collection
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

const installedSoftwares = mongoose.model(
  "installedSoftwares",
  SoftwareDetailSchema
);

export default installedSoftwares;
