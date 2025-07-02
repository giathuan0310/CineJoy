import { User } from "../models/User";

export const updateUser = async (userId: string, updateData: any) => {
    // Không cho update password qua API này
    if (updateData.password) delete updateData.password;
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    return updatedUser;
};
