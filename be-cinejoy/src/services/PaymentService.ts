import Payment, { IPayment } from "../models/Payment";
import Order from "../models/Order";
import crypto from "crypto";
import axios from "axios";
import momoConfig from "../configs/momoConfig";
import VNPayService from "./VNPayService";
import { sendPaymentSuccessEmail, type PaymentEmailData } from "../utils/emailService";
import ShowtimeService from "./ShowtimeService";

const showtimeService = new ShowtimeService();

export interface CreatePaymentData {
  orderId: string;
  amount: number;
  paymentMethod: "MOMO" | "VNPAY";
  returnUrl: string;
  cancelUrl: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface MoMoPaymentRequest {
  partnerCode: string;
  requestId: string;
  amount: number;
  orderId: string;
  orderInfo: string;
  redirectUrl: string;
  ipnUrl: string;
  extraData: string;
  requestType: string;
  signature: string;
  lang: string;
  // Optional expiration support (MoMo may accept one of these depending on API version)
  expiredTime?: number; // ms epoch
  validDuration?: number; // seconds
}

export interface MoMoPaymentResponse {
  partnerCode: string;
  requestId: string;
  orderId: string;
  amount: number;
  responseTime: number;
  message: string;
  resultCode: number;
  payUrl?: string;
  deeplink?: string;
  qrCodeUrl?: string;
}

class PaymentService {
  // Tạo payment record
  async createPayment(paymentData: CreatePaymentData): Promise<IPayment> {
    const payment = new Payment({
      orderId: paymentData.orderId,
      paymentMethod: paymentData.paymentMethod,
      amount: paymentData.amount,
      metadata: {
        returnUrl: paymentData.returnUrl,
        cancelUrl: paymentData.cancelUrl,
        ipAddress: paymentData.ipAddress,
        userAgent: paymentData.userAgent,
      },
    });

    return await payment.save();
  }

  // Tạo MoMo payment URL
  async createVNPayPayment(payment: IPayment): Promise<string> {
    try {
      return await VNPayService.createVNPayPayment(payment);
    } catch (error) {
      console.error("VNPay payment creation failed:", error);
      throw error;
    }
  }

