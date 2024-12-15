import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

const adminChecker = (err, req, res, next) => {
  try {
    const token = req.headers["Authorization"]?.replace("Bearer ", "");
    const tokenData = jwt.verify(token, process.env.JWT_SECRET);
    req.tokenData = tokenData;
    if(!req.tokenData.isAdmin){
        res.status(500).json()
    }
    next();
  } catch (error) {
    res.status(500).json({ msg: "There is an issue with your token" });
  }
};

export default adminChecker;