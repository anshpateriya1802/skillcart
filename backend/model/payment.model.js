import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      required: true,
      uppercase: true,
      default: "INR",
      enum: ["INR", "USD"],
    },

    status: {
      type: String,
      required: true,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending",
      index: true,
    },

    // Gateway order / intent id
    orderId: {
      type: String,
      required: true,
      unique: true,
    },

    // Transaction id from gateway
    transactionId: {
      type: String,
      unique: true,
      sparse: true, // allows null until payment completes
    },

    receipt: {
      type: String,
      unique: true,
    },

    failureReason: {
      type: String,
      default: null,
    },

    metadata: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
    strict: "throw", // ❗ rejects unknown fields
  }
);

/**
 * Prevent duplicate successful payments
 */
paymentSchema.index(
  { user: 1, course: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "success" } }
);

export const Payment = mongoose.model("Payment", paymentSchema);
