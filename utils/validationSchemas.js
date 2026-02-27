import Joi from 'joi';

const validationSchemas = {
  // User Validation
  registerUser: Joi.object({
    firstName: Joi.string().required().min(2).max(50).messages({
      'string.empty': 'First name is required',
      'string.min': 'First name must be at least 2 characters',
    }),
    lastName: Joi.string().required().min(2).max(50),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email',
    }),
    password: Joi.string().required().min(6).messages({
      'string.min': 'Password must be at least 6 characters',
    }),
    phone: Joi.string().optional(),
  }),

  loginUser: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  verifyOTP: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required().messages({
      'string.length': 'OTP must be 6 digits',
    }),
  }),

  updateProfile: Joi.object({
    firstName: Joi.string().min(2).max(50),
    lastName: Joi.string().min(2).max(50),
    phone: Joi.string().optional(),
    address: Joi.object({
      street: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      postalCode: Joi.string().optional(),
      country: Joi.string().optional(),
    }).optional(),
  }),

  // Product Validation
  createProduct: Joi.object({
    name: Joi.string().required().min(3).max(200),
    description: Joi.string().required().min(10),
    price: Joi.number().required().min(0),
    originalPrice: Joi.number().optional(),
    discount: Joi.number().optional().min(0).max(100),
    category: Joi.string().required(),
    stock: Joi.number().required().min(0),
    sku: Joi.string().optional(),
    attributes: Joi.object({
      size: Joi.array().items(Joi.string()).optional(),
      color: Joi.array().items(Joi.string()).optional(),
      material: Joi.string().optional(),
      weight: Joi.string().optional(),
    }).optional(),
  }),

  updateProduct: Joi.object({
    name: Joi.string().min(3).max(200),
    description: Joi.string().min(10),
    price: Joi.number().min(0),
    originalPrice: Joi.number().optional(),
    discount: Joi.number().min(0).max(100),
    category: Joi.string(),
    stock: Joi.number().min(0),
    sku: Joi.string().optional(),
    attributes: Joi.object({
      size: Joi.array().items(Joi.string()).optional(),
      color: Joi.array().items(Joi.string()).optional(),
      material: Joi.string().optional(),
      weight: Joi.string().optional(),
    }).optional(),
  }),

  // Category Validation
  createCategory: Joi.object({
    name: Joi.string().required().min(2).max(100),
    description: Joi.string().optional().max(500),
  }),

  // Cart Validation
  addToCart: Joi.object({
    productId: Joi.string().required(),
    quantity: Joi.number().required().min(1),
    selectedAttributes: Joi.object({
      size: Joi.string().optional(),
      color: Joi.string().optional(),
    }).optional(),
  }),

  updateCartItem: Joi.object({
    quantity: Joi.number().required().min(1),
  }),

  // Order Validation
  createOrder: Joi.object({
    shippingAddress: Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().required(),
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      postalCode: Joi.string().required(),
      country: Joi.string().required(),
    }).required(),
    billingAddress: Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      postalCode: Joi.string().required(),
      country: Joi.string().required(),
    }).optional(),
    paymentMethod: Joi.string()
      .required()
      .valid('credit_card', 'debit_card', 'upi', 'paypal', 'wallet'),
  }),
};

export default validationSchemas;
