import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide a username"],
    minlength: 3,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please provide a valid email"],
    validate: {
      validator: validator.isEmail,
      message: "Please provide a valid email",
    },
    trim: true,
    unique: true,
  },
  googleUserId: {
    type: String,
    unique: true,
    sparse: true,
  },
  password: {
    type: String,
    minlength: 8,
    select: false,
    required: function () {
      return !this.googleUserId;
    },
  },
  verified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: [String],
    enum: ["user", "admin", "moderator"],
    default: ["user"],
  },
});

// We'll attach these methods when creating the model in createModels
UserSchema.methods = {
  createJWT: function () {
    return jwt.sign(
      {
        userId: this._id,
        role: this.isAdmin,
        client_id: this._id.toString(),
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Fixed expiration time of 1 hour
    );
  },
  comparePassword: async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  },
};

export default UserSchema;
