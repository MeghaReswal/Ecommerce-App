import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new ApiError(401, "No token provided");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default auth;
