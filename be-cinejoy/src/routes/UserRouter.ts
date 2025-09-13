import { Router } from "express";
import { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser, 
  createUser 
} from "../controllers/UserController";
import { verifyToken } from "../middlewares/AuthMiddleware";

const router = Router();

// Lấy tất cả users
router.get("/", verifyToken, getAllUsers);

// Lấy user theo ID
router.get("/:id", verifyToken, getUserById);

// Tạo user mới
router.post("/", verifyToken, createUser);

// Cập nhật user
router.put("/:id", verifyToken, updateUser);

// Xóa user
router.delete("/:id", verifyToken, deleteUser);

export default router;
