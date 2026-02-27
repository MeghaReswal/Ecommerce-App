import Stripe from 'stripe';
import Order from '../models/Order.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Payment Intent (for Stripe)
export const createPaymentIntent = async (req, res, next) => {
  try {
    const { orderId, amount } = req.body;

    if (!orderId || !amount) {
      throw new ApiError(400, 'Order ID and amount are required');
    }

    // Get order
    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Check ownership
    if (order.userId.toString() !== req.userId) {
      throw new ApiError(403, 'Access denied');
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Amount in cents
      currency: 'usd',
      metadata: {
        orderId: orderId,
        userId: req.userId,
      },
    });

    res.status(200).json(
      new ApiResponse(
        200,
        {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        },
        'Payment intent created successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Confirm Payment (for Stripe)
export const confirmPayment = async (req, res, next) => {
  try {
    const { orderId, paymentIntentId } = req.body;

    // Get payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new ApiError(400, 'Payment not successful');
    }

    // Update order
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: 'completed',
        paymentId: paymentIntentId,
        transactionId: paymentIntent.charges.data[0].id,
        status: 'processing',
      },
      { new: true }
    ).populate('items.productId');

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    res.status(200).json(
      new ApiResponse(200, order, 'Payment confirmed successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Get Payment Status
export const getPaymentStatus = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.params;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
        },
        'Payment status retrieved successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Razorpay Payment Intent (Alternative)
export const createRazorpayPaymentIntent = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    // Get order
    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Check ownership
    if (order.userId.toString() !== req.userId) {
      throw new ApiError(403, 'Access denied');
    }

    // In a real implementation, you would call Razorpay API here
    // For now, returning a mock response
    const options = {
      amount: Math.round(order.total * 100), // Amount in paise
      currency: 'INR',
      receipt: `order_${order._id}`,
      notes: {
        orderId: order._id,
        userId: req.userId,
      },
    };

    // Mock Razorpay order ID
    const razorpayOrderId = `order_${Date.now()}`;

    res.status(200).json(
      new ApiResponse(
        200,
        {
          razorpayOrderId,
          amount: order.total,
          currency: 'INR',
          keyId: process.env.RAZORPAY_KEY_ID,
        },
        'Razorpay payment intent created successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Verify Razorpay Payment
export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { orderId, razorpayPaymentId, razorpaySignature } = req.body;

    // In a real implementation, verify the signature with Razorpay
    // For demo purposes, we'll just update the order status

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: 'completed',
        paymentId: razorpayPaymentId,
        transactionId: razorpayPaymentId,
        status: 'processing',
      },
      { new: true }
    ).populate('items.productId');

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    res.status(200).json(
      new ApiResponse(200, order, 'Razorpay payment verified successfully')
    );
  } catch (error) {
    next(error);
  }
};

export default {
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  createRazorpayPaymentIntent,
  verifyRazorpayPayment,
};
