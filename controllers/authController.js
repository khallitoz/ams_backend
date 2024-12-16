import requestIp from "request-ip";
import User from "../models/User.js";
import axios from "axios";
import BadRequestError from "../errors/bad-request.js";
import sendMail from "../utils/sendMail.js";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import emailvalidator from "email-validator";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
// import Logs from "../models/Logs.js";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

// Login a user with Google OAuth token
const loginUser = async (req, res) => {
  const { access_token } = req.body;

  if (!access_token) {
    throw new BadRequestError("Access token is required");
  }

  const userIp = requestIp.getClientIp(req);

  try {
    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const { email, name, sub, picture } = response.data;

    let user = await User.findOne({ email });

    if (user) {
      if (user.googleUserId && user.googleUserId !== sub) {
        throw new BadRequestError("Invalid Credentials: Google ID mismatch");
      }

      await Logs.create({
        user: user._id,
        username: user.username,
        action: "login",
        timestamp: new Date(),
        ipAddress: userIp,
      });

      await sendMail(email, {
        subject: "Sucessfully SignIn",
        content: `<div><p>You have successfully sign in to Time tracker</p><p>Thank you for using Time Tracker!</p></div>`,
      });
      const token = jwt.sign(
        { userId: user._id, username: user.username, role: user.role },
        process.env.JWT_SECRET
      );

      return res.status(StatusCodes.OK).json({
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          picture: picture,
          role: user.role,
        },
        token,
      });
    }

    user = await User.create({
      email,
      username: name,
      googleUserId: sub,
    });

    await Logs.create({
      user: user._id,
      username: user.username,
      action: "login",
      timestamp: new Date(),
      ipAddress: userIp,
    });
    await sendMail(email, {
      subject: "Sucessfully SignIn",
      content: `<div><p>You have successfully sign in to Time tracker</p></div>`,
    });
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(StatusCodes.OK).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        picture: picture,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const logout = async (req, res) => {
  const userIp = requestIp.getClientIp(req);
  const { id, email } = req.body;

  const user = await User.findById(id);
  const username = user.username;

  await Logs.create({
    user: id,
    username: username,
    action: "logout",
    timestamp: new Date(),
    ipAddress: userIp,
  });
  await sendMail(email, {
    subject: "Sucessfully Signout",
    content: `<div><p>You have successfully sign out of Time tracker</p></div>`,
  });

  res.status(StatusCodes.OK).json({
    success: true,
  });
};

// Admin login
const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  if (username !== "admin") {
    throw new BadRequestError(
      "Invalid credentials, please contact the system administrator"
    );
  }

  const user = await User.findOne({ username }).select("+password");

  if (!user) {
    throw new BadRequestError("Invalid credentials");
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new BadRequestError("Invalid credentials");
  }

  res.status(StatusCodes.OK).json({
    username: user.username,
  });
};

export { loginUser, loginAdmin, logout };
