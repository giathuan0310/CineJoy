import { Router } from "express";
import { updateUser } from "../controllers/UserController";
import { verifyToken } from "../middlewares/AuthMiddleware";

const router = Router();

// Cập nhật user
router.put("/:id", verifyToken, updateUser);

export default router;
