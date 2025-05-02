import mongoose from "mongoose";
import LocationSchema from "./schemas/LocationSchema.js";

// Room Schema
const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
});

// Building Schema with nested rooms
const buildingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  rooms: [roomSchema],
});

// Department Schema
const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
});

// Location Schema
const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    departments: [departmentSchema],
    buildings: [buildingSchema],
  },
  {
    timestamps: true,
  }
);

// Create indices for faster lookups
locationSchema.index({ name: 1 });
buildingSchema.index({ name: 1 });

export default mongoose.model("Location", LocationSchema);
