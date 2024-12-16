import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
const roleChecker = (roles) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "No token provided.",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userRole = decoded.role;

      if (!roles.includes(userRole)) {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: "You do not have permission to access this resource.",
        });
      }

      next();
    } catch (error) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Invalid user.",
      });
    }
  };
};

export default roleChecker;
