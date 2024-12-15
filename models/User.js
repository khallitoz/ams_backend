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

UserSchema.pre("save", async function () {
  if (!this.isModified("password") || this.googleUserId) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.createJWT = function () {
  return jwt.sign(
    { userId: this._id, role: this.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: "1h" } // Fixed expiration time of 1 hour
  );
};

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

export default mongoose.model("User", UserSchema);
