import { User } from "../models/User";

export const updateUser = async (userId: string, updateData: any) => {
    if (updateData.password) delete updateData.password;
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    return updatedUser;
};
