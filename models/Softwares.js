import mongoose from "mongoose";

const SoftwareDetailSchema = new mongoose.Schema(
  {
    software: { type: String, required: true },
    vendor: { type: String, required: true },
    date: { type: Date, required: true },
    licenseType: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

const Softwares = mongoose.model("AllSoftwares", SoftwareDetailSchema);

export default Softwares;
