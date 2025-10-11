import Order, { IOrder } from "../models/Order";
import { UserVoucher } from "../models/UserVoucher";
import ShowtimeService from "./ShowtimeService";
import mongoose from "mongoose";

const showtimeService = new ShowtimeService();

export interface CreateOrderData {
  userId: string;
  movieId: string;
  theaterId: string;
  showtimeId: string;
  showDate: string;
  showTime: string;
  room: string;
  seats: Array<{
    seatId: string;
    type: string;
    price: number;
  }>;
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
}

export interface UpdateOrderData {
  paymentStatus?: "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED";
  orderStatus?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  paymentMethod?: "MOMO" | "VNPAY";
  paymentInfo?: {
    transactionId?: string;
    paymentDate?: Date;
    paymentGatewayResponse?: any;
  };
  expiresAt?: Date;
}

class OrderService {
  // Lấy lịch sử đặt vé của user
  async getUserBookingHistory(userId: string): Promise<IOrder[]> {
    try {
      const orders = await Order.find({
        userId: new mongoose.Types.ObjectId(userId),
        orderStatus: "CONFIRMED"
      })
      .populate({
        path: "movieId",
        select: "title poster duration genre ageRating posterImage"
      })
      .populate({
        path: "theaterId",
        select: "name"
      })
      .populate({
        path: "showtimeId",
        select: "showTimes"
      })
      .sort({ createdAt: -1 }) // Sắp xếp theo thời gian tạo mới nhất
      .lean();

      return orders;
    } catch (error) {
      console.error("Error getting user booking history:", error);
      throw error;
    }
  }

  // Get user order details by orderId
  async getUserOrderDetails(userId: string, orderId: string): Promise<IOrder | null> {
    try {
      const order = await Order.findOne({
        _id: new mongoose.Types.ObjectId(orderId),
        userId: new mongoose.Types.ObjectId(userId)
      })
      .populate({
        path: "movieId",
        select: "title poster duration genre ageRating posterImage"
      })
      .populate({
        path: "theaterId",
        select: "name"
      })
      .populate({
        path: "showtimeId",
        select: "showTimes"
      })
      .populate({
        path: "foodCombos.comboId",
        select: "name"
      })
      .lean();

      return order;
    } catch (error) {
      console.error("Error getting user order details:", error);
      throw error;
    }
  }

  // Tạo order mới
  async createOrder(orderData: CreateOrderData): Promise<{
    success: boolean;
    order?: IOrder;
    message?: string;
  }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Tính giá combo từ payload (giá đã được frontend gán theo bảng giá hiện hành)
      const combosWithPrice = orderData.foodCombos.map(combo => ({
        comboId: combo.comboId,
        quantity: combo.quantity,
        // Nếu frontend chưa gửi price, mặc định 0
        // @ts-ignore - interface cũ chưa có price trên orderData.foodCombos
        price: (combo as any).price || 0,
      }));
      const comboPrice = combosWithPrice.reduce((sum, c) => sum + (c.price || 0) * (c.quantity || 0), 0);

      // Tính toán giá vé từ seats array
      const ticketPrice = orderData.seats.reduce(
        (total, seat) => total + seat.price,
        0
      );
      const totalAmount = ticketPrice + comboPrice;

