import { Router } from "express";
import PaymentController from "../controllers/PaymentController";
// import AuthMiddleware from '../middlewares/AuthMiddleware'; // Uncomment khi cần

const router = Router();

// Routes cho Payment
router.get("/stats", PaymentController.getPaymentStats); // Thống kê payments (Admin)
router.get("/:id", PaymentController.getPaymentById); // Lấy payment theo ID
router.get("/order/:orderId", PaymentController.getPaymentByOrderId); // Lấy payment theo orderId
router.put("/:id/status", PaymentController.updatePaymentStatus); // Cập nhật trạng thái payment
router.post("/:id/refund", PaymentController.refundPayment); // Hoàn tiền

// MoMo Integration Routes
router.post("/momo/callback", PaymentController.handleMoMoCallback); // MoMo IPN callback
router.get("/momo/return", PaymentController.handleMoMoReturn); // MoMo return URL
router.post("/momo/test", PaymentController.testMoMoConnection); // Test MoMo connection

export default router;
