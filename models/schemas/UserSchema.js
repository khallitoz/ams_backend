import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  clientId: {
    type: String,
    required: true,
  },
  firstLogin: {
    type: Boolean,
    default: false,
  },
  managerId: {
    type: String,
  },
});

export default UserSchema;
