import mongoose from "mongoose";

// Room Schema
const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
});

// Department Schema with nested rooms
const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  rooms: [roomSchema],
});

// Building Schema with nested departments
const buildingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  departments: [departmentSchema],
});

// Location Schema
const LocationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    buildings: [buildingSchema],
  },
  {
    timestamps: true,
  }
);

// Create indices for faster lookups
LocationSchema.index({ name: 1 });

export default LocationSchema;
