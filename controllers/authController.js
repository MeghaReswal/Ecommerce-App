import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { sendOTPEmail } from "../utils/sendEmail.js";
import { generateOTP } from "../utils/generateOTP.js";

// Register User
export const registerUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(400, "User with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(
      password,
      parseInt(process.env.BCRYPT_ROUNDS),
    );

    const defaultRole = await Role.findOne({ name: "user" });
    if (!defaultRole) {
      throw new ApiError(500, "Default role not found");
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone: phone || "",
      roles: [defaultRole._id],
    });

    // console.log("user", user);

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { email: user.email },
          "User registered successfully. Please login to continue.",
        ),
      );
  } catch (error) {
    next(error);
  }
};
// Login User (Generate OTP)
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }

    // Find user with password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    // Optional: block inactive users
    if (!user.isActive) {
      throw new ApiError(403, "Your account is inactive");
    }

    // Check password
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password");
    }

    // Generate OTP (secure version recommended)
    const otp = generateOTP(6);

    const otpHash = await bcryptjs.hash(
      otp,
      parseInt(process.env.BCRYPT_ROUNDS),
    );

    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save OTP in DB
    user.otpHash = otpHash;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    await sendOTPEmail(user.email, otp);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { email: user.email },
          "OTP sent successfully to your email",
        ),
      );
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email })
      .select("+otpHash +otpExpiry roles")
      .populate({
        path: "roles",
        populate: {
          path: "permissions",
          model: "Permission",
        },
      });

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    if (!user.otpHash || !user.otpExpiry) {
      throw new ApiError(401, "OTP not requested. Please login first.");
    }

    if (new Date() > user.otpExpiry) {
      throw new ApiError(401, "OTP has expired. Please login again.");
    }

    // Verify OTP
    const isOTPValid = await bcryptjs.compare(otp, user.otpHash);
    if (!isOTPValid) {
      throw new ApiError(401, "Invalid OTP");
    }

    // Gather permissions from all roles
    const permissions = user.roles.flatMap((role) =>
      role.permissions.map((permission) => permission.name),
    );

    // console.log("permissions34223", permissions);

    // Remove duplicate permissions
    const uniquePermissions = [...new Set(permissions)];

    // Clear OTP fields after successful verification
    await User.findByIdAndUpdate(user._id, {
      otpHash: null,
      otpExpiry: null,
    });

    // Generate JWT token including permissions array
    const token = jwt.sign(
      {
        id: user._id,
        permissions: uniquePermissions,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE },
    );

    res.status(200).json(
      new ApiResponse(
        200,
        { token, user: omitPassword(user) }, // make sure omitPassword excludes password and sensitive info
        "User logged in successfully",
      ),
    );
  } catch (error) {
    next(error);
  }
};

// Get User Profile
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user.id }) // safer than findById
      .select(
        "-password -otpHash -otpExpiry -passwordResetToken -passwordResetExpires",
      )
      .populate({
        path: "roles",
        populate: { path: "permissions", model: "Permission" },
      });

    if (!user) throw new ApiError(404, "User not found");

    res
      .status(200)
      .json(new ApiResponse(200, user, "User profile retrieved successfully"));
  } catch (error) {
    next(error);
  }
};

// Update User Profile
export const updateUserProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: phone || undefined,
        address: address || undefined,
      },
      { new: true, runValidators: true },
    );

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, user, "User profile updated successfully"));
  } catch (error) {
    next(error);
  }
};

// Change Password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId).select("+password");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Verify current password
    const isPasswordValid = await bcryptjs.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new ApiError(401, "Current password is incorrect");
    }

    // Hash new password
    user.password = await bcryptjs.hash(
      newPassword,
      parseInt(process.env.BCRYPT_ROUNDS),
    );
    user.passwordChangedAt = new Date();

    await user.save();

    res
      .status(200)
      .json(new ApiResponse(200, {}, "Password changed successfully"));
  } catch (error) {
    next(error);
  }
};

// Helper function to omit password
const omitPassword = (user) => {
  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};

export default {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
};
