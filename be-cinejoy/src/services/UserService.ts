import { User, IUser } from "../models/User";

export const getAllUsers = async () => {
    const users = await User.find({}).sort({ createdAt: -1 });
    return users;
};

export const getUserById = async (userId: string) => {
    const user = await User.findById(userId);
    return user;
};

export const createUser = async (userData: Partial<IUser>) => {
    const newUser = new User(userData);
    const savedUser = await newUser.save();
    return savedUser;
};

export const updateUser = async (userId: string, updateData: any) => {
    if (updateData.password) delete updateData.password;
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    return updatedUser;
};

export const deleteUser = async (userId: string) => {
    const deletedUser = await User.findByIdAndDelete(userId);
    return deletedUser;
};
