import Product from '../models/Product.js';
import Category from '../models/Category.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// Create Product (Admin only)
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, originalPrice, discount, category, stock, sku, attributes } =
      req.body;

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      throw new ApiError(404, 'Category not found');
    }

    const product = await Product.create({
      name,
      description,
      price,
      originalPrice: originalPrice || price,
      discount: discount || 0,
      category,
      stock,
      sku: sku || generateSKU(name),
      attributes: attributes || {},
      createdBy: req.userId,
    });

    await product.populate('category');

    res.status(201).json(
      new ApiResponse(201, product, 'Product created successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Get All Products
export const getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, category, search, sortBy = '-createdAt' } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(filter)
      .populate('category')
      .limit(limit)
      .skip(skip)
      .sort(sortBy)
      .exec();

    const total = await Product.countDocuments(filter);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          products,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit),
          },
        },
        'Products retrieved successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Get Product by ID
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');

    if (!product || !product.isActive) {
      throw new ApiError(404, 'Product not found');
    }

    res.status(200).json(
      new ApiResponse(200, product, 'Product retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Get Product by Slug
export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate('category');

    if (!product || !product.isActive) {
      throw new ApiError(404, 'Product not found');
    }

    res.status(200).json(
      new ApiResponse(200, product, 'Product retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Update Product (Admin only)
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if category exists if provided
    if (updateData.category) {
      const categoryExists = await Category.findById(updateData.category);
      if (!categoryExists) {
        throw new ApiError(404, 'Category not found');
      }
    }

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('category');

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    res.status(200).json(
      new ApiResponse(200, product, 'Product updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Delete Product (Admin only)
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    res.status(200).json(
      new ApiResponse(200, product, 'Product deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Search Products
export const searchProducts = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    if (!q) {
      throw new ApiError(400, 'Search query is required');
    }

    const products = await Product.find(
      { $text: { $search: q }, isActive: true },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .populate('category')
      .limit(limit)
      .skip(skip);

    const total = await Product.countDocuments({ $text: { $search: q }, isActive: true });

    res.status(200).json(
      new ApiResponse(
        200,
        {
          products,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit),
          },
        },
        'Search results retrieved successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Add Product Review
export const addProductReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      throw new ApiError(400, 'Rating must be between 1 and 5');
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // Check if user already reviewed
    const existingReview = product.reviews.find(
      (review) => review.userId.toString() === req.userId
    );

    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.comment = comment;
    } else {
      // Add new review
      product.reviews.push({
        userId: req.userId,
        rating,
        comment,
      });
    }

    // Calculate average rating
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.rating = totalRating / product.reviews.length;
    product.totalReviews = product.reviews.length;

    await product.save();

    res.status(200).json(
      new ApiResponse(200, product, 'Review added successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Get Products by Category
export const getProductsByCategory = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, sortBy = '-createdAt' } = req.query;
    const skip = (page - 1) * limit;

    const products = await Product.find({ category: req.params.categoryId, isActive: true })
      .populate('category')
      .limit(limit)
      .skip(skip)
      .sort(sortBy)
      .exec();

    const total = await Product.countDocuments({ category: req.params.categoryId, isActive: true });

    res.status(200).json(
      new ApiResponse(
        200,
        {
          products,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit),
          },
        },
        'Products retrieved successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Helper function to generate SKU
const generateSKU = (productName) => {
  return `SKU-${productName.substring(0, 3).toUpperCase()}-${Date.now()}`;
};

export default {
  createProduct,
  getAllProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  searchProducts,
  addProductReview,
  getProductsByCategory,
};
