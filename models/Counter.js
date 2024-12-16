import mongoose from "mongoose";

// Schema for counters to maintain sequential IDs for models
const counterSchema = new mongoose.Schema({
  modelName: { type: String, required: true, unique: true },
  count: { type: Number, required: true, default: 0 }, // Tracks the current count
});

export default mongoose.model("Counter", counterSchema);
