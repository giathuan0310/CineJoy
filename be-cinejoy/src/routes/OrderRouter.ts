import { Router } from "express";
import OrderController from "../controllers/OrderController";
// import AuthMiddleware from '../middlewares/AuthMiddleware'; // Uncomment khi cần

const router = Router();

// Routes cho Order
router.post("/", OrderController.createOrder); // Tạo order mới
router.get("/", OrderController.getAllOrders); // Lấy tất cả orders (Admin)
router.get("/stats", OrderController.getOrderStats); // Thống kê orders (Admin)
router.get("/:id", OrderController.getOrderById); // Lấy order theo ID
router.get("/code/:orderCode", OrderController.getOrderByCode); // Lấy order theo orderCode
router.get("/user/:userId", OrderController.getOrdersByUserId); // Lấy orders theo userId
router.put("/:id", OrderController.updateOrder); // Cập nhật order
router.post("/:id/cancel", OrderController.cancelOrder); // Hủy order
router.delete("/:id", OrderController.deleteOrder); // Xóa order (Admin)

// Routes cho Payment của Order
router.post("/:orderId/payment", OrderController.createPayment); // Tạo payment cho order

export default router;
