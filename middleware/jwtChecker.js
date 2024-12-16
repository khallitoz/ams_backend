import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

const jwtChecker = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Token is required",
      });
    }

    const tokenData = jwt.verify(token, process.env.JWT_SECRET);
    req.tokenData = tokenData;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "There is an issue with your token",
      error: error.message,
    });
  }
};

export default jwtChecker;