      // Tính toán voucher discount
      let voucherDiscount = 0;
      if (orderData.voucherId) { // orderData.voucherId thực chất là userVoucherId (ObjectId của UserVoucher)
        try {
          // Tìm UserVoucher trực tiếp bằng _id. KHÔNG populate voucherId ở đây
          // vì userVoucher.voucherId lưu detail._id, không phải _id của Voucher header.
        const userVoucher = await UserVoucher.findOne({
            _id: orderData.voucherId,
          userId: orderData.userId,
          status: "unused",
          }).session(session);

          if (userVoucher) {

            if (!userVoucher.voucherId) {
              // Điều này chỉ ra một document UserVoucher bị lỗi.
              throw new Error("UserVoucher document is missing voucherId.");
            }

            // Tìm Voucher document chính (header) chứa detail._id này
            const { Voucher } = await import("../models/Voucher");
            const voucherDoc = await Voucher.findOne({
              "lines.detail._id": userVoucher.voucherId // Sử dụng raw detail._id từ userVoucher
            }).session(session);

            let voucherDetail: any = null;
            let voucherLine: any = null; // Để lưu trữ đối tượng line cho validityPeriod

            if (voucherDoc) {
              // Tìm line chứa detail._id này
              const line = voucherDoc.lines?.find((l: any) => 
                l?.detail?._id?.toString() === userVoucher.voucherId.toString()
              );

              if (line && line.detail) {
                voucherDetail = line.detail; // Đây là đối tượng detail thực tế chúng ta cần
                voucherLine = line; // Lưu trữ line để lấy validityPeriod
                console.log(`  Found voucher detail in main Voucher document.`);
              } else {
                console.log(`  Could not find matching line detail in main Voucher document for ID: ${userVoucher.voucherId}`);
              }
            } else {
              console.log(`  Main Voucher document not found for detail ID: ${userVoucher.voucherId}`);
            }

            if (voucherDetail && voucherLine) { // Bây giờ 'voucherDetail' là đối tượng detail, và 'voucherLine' là line
          const now = new Date();

              const validityPeriod = voucherLine.validityPeriod; // Lấy validityPeriod từ đối tượng line

              if (
                voucherDetail.quantity > 0 &&
                validityPeriod && now >= new Date(validityPeriod.startDate) && now <= new Date(validityPeriod.endDate)
          ) {
            voucherDiscount = Math.round(
                  (totalAmount * voucherDetail.discountPercent) / 100
                );
                // Áp dụng giới hạn giảm giá tối đa
                if (voucherDetail.maxDiscountValue && voucherDiscount > voucherDetail.maxDiscountValue) {
                  voucherDiscount = voucherDetail.maxDiscountValue;
                }

              } else {
                console.log(`  Voucher is not valid (quantity, dates).`);
              }
            } else {
              console.log(`  Final voucher detail object or line is null, cannot calculate discount.`);
            }
          } else {
            console.log(`  UserVoucher not found for ID: ${orderData.voucherId}`);
          }
        } catch (error) {
          console.error(`❌ Error processing voucher:`, error);
          // Tiếp tục với voucherDiscount = 0 nếu có lỗi
        }
      }

      // Tính toán amount discount (khuyến mãi tiền dựa trên tổng đơn hàng)
      let amountDiscount = 0;
      let amountDiscountInfo = null;
      
      try {
        // Tìm các voucher có promotionType = "amount" và status = "hoạt động"
        const { Voucher } = await import("../models/Voucher");
        const activeAmountVouchers = await Voucher.find({
          "lines.promotionType": "amount",
          "lines.status": "hoạt động",
          status: "hoạt động"
        }).session(session);

        // Tìm amount discount phù hợp nhất (cao nhất nhưng không vượt quá totalAmount)
        for (const voucher of activeAmountVouchers) {
          for (const line of voucher.lines || []) {
            if (line.promotionType === "amount" && line.status === "hoạt động" && line.detail) {
              const detail = line.detail as any; // Type assertion để access amount fields
              const minOrderValue = detail.minOrderValue || 0;
              const discountValue = detail.discountValue || 0;
              const now = new Date();

              // Kiểm tra điều kiện thời gian và giá trị đơn hàng
              if (
                totalAmount >= minOrderValue &&
                discountValue > amountDiscount &&
                line.validityPeriod &&
                now >= new Date(line.validityPeriod.startDate) &&
                now <= new Date(line.validityPeriod.endDate)
              ) {
                amountDiscount = discountValue;
                amountDiscountInfo = {
                  description: detail.description || `Giảm ${discountValue.toLocaleString('vi-VN')}₫ cho hóa đơn từ ${minOrderValue.toLocaleString('vi-VN')}₫`,
                  minOrderValue,
                  discountValue,
                  exclusionGroup: line.rule?.exclusionGroup || null
                };
                console.log(`  ✅ Applied amount discount: ${discountValue}₫ (${amountDiscountInfo.description})`);
              }
            }
          }
        }

        // Cho phép áp dụng cả voucher và amount discount (không loại trừ)
        // Nếu cần logic exclusion group trong tương lai, có thể thêm điều kiện cụ thể
        console.log(`  ✅ Amount discount applied: ${amountDiscount}₫`);

      } catch (error) {
        console.error(`❌ Error processing amount discount:`, error);
        // Tiếp tục với amountDiscount = 0 nếu có lỗi
      }

