import mongoose from "mongoose";

const MaintenanceSchema = new mongoose.Schema(
  {
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      refPath: "assetType", // This will dynamically reference the model based on assetType
    },
    maintenanceId: {
      type: String,
      required: true,
      index: true,
    },
    taskName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    dueDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: "Due date must be in the future",
      },
    },
    assetType: {
      type: String,
      required: true,
      index: true,
      enum: ["Hardware", "Software"], // This ensures assetType is either Hardware or Software
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    assetName: {
      type: String,
      required: true,
      trim: true,
    },
    assignedTo: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "In Progress", "Completed", "Deferred"],
      default: "Pending",
      index: true,
    },
    priority: {
      type: String,
      required: true,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
      index: true,
    },
    comments: [
      {
        text: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["Pending", "In Progress", "Completed", "Deferred"],
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true, // This will automatically manage createdAt and updatedAt
    versionKey: false, // Removes the __v field
  }
);

export default MaintenanceSchema;
