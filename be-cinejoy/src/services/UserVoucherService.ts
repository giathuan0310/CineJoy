import { UserVoucher } from "../models/UserVoucher";
import { IVoucher } from "../models/Voucher";
import { Types } from "mongoose";

export default class UserVoucherService {
  // Lấy tất cả voucher của user
  async getUserVouchers(userId: Types.ObjectId | string): Promise<{
    status: boolean;
    error: number;
    message: string;
    data: any;
  }> {
    try {
      const vouchers = await UserVoucher.find({ userId })
        .populate("voucherId")
        .sort({ redeemedAt: -1 });

      return {
        status: true,
        error: 0,
        message: "Lấy danh sách voucher thành công",
        data: vouchers,
      };
    } catch (error) {
      console.error("Error getting user vouchers:", error);
      return {
        status: false,
        error: 1,
        message: "Có lỗi xảy ra khi lấy danh sách voucher",
        data: null,
      };
    }
  }

  // Validate voucher code từ frontend
  async validateVoucherCode(
    code: string,
    userId?: string
  ): Promise<{
    status: boolean;
    error: number;
    message: string;
    data: any;
  }> {
    try {
      // Tìm voucher theo code trong UserVoucher collection
      const userVoucher = await UserVoucher.findOne({
        code: code,
        status: "unused",
        ...(userId && { userId }), // Nếu có userId thì check luôn
      }).populate("voucherId");

      if (!userVoucher || !userVoucher.voucherId) {
        return {
          status: false,
          error: 1,
          message: "Mã voucher không hợp lệ hoặc đã được sử dụng",
          data: null,
        };
      }

      const voucher = userVoucher.voucherId as unknown as IVoucher;

      // Kiểm tra ngày hết hạn
      if (
        voucher.validityPeriod?.endDate &&
        new Date() > voucher.validityPeriod.endDate
      ) {
        // Đánh dấu voucher expired
        await UserVoucher.findByIdAndUpdate(userVoucher._id, {
          status: "expired",
        });
        return {
          status: false,
          error: 1,
          message: "Mã voucher đã hết hạn",
          data: null,
        };
      }

      // Kiểm tra ngày bắt đầu
      if (
        voucher.validityPeriod?.startDate &&
        new Date() < voucher.validityPeriod.startDate
      ) {
        return {
          status: false,
          error: 1,
          message: "Mã voucher chưa có hiệu lực",
          data: null,
        };
      }

      // Voucher hợp lệ
      return {
        status: true,
        error: 0,
        message: "Mã voucher hợp lệ",
        data: {
          voucher: voucher,
          userVoucher: userVoucher,
          discount: voucher.discountPercent,
        },
      };
    } catch (error) {
      console.error("Error validating voucher:", error);
      return {
        status: false,
        error: 1,
        message: "Có lỗi xảy ra khi kiểm tra voucher",
        data: null,
      };
    }
  }

  // Áp dụng voucher khi thanh toán
  async applyVoucher(
    code: string,
    orderTotal: number,
    userId?: string
  ): Promise<{
    status: boolean;
    error: number;
    message: string;
    data: any;
  }> {
    try {
      const validation = await this.validateVoucherCode(code, userId);

      if (!validation.status || !validation.data) {
        return {
          status: false,
          error: validation.error,
          message: validation.message,
          data: null,
        };
      }

      // Tính số tiền giảm giá
      const discountAmount = Math.round(
        (orderTotal * validation.data.discount!) / 100
      );
      const finalTotal = Math.max(0, orderTotal - discountAmount);

      return {
        status: true,
        error: 0,
        message: "Áp dụng voucher thành công",
        data: {
          discountAmount,
          finalTotal,
          userVoucherId: (
            validation.data.userVoucher._id as Types.ObjectId
          ).toString(),
        },
      };
    } catch (error) {
      console.error("Error applying voucher:", error);
      return {
        status: false,
        error: 1,
        message: "Có lỗi xảy ra khi áp dụng voucher",
        data: null,
      };
    }
  }

  // Đánh dấu voucher đã sử dụng sau khi thanh toán thành công
  async markVoucherAsUsed(code: string): Promise<{
    status: boolean;
    error: number;
    message: string;
    data: any;
  }> {
    try {
      const result = await UserVoucher.findOneAndUpdate(
        { code: code, status: "unused" },
        {
          status: "used",
          usedAt: new Date(),
        }
      );

      if (result) {
        return {
          status: true,
          error: 0,
          message: "Đánh dấu voucher đã sử dụng thành công",
          data: result,
        };
      } else {
        return {
          status: false,
          error: 1,
          message: "Không tìm thấy voucher hoặc voucher đã được sử dụng",
          data: null,
        };
      }
    } catch (error) {
      console.error("Error marking voucher as used:", error);
      return {
        status: false,
        error: 1,
        message: "Có lỗi xảy ra khi đánh dấu voucher đã sử dụng",
        data: null,
      };
    }
  }

  // Đánh dấu voucher đã sử dụng bằng ID
  async markVoucherAsUsedById(userVoucherId: string): Promise<{
    status: boolean;
    error: number;
    message: string;
    data: any;
  }> {
    try {
      const result = await UserVoucher.findByIdAndUpdate(userVoucherId, {
        status: "used",
        usedAt: new Date(),
      });

      if (result) {
        return {
          status: true,
          error: 0,
          message: "Đánh dấu voucher đã sử dụng thành công",
          data: result,
        };
      } else {
        return {
          status: false,
          error: 1,
          message: "Không tìm thấy voucher",
          data: null,
        };
      }
    } catch (error) {
      console.error("Error marking voucher as used by ID:", error);
      return {
        status: false,
        error: 1,
        message: "Có lỗi xảy ra khi đánh dấu voucher đã sử dụng",
        data: null,
      };
    }
  }

  // Lấy voucher chưa sử dụng của user
  async getUnusedUserVouchers(userId: Types.ObjectId | string): Promise<{
    status: boolean;
    error: number;
    message: string;
    data: any;
  }> {
    try {
      const vouchers = await UserVoucher.find({
        userId,
        status: "unused",
      })
        .populate("voucherId")
        .sort({ redeemedAt: -1 });

      return {
        status: true,
        error: 0,
        message: "Lấy danh sách voucher chưa sử dụng thành công",
        data: vouchers,
      };
    } catch (error) {
      console.error("Error getting unused user vouchers:", error);
      return {
        status: false,
        error: 1,
        message: "Có lỗi xảy ra khi lấy danh sách voucher chưa sử dụng",
        data: null,
      };
    }
  }

  // Kiểm tra và cập nhật voucher hết hạn
  async updateExpiredVouchers(): Promise<{
    status: boolean;
    error: number;
    message: string;
    data: any;
  }> {
    try {
      const expiredVouchers = await UserVoucher.find({
        status: "unused",
      }).populate("voucherId");

      let updatedCount = 0;
      const now = new Date();

      for (const userVoucher of expiredVouchers) {
        const voucher = userVoucher.voucherId as unknown as IVoucher;
        if (
          voucher.validityPeriod?.endDate &&
          now > voucher.validityPeriod.endDate
        ) {
          await UserVoucher.findByIdAndUpdate(userVoucher._id, {
            status: "expired",
          });
          updatedCount++;
        }
      }

      return {
        status: true,
        error: 0,
        message: `Đã cập nhật ${updatedCount} voucher hết hạn`,
        data: { updatedCount },
      };
    } catch (error) {
      console.error("Error updating expired vouchers:", error);
      return {
        status: false,
        error: 1,
        message: "Có lỗi xảy ra khi cập nhật voucher hết hạn",
        data: null,
      };
    }
  }
}
