import Category from '../models/Category.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// Create Category (Admin only)
export const createCategory = async (req, res, next) => {
  try {
    const { name, description, image } = req.body;

    // Check if category already exists
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      throw new ApiError(400, 'Category already exists');
    }

    const category = await Category.create({
      name,
      description: description || '',
      image: image || null,
    });

    res.status(201).json(
      new ApiResponse(201, category, 'Category created successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Get All Categories
export const getAllCategories = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const categories = await Category.find({ isActive: true })
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Category.countDocuments({ isActive: true });

    res.status(200).json(
      new ApiResponse(
        200,
        {
          categories,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit),
          },
        },
        'Categories retrieved successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Get Category by ID
export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category || !category.isActive) {
      throw new ApiError(404, 'Category not found');
    }

    res.status(200).json(
      new ApiResponse(200, category, 'Category retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Get Category by Slug
export const getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });

    if (!category || !category.isActive) {
      throw new ApiError(404, 'Category not found');
    }

    res.status(200).json(
      new ApiResponse(200, category, 'Category retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Update Category (Admin only)
export const updateCategory = async (req, res, next) => {
  try {
    const { name, description, image } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, image },
      { new: true, runValidators: true }
    );

    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    res.status(200).json(
      new ApiResponse(200, category, 'Category updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Delete Category (Admin only)
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    res.status(200).json(
      new ApiResponse(200, category, 'Category deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

export default {
  createCategory,
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
};
