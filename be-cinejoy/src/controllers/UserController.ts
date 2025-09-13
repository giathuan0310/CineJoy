import { Request, Response } from "express";
import { 
  getAllUsers as getAllUsersService,
  getUserById as getUserByIdService,
  createUser as createUserService,
  updateUser as updateUserService,
  deleteUser as deleteUserService
} from "../services/UserService";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsersService();
    const usersWithoutPassword = users.map(user => {
      const { password, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword;
    });
    
    res.status(200).json({
      status: true,
      error: 0,
      message: "Lấy danh sách user thành công!",
      data: usersWithoutPassword,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      status: false,
      error: 500,
      message: "Lỗi server",
      data: null,
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await getUserByIdService(userId);
    
    if (!user) {
      res.status(404).json({
        status: false,
        error: 404,
        message: "Không tìm thấy user",
        data: null,
      });
      return;
    }
    
    const { password, ...userWithoutPassword } = user.toObject();
    res.status(200).json({
      status: true,
      error: 0,
      message: "Lấy thông tin user thành công!",
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error("Get user by id error:", error);
    res.status(500).json({
      status: false,
      error: 500,
      message: "Lỗi server",
      data: null,
    });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    const newUser = await createUserService(userData);
    
    const { password, ...userWithoutPassword } = newUser.toObject();
    res.status(201).json({
      status: true,
      error: 0,
      message: "Tạo user thành công!",
      data: userWithoutPassword,
    });
  } catch (error: any) {
    console.error("Create user error:", error);
    
    if (error.code === 11000) {
      res.status(400).json({
        status: false,
        error: 400,
        message: "Email đã tồn tại",
        data: null,
      });
      return;
    }
    
    res.status(500).json({
      status: false,
      error: 500,
      message: "Lỗi server",
      data: null,
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    const updatedUser = await updateUserService(userId, updateData);
    if (!updatedUser) {
      res.status(404).json({
        status: false,
        error: 404,
        message: "Không tìm thấy user",
        data: null,
      });
      return;
    }
    const { password, ...userWithoutPassword } = updatedUser.toObject();
    res.status(200).json({
      status: true,
      error: 0,
      message: "Cập nhật thông tin thành công!",
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      status: false,
      error: 500,
      message: "Lỗi server",
      data: null,
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const deletedUser = await deleteUserService(userId);
    
    if (!deletedUser) {
      res.status(404).json({
        status: false,
        error: 404,
        message: "Không tìm thấy user",
        data: null,
      });
      return;
    }
    
    res.status(200).json({
      status: true,
      error: 0,
      message: "Xóa user thành công!",
      data: null,
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      status: false,
      error: 500,
      message: "Lỗi server",
      data: null,
    });
  }
};
