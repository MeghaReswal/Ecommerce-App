import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// Create Order
export const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, billingAddress, paymentMethod } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ userId: req.userId }).populate('items.productId');

    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, 'Cart is empty');
    }

    // Validate stock for all items
    for (const item of cart.items) {
      const product = item.productId;
      if (product.stock < item.quantity) {
        throw new ApiError(
          400,
          `Insufficient stock for ${product.name}. Available: ${product.stock}`
        );
      }
    }

    // Calculate order total
    const subtotal = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
    const tax = subtotal * 0.1; // 10% tax
    const shippingCost = subtotal > 1000 ? 0 : 100; // Free shipping for orders > 1000
    const discount = cart.totalDiscount || 0;
    const total = subtotal + tax + shippingCost - discount;

    // Create order
    const order = await Order.create({
      userId: req.userId,
      items: cart.items.map((item) => ({
        productId: item.productId._id,
        productName: item.productId.name,
        quantity: item.quantity,
        price: item.price,
        selectedAttributes: item.selectedAttributes,
      })),
      subtotal,
      tax,
      shippingCost,
      discount,
      total,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod,
      paymentStatus: 'pending',
      status: 'pending',
    });

    // Reduce product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.productId._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear cart
    await Cart.findOneAndUpdate({ userId: req.userId }, { items: [], totalPrice: 0 });

    res.status(201).json(
      new ApiResponse(201, order, 'Order created successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Get Order by ID
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId')
      .populate('items.productId');

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Check ownership
    if (order.userId._id.toString() !== req.userId && req.userRole !== 'admin') {
      throw new ApiError(403, 'Access denied');
    }

    res.status(200).json(
      new ApiResponse(200, order, 'Order retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Get User Orders
export const getUserOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = { userId: req.userId };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('items.productId')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(filter);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          orders,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit),
          },
        },
        'Orders retrieved successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Get All Orders (Admin only)
export const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, paymentStatus, sortBy = '-createdAt' } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const orders = await Order.find(filter)
      .populate('userId')
      .populate('items.productId')
      .limit(limit)
      .skip(skip)
      .sort(sortBy);

    const total = await Order.countDocuments(filter);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          orders,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit),
          },
        },
        'Orders retrieved successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Update Order Status (Admin only)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, 'Invalid order status');
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('items.productId');

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    res.status(200).json(
      new ApiResponse(200, order, 'Order status updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Update Payment Status (Admin only)
export const updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus, transactionId } = req.body;

    const validPaymentStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      throw new ApiError(400, 'Invalid payment status');
    }

    const updateData = { paymentStatus };
    if (transactionId) updateData.transactionId = transactionId;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('items.productId');

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    res.status(200).json(
      new ApiResponse(200, order, 'Payment status updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Cancel Order
export const cancelOrder = async (req, res, next) => {
  try {
    const { cancelReason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Check ownership
    if (order.userId.toString() !== req.userId && req.userRole !== 'admin') {
      throw new ApiError(403, 'Access denied');
    }

    if (['delivered', 'cancelled', 'returned'].includes(order.status)) {
      throw new ApiError(400, 'Cannot cancel this order');
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = cancelReason || '';

    if (order.paymentStatus === 'completed') {
      order.paymentStatus = 'refunded';
      order.refundAmount = order.total;
    }

    await order.save();

    res.status(200).json(
      new ApiResponse(200, order, 'Order cancelled successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Track Order
export const trackOrder = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;

    const order = await Order.findOne({ orderNumber })
      .populate('items.productId')
      .select('-userId');

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    res.status(200).json(
      new ApiResponse(200, order, 'Order tracking data retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

export default {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  trackOrder,
};
