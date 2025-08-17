import mongoose, { Document, Schema } from "mongoose";

export interface IOrder extends Document {
  _id: string;
  orderCode: string;
  userId: string;
  movieId: string;
  theaterId: string;
  showtimeId: string;
  seats: string[];
  foodCombos: Array<{
    comboId: string;
    quantity: number;
    price: number;
  }>;
  voucherId?: string;
  voucherDiscount: number;
  ticketPrice: number;
  comboPrice: number;
  totalAmount: number;
  finalAmount: number;
  paymentMethod: "MOMO" | "VNPAY";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED";
  orderStatus: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  customerInfo: {
    fullName: string;
    phoneNumber: string;
    email: string;
  };
  paymentInfo?: {
    transactionId?: string;
    paymentDate?: Date;
    paymentGatewayResponse?: any;
  };
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    orderCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movies",
      required: true,
    },
    theaterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theater",
      required: true,
    },
    showtimeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Showtime",
      required: true,
    },
    seats: [
      {
        type: String,
        required: true,
      },
    ],
    foodCombos: [
      {
        comboId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "FoodCombo",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    voucherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
      required: false,
    },
    voucherDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    ticketPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    comboPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["MOMO", "VNPAY"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "CANCELLED", "REFUNDED"],
      default: "PENDING",
      index: true,
    },
    orderStatus: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
      default: "PENDING",
      index: true,
    },
    customerInfo: {
      fullName: {
        type: String,
        required: true,
        trim: true,
      },
      phoneNumber: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
    },
    paymentInfo: {
      transactionId: {
        type: String,
        sparse: true,
      },
      paymentDate: {
        type: Date,
      },
      paymentGatewayResponse: {
        type: mongoose.Schema.Types.Mixed,
      },
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better performance
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1, orderStatus: 1 });
OrderSchema.index({ expiresAt: 1 });

// Generate unique order code before saving
OrderSchema.pre("save", async function (next) {
  if (this.isNew && !this.orderCode) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    this.orderCode = `CJ${timestamp}${random}`.toUpperCase();
  }
  next();
});

export default mongoose.model<IOrder>("Order", OrderSchema);
