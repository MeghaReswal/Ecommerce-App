import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        selectedAttributes: {
          size: String,
          color: String,
        },
      },
    ],
    totalPrice: {
      type: Number,
      default: 0,
    },
    totalDiscount: {
      type: Number,
      default: 0,
    },
    couponCode: String,
    couponDiscount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index
cartSchema.index({ userId: 1 });

export default mongoose.model('Cart', cartSchema);
