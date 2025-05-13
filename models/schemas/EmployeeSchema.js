import mongoose from "mongoose";

// Employee Schema
const EmployeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    phone: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    position: {
      type: String,
      trim: true,
    },
    joinDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create indices for faster lookups
EmployeeSchema.index({ name: 1 });
EmployeeSchema.index({ email: 1 });
EmployeeSchema.index({ department: 1 });

export default EmployeeSchema;
