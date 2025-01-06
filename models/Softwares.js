import mongoose from "mongoose";

const SoftwareDetailSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    vendor: { type: String, required: true },
    date: { type: Date, required: true },
    licenseType: { type: String, required: true },
    price: { type: Number, required: true },
    assignedQuantity: { type: Number },
    spares: { type: Number },
    installedDate: { type: String, default: null },
    expiredDate: { type: String, default: null },
    serviceSupportDate: { type: String, default: null },
    quantity: { type: Number, required: true },
    totalCost: { type: Number, required: true },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

const Softwares = mongoose.model("AllSoftwares", SoftwareDetailSchema);

export default Softwares;
