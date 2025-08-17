import Order, { IOrder } from "../models/Order";
import Payment from "../models/Payment";
import { FoodCombo } from "../models/FoodCombo";
import { Voucher } from "../models/Voucher";
import mongoose from "mongoose";

export interface CreateOrderData {
  userId: string;
  movieId: string;
  theaterId: string;
  showtimeId: string;
  seats: string[];
  foodCombos: Array<{
    comboId: string;
    quantity: number;
  }>;
  voucherId?: string;
  paymentMethod: "MOMO" | "VNPAY";
  customerInfo: {
    fullName: string;
    phoneNumber: string;
    email: string;
  };
  seatPrice: number;
}

export interface UpdateOrderData {
  paymentStatus?: "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED";
  orderStatus?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  paymentInfo?: {
    transactionId?: string;
    paymentDate?: Date;
    paymentGatewayResponse?: any;
  };
}

class OrderService {
  // Tạo order mới
  async createOrder(orderData: CreateOrderData): Promise<IOrder> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Tính toán giá combo
      let comboPrice = 0;
      const combosWithPrice = [];

      for (const combo of orderData.foodCombos) {
        const foodCombo = await FoodCombo.findById(combo.comboId).session(
          session
        );
        if (!foodCombo) {
          throw new Error(`Combo không tồn tại: ${combo.comboId}`);
        }

        if (foodCombo.quantity < combo.quantity) {
          throw new Error(`Combo ${foodCombo.name} không đủ số lượng`);
        }

        const comboTotal = foodCombo.price * combo.quantity;
        comboPrice += comboTotal;

        combosWithPrice.push({
          comboId: combo.comboId,
          quantity: combo.quantity,
          price: foodCombo.price,
        });

        // Cập nhật số lượng combo
        await FoodCombo.findByIdAndUpdate(
          combo.comboId,
          { $inc: { quantity: -combo.quantity } },
          { session }
        );
      }

      // Tính toán giá vé
      const ticketPrice = orderData.seats.length * orderData.seatPrice;
      const totalAmount = ticketPrice + comboPrice;

      // Tính toán voucher discount
      let voucherDiscount = 0;
      if (orderData.voucherId) {
        const voucher = await Voucher.findById(orderData.voucherId).session(
          session
        );
        if (voucher && voucher.quantity > 0) {
          const now = new Date();
          if (
            now >= voucher.validityPeriod.startDate &&
            now <= voucher.validityPeriod.endDate
          ) {
            voucherDiscount = Math.round(
              (totalAmount * voucher.discountPercent) / 100
            );
          }
        }
      }

      const finalAmount = totalAmount - voucherDiscount;

      // Tạo order với thời gian hết hạn 10 phút
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      const newOrder = new Order({
        userId: orderData.userId,
        movieId: orderData.movieId,
        theaterId: orderData.theaterId,
        showtimeId: orderData.showtimeId,
        seats: orderData.seats,
        foodCombos: combosWithPrice,
        voucherId: orderData.voucherId,
        voucherDiscount,
        ticketPrice,
        comboPrice,
        totalAmount,
        finalAmount,
        paymentMethod: orderData.paymentMethod,
        customerInfo: orderData.customerInfo,
        expiresAt,
      });

      const savedOrder = await newOrder.save({ session });
      await session.commitTransaction();

      return savedOrder;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Lấy tất cả orders
  async getAllOrders(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    orders: IOrder[];
    totalPages: number;
    currentPage: number;
    totalOrders: number;
  }> {
    const skip = (page - 1) * limit;

    const [orders, totalOrders] = await Promise.all([
      Order.find()
        .populate("userId", "fullName email phoneNumber")
        .populate("movieId", "title poster duration")
        .populate("theaterId", "name location")
        .populate("showtimeId", "startTime date")
        .populate("foodCombos.comboId", "name price")
        .populate("voucherId", "code discountPercent")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(),
    ]);

    return {
      orders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
      totalOrders,
    };
  }

  // Lấy order theo ID
  async getOrderById(orderId: string): Promise<IOrder | null> {
    return await Order.findById(orderId)
      .populate("userId", "fullName email phoneNumber")
      .populate("movieId", "title poster duration")
      .populate("theaterId", "name location")
      .populate("showtimeId", "startTime date")
      .populate("foodCombos.comboId", "name price")
      .populate("voucherId", "code discountPercent");
  }

  // Lấy order theo orderCode
  async getOrderByCode(orderCode: string): Promise<IOrder | null> {
    return await Order.findOne({ orderCode })
      .populate("userId", "fullName email phoneNumber")
      .populate("movieId", "title poster duration")
      .populate("theaterId", "name location")
      .populate("showtimeId", "startTime date")
      .populate("foodCombos.comboId", "name price")
      .populate("voucherId", "code discountPercent");
  }

  // Lấy orders theo userId
  async getOrdersByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    orders: IOrder[];
    totalPages: number;
    currentPage: number;
    totalOrders: number;
  }> {
    const skip = (page - 1) * limit;

    const [orders, totalOrders] = await Promise.all([
      Order.find({ userId })
        .populate("movieId", "title poster duration")
        .populate("theaterId", "name location")
        .populate("showtimeId", "startTime date")
        .populate("foodCombos.comboId", "name price")
        .populate("voucherId", "code discountPercent")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ userId }),
    ]);

    return {
      orders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
      totalOrders,
    };
  }

  // Cập nhật order
  async updateOrder(
    orderId: string,
    updateData: UpdateOrderData
  ): Promise<IOrder | null> {
    return await Order.findByIdAndUpdate(
      orderId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate("userId", "fullName email phoneNumber")
      .populate("movieId", "title poster duration")
      .populate("theaterId", "name location")
      .populate("showtimeId", "startTime date")
      .populate("foodCombos.comboId", "name price")
      .populate("voucherId", "code discountPercent");
  }

  // Hủy order
  async cancelOrder(orderId: string, reason?: string): Promise<IOrder | null> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await Order.findById(orderId).session(session);
      if (!order) {
        throw new Error("Order không tồn tại");
      }

      if (order.orderStatus === "CANCELLED") {
        throw new Error("Order đã được hủy");
      }

      if (order.paymentStatus === "PAID") {
        throw new Error("Không thể hủy order đã thanh toán");
      }

      // Hoàn lại số lượng combo
      for (const combo of order.foodCombos) {
        await FoodCombo.findByIdAndUpdate(
          combo.comboId,
          { $inc: { quantity: combo.quantity } },
          { session }
        );
      }

      // Cập nhật trạng thái order
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          $set: {
            orderStatus: "CANCELLED",
            paymentStatus: "CANCELLED",
          },
        },
        { new: true, session }
      );

      await session.commitTransaction();
      return updatedOrder;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Xóa order
  async deleteOrder(orderId: string): Promise<boolean> {
    const result = await Order.findByIdAndDelete(orderId);
    return !!result;
  }

  // Lấy thống kê orders
  async getOrderStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    todayOrders: number;
    todayRevenue: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      todayStats,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: "PAID" } },
        { $group: { _id: null, total: { $sum: "$finalAmount" } } },
      ]),
      Order.countDocuments({ orderStatus: "PENDING" }),
      Order.countDocuments({ orderStatus: "COMPLETED" }),
      Order.countDocuments({ orderStatus: "CANCELLED" }),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: today, $lt: tomorrow },
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [{ $eq: ["$paymentStatus", "PAID"] }, "$finalAmount", 0],
              },
            },
          },
        },
      ]),
    ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      todayOrders: todayStats[0]?.count || 0,
      todayRevenue: todayStats[0]?.revenue || 0,
    };
  }
}

export default new OrderService();
