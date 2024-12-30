import mongoose from "mongoose";

const SoftwareDetailSchema = new mongoose.Schema(
  {
    hardwareId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hardware",
      required: true,
    },
    software: { type: [String], required: true },

    date: { type: Date, required: true },
    status: { type: String, required: true },
    license: { type: String, required: true },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

const SoftwareDetail = mongoose.model("Softwares", SoftwareDetailSchema);

export default SoftwareDetail;