      // Tính toán item promotions (khuyến mãi hàng)
      let itemPromotions = [];
      
      try {
        // Import VoucherService để sử dụng applyItemPromotions
        const VoucherServiceModule = await import("./VoucherService");
        const VoucherService = VoucherServiceModule.default;
        const voucherService = new VoucherService();
        
        // Chuyển đổi foodCombos thành format cần thiết cho API
        const selectedCombos = combosWithPrice.map(combo => ({
          comboId: combo.comboId,
          quantity: combo.quantity,
          name: 'Combo' // Tên sẽ được lấy từ database trong VoucherService
        }));
        
        if (selectedCombos.length > 0) {
          console.log(`🔍 Item Promotions Debug:`);
          console.log(`  Selected combos:`, selectedCombos);
          
          const promotionResult = await voucherService.applyItemPromotions(selectedCombos, []);
          
          if (promotionResult.status && promotionResult.data && promotionResult.data.applicablePromotions.length > 0) {
            itemPromotions = promotionResult.data.applicablePromotions.map((promotion: any) => ({
              description: promotion.detail?.description || `Tặng ${promotion.rewardQuantity} ${promotion.rewardItem}`,
              rewardItem: promotion.rewardItem,
              rewardQuantity: promotion.rewardQuantity,
              rewardType: promotion.rewardType
            }));
            
            console.log(`  ✅ Applied ${itemPromotions.length} item promotions:`, itemPromotions);
          } else {
            console.log(`  ℹ️ No applicable item promotions found`);
          }
        }
      } catch (error) {
        console.error(`❌ Error processing item promotions:`, error);
        // Tiếp tục với itemPromotions = [] nếu có lỗi
      }

      // Tính toán percent promotions (khuyến mãi chiết khấu)
      let percentPromotions = [];
      let percentDiscountAmount = 0;
      
      try {
        // Import VoucherService để sử dụng applyPercentPromotions
        const VoucherServiceModule = await import("./VoucherService");
        const VoucherService = VoucherServiceModule.default;
        const voucherService = new VoucherService();
        
        // Chuyển đổi foodCombos thành format cần thiết cho API (có thêm price)
        const selectedCombosWithPrice = combosWithPrice.map(combo => ({
          comboId: combo.comboId,
          quantity: combo.quantity,
          name: 'Combo', // Tên sẽ được lấy từ database trong VoucherService
          price: combo.price
        }));
        
        if (selectedCombosWithPrice.length > 0) {
          console.log(`🔍 Percent Promotions Debug:`);
          console.log(`  Selected combos with price:`, selectedCombosWithPrice);
          
          const percentResult = await voucherService.applyPercentPromotions(selectedCombosWithPrice, []);
          
          if (percentResult.status && percentResult.data && percentResult.data.applicablePromotions.length > 0) {
            percentPromotions = percentResult.data.applicablePromotions.map((promotion: any) => ({
              description: promotion.detail?.description || `Giảm ${promotion.discountPercent}% ${promotion.comboName}`,
              comboName: promotion.comboName,
              comboId: promotion.comboId,
              discountPercent: promotion.discountPercent,
              discountAmount: promotion.discountAmount
            }));
            
            percentDiscountAmount = percentResult.data.totalDiscountAmount || 0;
          } else {
            console.log(`  ℹ️ No applicable percent promotions found`);
          }
        }
      } catch (error) {
        console.error(`❌ Error processing percent promotions:`, error);
        // Tiếp tục với percentPromotions = [] nếu có lỗi
      }

      const finalAmount = totalAmount - voucherDiscount - amountDiscount - percentDiscountAmount;
    

