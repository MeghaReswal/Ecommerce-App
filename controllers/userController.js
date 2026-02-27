import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// Get User Profile
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.status(200).json(
      new ApiResponse(200, user, 'User profile retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Update User Profile
export const updateUserProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, address, profileImage } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (profileImage) updateData.profileImage = profileImage;

    const user = await User.findByIdAndUpdate(req.userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.status(200).json(
      new ApiResponse(200, user, 'User profile updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Delete User Account
export const deleteUserAccount = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.userId);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.status(200).json(
      new ApiResponse(200, {}, 'User account deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Get All Users (Admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const users = await User.find().limit(limit).skip(skip).sort({ createdAt: -1 });
    const total = await User.countDocuments();

    res.status(200).json(
      new ApiResponse(
        200,
        {
          users,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit),
          },
        },
        'Users retrieved successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Get User by ID (Admin only)
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.status(200).json(
      new ApiResponse(200, user, 'User retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Update User Role (Admin only)
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      throw new ApiError(400, 'Invalid role');
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.status(200).json(
      new ApiResponse(200, user, 'User role updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Deactivate User Account (Admin only)
export const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.status(200).json(
      new ApiResponse(200, user, 'User account deactivated successfully')
    );
  } catch (error) {
    next(error);
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  getAllUsers,
  getUserById,
  updateUserRole,
  deactivateUser,
};