  async createMoMoPayment(payment: IPayment): Promise<string> {
    try {
      const order = await Order.findById(payment.orderId);
      if (!order) {
        throw new Error("Order không tồn tại");
      }

      const requestId = payment.transactionId!;
      const orderId = order.orderCode;
      const orderInfo = `Thanh toán đơn hàng CineJoy ${orderId}`;
      const amount = payment.amount;
      
      const extraData = "";
      const requestType = "captureWallet";
      // Set payment expiration to 5 minutes
      const expiredTime = Date.now() + 5 * 60 * 1000; // milliseconds

      // Tạo signature
      const rawSignature = `accessKey=${momoConfig.getAccessKey()}&amount=${amount}&extraData=${extraData}&ipnUrl=${momoConfig.getIpnUrl()}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${momoConfig.getPartnerCode()}&redirectUrl=${
        payment.metadata?.returnUrl
      }&requestId=${requestId}&requestType=${requestType}`;

      const signature = crypto
        .createHmac("sha256", momoConfig.getSecretKey())
        .update(rawSignature)
        .digest("hex");

      const requestBody: MoMoPaymentRequest = {
        partnerCode: momoConfig.getPartnerCode(),
        requestId,
        amount,
        orderId,
        orderInfo,
        redirectUrl: payment.metadata?.returnUrl || "",
        ipnUrl: momoConfig.getIpnUrl(),
        extraData,
        requestType,
        signature,
        lang: "vi",
        expiredTime,
        validDuration: 300,
      };


      const response = await axios.post<MoMoPaymentResponse>(
        momoConfig.getEndpoint(),
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );


      // Cập nhật payment với response từ MoMo
      await Payment.findByIdAndUpdate(payment._id, {
        $set: {
          gatewayResponse: response.data,
          gatewayTransactionId: response.data.requestId,
        },
      });

      if (response.data.resultCode === 0 && response.data.payUrl) {
        return response.data.payUrl;
      } else {
        throw new Error(`MoMo Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error("MoMo Payment Error:", error);

      // Cập nhật payment status thành failed
      await Payment.findByIdAndUpdate(payment._id, {
        $set: {
          status: "FAILED",
          gatewayResponse: {
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date(),
          },
        },
      });

      throw error;
    }
  }

  // Xử lý VNPay callback
  async handleVNPayCallback(
    callbackData: any
  ): Promise<{ status: string; message: string }> {
    try {
      const result = await VNPayService.handleVNPayCallback(callbackData);
      
      if (result.status === "success") {
        // Tìm payment record
        const orderId = callbackData.vnp_TxnRef;
        const payment = await Payment.findOne({ orderId });
        
        if (!payment) {
          throw new Error("Payment không tồn tại");
        }

        const order = await Order.findById(payment.orderId);
        if (!order) {
          throw new Error("Order không tồn tại");
        }

        // Cập nhật payment và order status
        await Promise.all([
          Payment.findByIdAndUpdate(payment._id, {
            $set: {
              status: "SUCCESS",
              gatewayTransactionId: callbackData.vnp_TransactionNo,
              gatewayResponse: callbackData,
            },
          }),
          Order.findByIdAndUpdate(order._id, {
            $set: {
              paymentStatus: "PAID",
              orderStatus: "CONFIRMED",
              expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Extend to 1 year
              "paymentInfo.transactionId": callbackData.vnp_TransactionNo,
              "paymentInfo.paymentDate": new Date(),
              "paymentInfo.paymentGatewayResponse": callbackData,
            },
          }),
        ]);


        // Mark voucher as used khi thanh toán thành công (VNPay)
        if (order.voucherId && order.voucherDiscount > 0) {
          try {
            const { UserVoucher } = await import("../models/UserVoucher");
            const updateResult = await UserVoucher.findByIdAndUpdate(
              order.voucherId,
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

               // Cập nhật trạng thái ghế thành 'occupied' (đã thanh toán thành công)
               try {
          const populatedOrder = await Order.findById(order._id)
            .populate('userId', 'email fullName')
            .populate({
              path: 'showtimeId',
              populate: [
                { path: 'movieId', select: 'title' },
                { path: 'theaterId', select: 'name' }
              ]
            })
            .populate('foodCombos.comboId', 'name');
          
          if (populatedOrder && populatedOrder.showtimeId) {
            const seatIds = populatedOrder.seats.map(seat => seat.seatId);
            await showtimeService.setSeatsStatus(
              (populatedOrder.showtimeId as any)._id.toString(),
              populatedOrder.showDate,
              populatedOrder.showTime,
              populatedOrder.room, // Sử dụng room string từ Order
              seatIds,
              'occupied'
            );
          }
               } catch (seatUpdateError) {
                 console.error("Failed to update seat status:", seatUpdateError);
               }
               
               // Gửi email xác nhận thanh toán
               try {
          
          const populatedOrder = await Order.findById(order._id)
            .populate('userId', 'email fullName')
            .populate({
              path: 'showtimeId',
              populate: [
                { path: 'movieId', select: 'title' },
                { path: 'theaterId', select: 'name' }
              ]
            })
            .populate('foodCombos.comboId', 'name');
          
          
          if (populatedOrder && populatedOrder.userId) {
            const userEmail = (populatedOrder.userId as any).email;
            
            const emailData: PaymentEmailData = {
              userName: (populatedOrder.userId as any).fullName || 'Khách hàng',
              orderId: order._id.toString(),
              movieName: (populatedOrder.showtimeId as any)?.movieId?.title || 'N/A',
              cinema: (populatedOrder.showtimeId as any)?.theaterId?.name || 'N/A',
              room: populatedOrder.room || 'N/A',
              showtime: `${populatedOrder.showDate} ${populatedOrder.showTime}`,
              seats: populatedOrder.seats.map(seat => seat.seatId),
              ticketPrice: populatedOrder.ticketPrice || 0,
              comboPrice: populatedOrder.comboPrice || 0,
              totalAmount: populatedOrder.totalAmount || 0,
              voucherDiscount: populatedOrder.voucherDiscount || 0,
              voucherCode: undefined, // voucherCode không có trong Order model
              amountDiscount: populatedOrder.amountDiscount || 0,
              amountDiscountDescription: populatedOrder.amountDiscountInfo?.description || undefined,
              itemPromotions: populatedOrder.itemPromotions || [],
              percentPromotions: populatedOrder.percentPromotions || [],
              finalAmount: populatedOrder.finalAmount || 0,
              qrCodeDataUrl: '',
              foodCombos: populatedOrder.foodCombos?.map(combo => ({
                comboName: (combo.comboId as any)?.name || 'Combo',
                quantity: combo.quantity,
                price: combo.price
              })) || []
            };
            
            
            const emailResult = await sendPaymentSuccessEmail(userEmail, emailData);
          } else {
          }
        } catch (emailError) {
          console.error("=== EMAIL ERROR ===");
          console.error("Failed to send payment confirmation email:", emailError);
          console.error("=== EMAIL ERROR END ===");
        }
      }
      
      return result;
    } catch (error) {
      console.error("VNPay callback processing error:", error);
      return { status: "error", message: "Callback processing failed" };
    }
  }

  // Xử lý MoMo IPN callback
  async handleMoMoCallback(
    callbackData: any
  ): Promise<{ status: string; message: string }> {
    try {

      const {
        partnerCode,
        orderId,
        requestId,
        amount,
        orderInfo,
        orderType,
        transId,
        resultCode,
        message,
        payType,
        responseTime,
        extraData,
        signature,
      } = callbackData;

      // Verify signature
      const rawSignature = `accessKey=${momoConfig.getAccessKey()}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

      const expectedSignature = crypto
        .createHmac("sha256", momoConfig.getSecretKey())
        .update(rawSignature)
        .digest("hex");

      if (signature !== expectedSignature) {
        console.error("Invalid signature:", { signature, expectedSignature });
        return { status: "error", message: "Invalid signature" };
      }

      // Tìm order và payment
      const order = await Order.findOne({ orderCode: orderId });
      if (!order) {
        console.error("Order not found:", orderId);
        return { status: "error", message: "Order not found" };
      }

      const payment = await Payment.findOne({ orderId: order._id });
      if (!payment) {
        console.error("Payment not found for order:", order._id);
        return { status: "error", message: "Payment not found" };
      }

      // Cập nhật payment và order status
      if (resultCode === 0) {
        // Thanh toán thành công
        await Promise.all([
          Payment.findByIdAndUpdate(payment._id, {
            $set: {
              status: "SUCCESS",
              gatewayTransactionId: transId,
              gatewayResponse: callbackData,
            },
          }),
          Order.findByIdAndUpdate(order._id, {
            $set: {
              paymentStatus: "PAID",
              orderStatus: "CONFIRMED",
              expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Extend to 1 year
              "paymentInfo.transactionId": transId,
              "paymentInfo.paymentDate": new Date(),
              "paymentInfo.paymentGatewayResponse": callbackData,
            },
          }),
        ]);


        // Mark voucher as used khi thanh toán thành công
        if (order.voucherId && order.voucherDiscount > 0) {
          try {
            const { UserVoucher } = await import("../models/UserVoucher");
            const updateResult = await UserVoucher.findByIdAndUpdate(
              order.voucherId,
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

        
        // Cập nhật trạng thái ghế thành 'occupied' (đã thanh toán thành công)
        try {
          const populatedOrder = await Order.findById(order._id)
            .populate('showtimeId');
          
          if (populatedOrder && populatedOrder.showtimeId) {
            const seatIds = populatedOrder.seats.map(seat => seat.seatId);
            await showtimeService.setSeatsStatus(
              (populatedOrder.showtimeId as any)._id.toString(),
              populatedOrder.showDate,
              populatedOrder.showTime,
              populatedOrder.room, // Sử dụng room string từ Order
              seatIds,
              'occupied'
            );
          }
        } catch (seatUpdateError) {
          console.error("Failed to update seat status:", seatUpdateError);
          // Không throw error để không ảnh hưởng đến thanh toán
        }
        
        // Gửi email xác nhận thanh toán
        try {
          
          const populatedOrder = await Order.findById(order._id)
            .populate('userId', 'email fullName')
            .populate({
              path: 'showtimeId',
              populate: [
                { path: 'movieId', select: 'title' },
                { path: 'theaterId', select: 'name' }
              ]
            })
            .populate('foodCombos.comboId', 'name');
          
          
          if (populatedOrder && populatedOrder.userId) {
            const userEmail = (populatedOrder.userId as any).email;
            
            const emailData: PaymentEmailData = {
              userName: (populatedOrder.userId as any).fullName || 'Khách hàng',
              orderId: order._id.toString(),
              movieName: (populatedOrder.showtimeId as any)?.movieId?.title || 'N/A',
              cinema: (populatedOrder.showtimeId as any)?.theaterId?.name || 'N/A',
              room: populatedOrder.room || 'N/A', // Lấy từ Order.room
              showtime: `${populatedOrder.showDate} ${populatedOrder.showTime}`,
              seats: populatedOrder.seats.map(seat => seat.seatId),
              ticketPrice: populatedOrder.ticketPrice || 0,
              comboPrice: populatedOrder.comboPrice || 0,
              totalAmount: populatedOrder.totalAmount || 0,
              voucherDiscount: populatedOrder.voucherDiscount || 0,
              voucherCode: undefined, // voucherCode không có trong Order model
              amountDiscount: populatedOrder.amountDiscount || 0,
              amountDiscountDescription: populatedOrder.amountDiscountInfo?.description || undefined,
              itemPromotions: populatedOrder.itemPromotions || [],
              percentPromotions: populatedOrder.percentPromotions || [],
              finalAmount: populatedOrder.finalAmount || 0,
              qrCodeDataUrl: '', // Sẽ được tạo trong sendPaymentSuccessEmail từ orderId
              foodCombos: populatedOrder.foodCombos?.map(combo => ({
                comboName: (combo.comboId as any)?.name || 'Combo',
                quantity: combo.quantity,
                price: combo.price
              })) || []
            };
            
            
            const emailResult = await sendPaymentSuccessEmail(userEmail, emailData);
          } else {
          }
        } catch (emailError) {
          console.error("=== EMAIL ERROR ===");
          console.error("Failed to send payment confirmation email:", emailError);
          console.error("=== EMAIL ERROR END ===");
          // Không throw error để không ảnh hưởng đến thanh toán
        }
        
        return { status: "success", message: "Payment processed successfully" };
      } else {
        // Thanh toán thất bại
        await Promise.all([
          Payment.findByIdAndUpdate(payment._id, {
            $set: {
              status: "FAILED",
              gatewayResponse: callbackData,
            },
          }),
          Order.findByIdAndUpdate(order._id, {
            $set: {
              paymentStatus: "FAILED",
              "paymentInfo.paymentGatewayResponse": callbackData,
            },
          }),
        ]);

        return { status: "error", message: message || "Payment failed" };
      }
    } catch (error) {
      console.error("MoMo Callback Error:", error);
      return { status: "error", message: "Internal server error" };
    }
  }

  // Lấy payment theo ID
  async getPaymentById(paymentId: string): Promise<IPayment | null> {
    return await Payment.findById(paymentId).populate("orderId");
  }

  // Lấy payment theo orderId
  async getPaymentByOrderId(orderId: string): Promise<IPayment | null> {
    return await Payment.findOne({ orderId }).populate("orderId");
  }

  // Lấy payment theo transactionId
  async getPaymentByTransactionId(
    transactionId: string
  ): Promise<IPayment | null> {
    return await Payment.findOne({ transactionId }).populate("orderId");
  }

  // Cập nhật payment status
  async updatePaymentStatus(
    paymentId: string,
    status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED" | "REFUNDED",
    gatewayResponse?: any
  ): Promise<IPayment | null> {
    const updateData: any = { status };
    if (gatewayResponse) {
      updateData.gatewayResponse = gatewayResponse;
    }

    return await Payment.findByIdAndUpdate(
      paymentId,
      { $set: updateData },
      { new: true }
    ).populate("orderId");
  }

  // Hoàn tiền
  async refundPayment(
    paymentId: string,
    refundAmount: number,
    reason: string
  ): Promise<IPayment | null> {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error("Payment không tồn tại");
    }

    if (payment.status !== "SUCCESS") {
      throw new Error("Chỉ có thể hoàn tiền cho payment đã thành công");
    }

    if (refundAmount > payment.amount) {
      throw new Error("Số tiền hoàn không được lớn hơn số tiền gốc");
    }

    // TODO: Implement MoMo refund API call here

    const refundTransactionId = `REFUND_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 8)}`;

    return await Payment.findByIdAndUpdate(
      paymentId,
      {
        $set: {
          status: "REFUNDED",
          refundInfo: {
            refundAmount,
            refundDate: new Date(),
            refundTransactionId,
            reason,
          },
        },
      },
      { new: true }
    ).populate("orderId");
  }

  // Lấy thống kê payments
  async getPaymentStats(): Promise<{
    totalPayments: number;
    successfulPayments: number;
    failedPayments: number;
    totalAmount: number;
    todayPayments: number;
    todayAmount: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalPayments,
      successfulPayments,
      failedPayments,
      totalAmountResult,
      todayStats,
    ] = await Promise.all([
      Payment.countDocuments(),
      Payment.countDocuments({ status: "SUCCESS" }),
      Payment.countDocuments({ status: "FAILED" }),
      Payment.aggregate([
        { $match: { status: "SUCCESS" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Payment.aggregate([
        {
          $match: {
            createdAt: { $gte: today, $lt: tomorrow },
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            amount: {
              $sum: { $cond: [{ $eq: ["$status", "SUCCESS"] }, "$amount", 0] },
            },
          },
        },
      ]),
    ]);

    return {
      totalPayments,
      successfulPayments,
      failedPayments,
      totalAmount: totalAmountResult[0]?.total || 0,
      todayPayments: todayStats[0]?.count || 0,
      todayAmount: todayStats[0]?.amount || 0,
    };
  }
}

export default new PaymentService();