      // Generate unique order code
      let orderCode: string;
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 5;

      while (!isUnique && attempts < maxAttempts) {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 7);
        orderCode = `CJ${timestamp}${random}`.toUpperCase();

        // Check if orderCode already exists
        const existingOrder = await Order.findOne({ orderCode }).session(
          session
        );
        if (!existingOrder) {
          isUnique = true;
        } else {
          attempts++;
          // Small delay to ensure different timestamp
          await new Promise((resolve) => setTimeout(resolve, 1));
        }
      }

      if (!isUnique) {
        await session.abortTransaction();
        return {
          success: false,
          message: "Không thể tạo mã đơn hàng unique sau nhiều lần thử",
        };
      }

      // Tạo order với thời gian hết hạn 1 giờ cho order chưa thanh toán
      // Chỉ set TTL cho order PENDING, CONFIRMED sẽ không bị xóa tự động
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // **KIỂM TRA GHẾ TRƯỚC KHI TẠO ORDER**
      const seatIds = orderData.seats.map((seat) => seat.seatId);

      // Sử dụng thời gian trực tiếp từ frontend (Vietnam time)
      const showTime = orderData.showTime;


      // Tạm giữ ghế trong showtime với trạng thái "reserved" (8 phút)
      try {
        await showtimeService.setSeatsStatus(
          orderData.showtimeId,
          orderData.showDate,
          showTime,
          orderData.room,
          seatIds,
          "reserved",
          undefined, // onlyIfReservedByUserId
          orderData.userId // reservedByUserId
        );
        console.log(`🔒 Reserved seats ${seatIds.join(', ')} for user ${orderData.userId} for 8 minutes`);
      } catch (seatError: any) {
        // Nếu ghế không available, return error response
        await session.abortTransaction();
        return {
          success: false,
          message: `Không thể tạm giữ ghế: ${seatError.message}`,
        };
      }

      const newOrder = new Order({
        orderCode: orderCode!,
        userId: orderData.userId,
        movieId: orderData.movieId,
        theaterId: orderData.theaterId,
        showtimeId: orderData.showtimeId,
        showDate: orderData.showDate,
        showTime: orderData.showTime,
        room: orderData.room,
        seats: orderData.seats,
        foodCombos: combosWithPrice,
        voucherId: orderData.voucherId,
        voucherDiscount,
        amountDiscount,
        amountDiscountInfo,
        itemPromotions,
        percentPromotions,
        ticketPrice,
        comboPrice,
        totalAmount,
        finalAmount,
        paymentMethod: orderData.paymentMethod,
        customerInfo: orderData.customerInfo,
        expiresAt,
      });

      const savedOrder = await newOrder.save({ session });

      console.log(
        "Order created and seats reserved successfully:",
        savedOrder.orderCode
      );

      // Note: Voucher sẽ được mark as used khi thanh toán thành công, không phải khi tạo order

      await session.commitTransaction();

      return {
        success: true,
        order: savedOrder,
        message: "Tạo đơn hàng thành công",
      };
    } catch (error) {
      await session.abortTransaction();
      return {
        success: false,
        message: `Lỗi tạo đơn hàng: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
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
        .populate("foodCombos.comboId", "name description")
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
      .populate("movieId", "title poster duration posterImage")
      .populate("theaterId", "name location")
      .populate("showtimeId", "startTime date")
      .populate("foodCombos.comboId", "name price")
      .populate("voucherId", "code discountPercent");
  }

  // Lấy order theo orderCode
  async getOrderByCode(orderCode: string): Promise<IOrder | null> {
    return await Order.findOne({ orderCode })
      .populate("userId", "fullName email phoneNumber")
      .populate("movieId", "title poster duration posterImage")
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
        .populate("movieId", "title poster duration posterImage")
        .populate("theaterId", "name location")
        .populate("showtimeId", "startTime date")
        .populate("foodCombos.comboId", "name description")
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
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Lấy thông tin order hiện tại
      const currentOrder = await Order.findById(orderId).session(session);
      if (!currentOrder) {
        throw new Error("Order không tồn tại");
      }

      // Nếu order được thanh toán thành công hoặc được confirm, extend expiresAt để không bị tự động xóa
      if (updateData.paymentStatus === "PAID" || updateData.orderStatus === "CONFIRMED") {
        updateData.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
        if (updateData.paymentStatus === "PAID") {
        updateData.orderStatus = "CONFIRMED";
        }
        console.log(`✅ Order ${orderId} confirmed and expiresAt extended to 1 year from now`);

        // Mark voucher as used khi thanh toán thành công (fallback cho trường hợp updateOrder được gọi)
        if (currentOrder.voucherId && currentOrder.voucherDiscount > 0) {
          try {
            const { UserVoucher } = await import("../models/UserVoucher");
            const updateResult = await UserVoucher.findByIdAndUpdate(
              currentOrder.voucherId,
              {
                $set: {
                  status: "used",
                  usedAt: new Date(),
                },
              }
            );
            
          } catch (error) {
            console.error(`❌ Error marking voucher as used:`, error);
          }
        }

        // Đảm bảo ghế được book trong showtime khi thanh toán thành công
        try {
          const seatIds = currentOrder.seats.map((seat) => seat.seatId);

          // Sử dụng thời gian trực tiếp từ order (Vietnam time)
          const showTime = currentOrder.showTime;

          

          // Chuyển ghế từ "reserved" sang "selected" khi thanh toán thành công
          await showtimeService.setSeatsStatus(
            currentOrder.showtimeId.toString(),
            currentOrder.showDate,
            showTime,
            currentOrder.room,
            seatIds,
            "selected",
            currentOrder.userId.toString(), // Chỉ user này mới có thể confirm ghế của họ
            currentOrder.userId.toString()
          );
          
        } catch (seatError) {
          console.error("Error confirming seats for paid order:", seatError);
          // Log error nhưng không fail transaction vì payment đã thành công
        }
      }

      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { $set: updateData },
        { new: true, runValidators: true, session }
      )
        .populate("userId", "fullName email phoneNumber")
        .populate("movieId", "title poster duration")
        .populate("theaterId", "name location")
        .populate("showtimeId", "startTime date")
        .populate("foodCombos.comboId", "name description")
        .populate("voucherId", "code discountPercent");

      await session.commitTransaction();
      
      // Sau khi commit (thanh toán thành công), cập nhật trạng thái ghế ở collection seats về 'selected'
      try {
        if (updateData.paymentStatus === "PAID") {
          const Seat = (await import("../models/Seat")).default;
          if (currentOrder?.seats?.length) {
            await Seat.updateMany(
              { seatId: { $in: currentOrder.seats.map((s) => s.seatId) }, room: (currentOrder as any).roomId || undefined },
              { $set: { status: "selected" } }
            );
          }
        }
      } catch (e) {
        // Không làm fail request nếu cập nhật ghế gặp lỗi; chỉ log
        console.error("Failed to update seat status after payment:", e);
      }
      return updatedOrder;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Hủy order
  async cancelOrder(orderId: string, reason?: string): Promise<IOrder | null> {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error("Order không tồn tại");
      }

      if (order.orderStatus === "CANCELLED") {
        throw new Error("Order đã được hủy");
      }

      if (order.paymentStatus === "PAID") {
        throw new Error("Không thể hủy order đã thanh toán");
      }

      // Bỏ logic hoàn trả FoodCombo vì đã xóa các trường quantity, price

      // Release ghế trong showtime khi hủy order
      try {
        const seatIds = order.seats.map((seat) => seat.seatId);
        
        // Cập nhật trạng thái ghế về available (dùng setSeatsStatus để so khớp theo tên phòng/seatId)
        await showtimeService.setSeatsStatus(
          order.showtimeId.toString(),
          order.showDate,
          order.showTime,
          order.room,
          seatIds,
          'available'
        );
        
      } catch (seatError) {
        console.error("Error releasing seats for cancelled order:", seatError);
        // Log error nhưng vẫn tiếp tục cancel order
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
        { new: true }
      );
      return updatedOrder;
    } catch (error) {
      throw error;
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
