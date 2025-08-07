import { Voucher, IVoucher } from "../models/Voucher";
import { UserVoucher } from "../models/UserVoucher";
import { Types } from "mongoose";
import { User } from "../models/User";

export default class VoucherService {
  getVouchers(): Promise<IVoucher[]> {
    return Voucher.find();
  }

  getVoucherById(id: string): Promise<IVoucher | null> {
    return Voucher.findById(id);
  }

  addVoucher(data: IVoucher): Promise<IVoucher> {
    const voucher = new Voucher(data);
    return voucher.save();
  }

  updateVoucher(id: string, data: Partial<IVoucher>): Promise<IVoucher | null> {
    return Voucher.findByIdAndUpdate(id, data, { new: true });
  }

  deleteVoucher(id: string): Promise<IVoucher | null> {
    return Voucher.findByIdAndDelete(id);
  }

  getUserVouchers = async (userId: Types.ObjectId | string) => {
    return await UserVoucher.find({ userId })
      .populate("voucherId")
      .sort({ redeemedAt: -1 });
  };

  async redeemVoucher(userId: string, voucherId: string) {
    const voucher = await Voucher.findById(voucherId);
    if (!voucher) throw new Error("Voucher không tồn tại");
    if (voucher.quantity <= 0) throw new Error("Voucher đã hết số lượng");

    const user = await User.findById(userId);
    if (!user) throw new Error("User không tồn tại");
    if ((user.point ?? 0) < voucher.pointToRedeem)
      throw new Error("Bạn không đủ điểm để đổi voucher này");
    user.point = (user.point ?? 0) - voucher.pointToRedeem;
    await user.save();

    voucher.quantity -= 1;
    await voucher.save();

    const code = Math.random().toString(36).substring(2, 10).toUpperCase();

    const userVoucher = new UserVoucher({
      userId,
      voucherId,
      code,
      status: "unused",
      redeemedAt: new Date(),
    });
    await userVoucher.save();
    const populatedUserVoucher = await UserVoucher.findById(
      userVoucher._id
    ).populate("voucherId");
    return populatedUserVoucher;
  }
}
