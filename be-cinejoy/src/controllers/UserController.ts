import { Request, Response } from "express";
import { updateUser as updateUserService } from "../services/UserService";

export const updateUser = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;
        const updateData = req.body;

        const updatedUser = await updateUserService(userId, updateData);
        if (!updatedUser) {
            res.status(404).json({ status: false, error: 1, message: "Không tìm thấy user", data: null });
            return;
        }
        const { password, ...userWithoutPassword } = updatedUser.toObject();
        res.json({ status: true, error: 0, message: "Cập nhật user thành công!", data: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ status: false, error: 1, message: "Lỗi server", data: null });
    }
};
