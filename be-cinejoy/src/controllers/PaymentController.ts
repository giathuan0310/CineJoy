import { Request, Response } from "express";
import PaymentService from "../services/PaymentService";

class PaymentController {
  // Lấy payment theo ID
  async getPaymentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const payment = await PaymentService.getPaymentById(id);

      if (!payment) {
        res.status(404).json({
          status: false,
          error: 404,
          message: "Không tìm thấy thanh toán",
          data: null,
        });
        return;
      }

      res.status(200).json({
        status: true,
        error: 0,
        message: "Lấy thông tin thanh toán thành công",
        data: payment,
      });
    } catch (error) {
      console.error("Get payment by id error:", error);
      res.status(500).json({
        status: false,
        error: 500,
        message: "Lỗi server",
        data: null,
      });
    }
  }

  // Lấy payment theo orderId
  async getPaymentByOrderId(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const payment = await PaymentService.getPaymentByOrderId(orderId);

      if (!payment) {
        res.status(404).json({
          status: false,
          error: 404,
          message: "Không tìm thấy thanh toán cho đơn hàng này",
          data: null,
        });
        return;
      }

      res.status(200).json({
        status: true,
        error: 0,
        message: "Lấy thông tin thanh toán thành công",
        data: payment,
      });
    } catch (error) {
      console.error("Get payment by order id error:", error);
      res.status(500).json({
        status: false,
        error: 500,
        message: "Lỗi server",
        data: null,
      });
    }
  }

  // Xử lý MoMo IPN callback
  async handleMoMoCallback(req: Request, res: Response): Promise<void> {
    try {
      const callbackData = req.body;
      console.log(
        "Received MoMo callback:",
        JSON.stringify(callbackData, null, 2)
      );

      const result = await PaymentService.handleMoMoCallback(callbackData);

      if (result.status === "success") {
        res.status(200).json({
          status: true,
          error: 0,
          message: result.message,
          data: null,
        });
      } else {
        res.status(400).json({
          status: false,
          error: 400,
          message: result.message,
          data: null,
        });
      }
    } catch (error) {
      console.error("MoMo callback error:", error);
      res.status(500).json({
        status: false,
        error: 500,
        message: "Lỗi server",
        data: null,
      });
    }
  }

  // Xử lý MoMo return URL (redirect từ MoMo về website)
  async handleMoMoReturn(req: Request, res: Response): Promise<void> {
    try {
      const { orderId, resultCode, message } = req.query;

      console.log("MoMo Return:", { orderId, resultCode, message });

      // Redirect về frontend với kết quả
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

      if (resultCode === "0") {
        // Thanh toán thành công
        res.redirect(`${frontendUrl}/payment/success?orderId=${orderId}`);
      } else {
        // Thanh toán thất bại
        res.redirect(
          `${frontendUrl}/payment/failed?orderId=${orderId}&message=${encodeURIComponent(
            (message as string) || "Payment failed"
          )}`
        );
      }
    } catch (error) {
      console.error("MoMo return error:", error);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      res.redirect(`${frontendUrl}/payment/error`);
    }
  }

  // Cập nhật trạng thái payment
  async updatePaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, gatewayResponse } = req.body;

      const payment = await PaymentService.updatePaymentStatus(
        id,
        status,
        gatewayResponse
      );

      if (!payment) {
        res.status(404).json({
          status: false,
          error: 404,
          message: "Không tìm thấy thanh toán",
          data: null,
        });
        return;
      }

      res.status(200).json({
        status: true,
        error: 0,
        message: "Cập nhật trạng thái thanh toán thành công",
        data: payment,
      });
    } catch (error) {
      console.error("Update payment status error:", error);
      res.status(500).json({
        status: false,
        error: 500,
        message: "Lỗi server",
        data: null,
      });
    }
  }

  // Hoàn tiền
  async refundPayment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { refundAmount, reason } = req.body;

      if (!refundAmount || refundAmount <= 0) {
        res.status(400).json({
          status: false,
          error: 400,
          message: "Số tiền hoàn không hợp lệ",
          data: null,
        });
        return;
      }

      if (!reason) {
        res.status(400).json({
          status: false,
          error: 400,
          message: "Vui lòng nhập lý do hoàn tiền",
          data: null,
        });
        return;
      }

      const payment = await PaymentService.refundPayment(
        id,
        refundAmount,
        reason
      );

      res.status(200).json({
        status: true,
        error: 0,
        message: "Hoàn tiền thành công",
        data: payment,
      });
    } catch (error) {
      console.error("Refund payment error:", error);
      res.status(500).json({
        status: false,
        error: 500,
        message: error instanceof Error ? error.message : "Lỗi server",
        data: null,
      });
    }
  }

  // Lấy thống kê payments (Admin only)
  async getPaymentStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await PaymentService.getPaymentStats();

      res.status(200).json({
        status: true,
        error: 0,
        message: "Lấy thống kê thanh toán thành công",
        data: stats,
      });
    } catch (error) {
      console.error("Get payment stats error:", error);
      res.status(500).json({
        status: false,
        error: 500,
        message: "Lỗi server",
        data: null,
      });
    }
  }

  // Test MoMo connection
  async testMoMoConnection(req: Request, res: Response): Promise<void> {
    try {
      // Tạo một test payment để kiểm tra kết nối
      const testPayment = await PaymentService.createPayment({
        orderId: "507f1f77bcf86cd799439011", // Dummy order ID
        amount: 10000, // 10,000 VND
        paymentMethod: "MOMO",
        returnUrl: "http://localhost:3000/test-return",
        cancelUrl: "http://localhost:3000/test-cancel",
      });

      const paymentUrl = await PaymentService.createMoMoPayment(testPayment);

      res.status(200).json({
        status: true,
        error: 0,
        message: "Kết nối MoMo thành công",
        data: {
          paymentUrl,
          testPaymentId: testPayment._id,
        },
      });
    } catch (error) {
      console.error("Test MoMo connection error:", error);
      res.status(500).json({
        status: false,
        error: 500,
        message: error instanceof Error ? error.message : "Lỗi kết nối MoMo",
        data: null,
      });
    }
  }
}

export default new PaymentController();
