import PriceList, { IPriceList, IPriceListLine } from "../models/PriceList";
import { FoodCombo } from "../models/FoodCombo";
import mongoose from "mongoose";

export interface ICreatePriceListData {
  name: string;
  startDate: Date;
  endDate: Date;
  lines: IPriceListLine[];
}

export interface IUpdatePriceListData {
  name?: string;
  startDate?: Date;
  endDate?: Date;
  lines?: IPriceListLine[];
}

class PriceListService {
  private computeStatusByDate(startDate: Date, endDate: Date): 'scheduled' | 'active' | 'expired' {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (end < today) return 'expired';
    if (start <= today && today <= end) return 'active';
    return 'scheduled';
  }

  // Đồng bộ trạng thái theo thời gian; chỉ cập nhật khi lệch
  private async syncStatusIfNeeded(priceList: IPriceList): Promise<IPriceList> {
    const expected = this.computeStatusByDate(priceList.startDate, priceList.endDate);
    if (priceList.status !== expected) {
      await PriceList.findByIdAndUpdate(priceList._id, { status: expected });
      // phản ánh ngay trong object trả về
      (priceList as any).status = expected;
    }
    return priceList;
  }

  // Lấy tất cả bảng giá
  async getAllPriceLists(): Promise<IPriceList[]> {
    const lists = await PriceList.find().sort({ startDate: -1 });
    // Đồng bộ trạng thái trước khi trả về
    const synced = await Promise.all(lists.map((pl) => this.syncStatusIfNeeded(pl)));
    return synced;
  }

  // Lấy bảng giá theo ID
  async getPriceListById(id: string): Promise<IPriceList | null> {
    const pl = await PriceList.findById(id);
    if (!pl) return null;
    return await this.syncStatusIfNeeded(pl);
  }

  // Lấy bảng giá hiện tại (active)
  async getCurrentPriceList(): Promise<IPriceList | null> {
    const now = new Date();
    const pl = await PriceList.findOne({
      startDate: { $lte: now },
      endDate: { $gte: now }
    });
    if (!pl) return null;
    return await this.syncStatusIfNeeded(pl);
  }

  // Tạo bảng giá mới
  async createPriceList(priceListData: ICreatePriceListData): Promise<IPriceList> {
    // Kiểm tra xung đột thời gian
    await this.checkTimeConflicts(priceListData.startDate, priceListData.endDate);
    
    // Lấy giá từ sản phẩm/combo nếu chưa có
    const linesWithPrices = await this.populatePricesFromProducts(priceListData.lines);
    
    const priceList = new PriceList({
      ...priceListData,
      lines: linesWithPrices
    });
    
    return await priceList.save();
  }

  // Cập nhật bảng giá
  async updatePriceList(id: string, updateData: IUpdatePriceListData): Promise<IPriceList | null> {
    const priceList = await PriceList.findById(id);
    if (!priceList) {
      throw new Error('Bảng giá không tồn tại');
    }

    // Kiểm tra quy tắc chỉnh sửa
    this.validateEditRules(priceList.status, updateData);

    // Kiểm tra xung đột thời gian nếu có thay đổi ngày
    if (updateData.startDate || updateData.endDate) {
      const startDate = updateData.startDate || priceList.startDate;
      const endDate = updateData.endDate || priceList.endDate;
      await this.checkTimeConflicts(startDate, endDate, id);
    }

    // Lấy giá từ sản phẩm/combo nếu có lines mới
    if (updateData.lines) {
      updateData.lines = await this.populatePricesFromProducts(updateData.lines);
    }

    return await PriceList.findByIdAndUpdate(id, updateData, { new: true });
  }

  // Xóa bảng giá
  async deletePriceList(id: string): Promise<boolean> {
    const priceList = await PriceList.findById(id);
    if (!priceList) {
      throw new Error('Bảng giá không tồn tại');
    }

    // Kiểm tra quy tắc xóa
    this.validateDeleteRules(priceList.status);

    const result = await PriceList.findByIdAndDelete(id);
    return !!result;
  }

  // Kiểm tra xung đột thời gian
  private async checkTimeConflicts(startDate: Date, endDate: Date, excludeId?: string): Promise<void> {
    const query: any = {
      $or: [
        // Bảng giá mới bắt đầu trong khoảng thời gian của bảng giá khác
        {
          startDate: { $lte: startDate },
          endDate: { $gte: startDate }
        },
        // Bảng giá mới kết thúc trong khoảng thời gian của bảng giá khác
        {
          startDate: { $lte: endDate },
          endDate: { $gte: endDate }
        },
        // Bảng giá mới bao trùm hoàn toàn bảng giá khác
        {
          startDate: { $gte: startDate },
          endDate: { $lte: endDate }
        }
      ]
    };

    if (excludeId) {
      query._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
    }

    const conflictingPriceList = await PriceList.findOne(query);
    if (conflictingPriceList) {
      throw new Error('Khoảng thời gian bị trùng với bảng giá khác');
    }
  }

  // Lấy giá từ sản phẩm/combo
  private async populatePricesFromProducts(lines: IPriceListLine[]): Promise<IPriceListLine[]> {
    const populatedLines = await Promise.all(lines.map(async (line) => {
      if (line.type === 'ticket') {
        // Giá ghế được nhập trực tiếp
        return line;
      } else if (line.type === 'combo' || line.type === 'single') {
        if (line.productId) {
          const product = await FoodCombo.findById(line.productId);
          if (product) {
            return {
              ...line,
              productName: product.name,
              price: line.price || product.price // Sử dụng giá đã nhập hoặc giá từ sản phẩm
            };
          }
        }
      }
      return line;
    }));

    return populatedLines;
  }

  // Kiểm tra quy tắc chỉnh sửa
  private validateEditRules(status: string, updateData: IUpdatePriceListData): void {
    if (status === 'expired') {
      throw new Error('Không thể chỉnh sửa bảng giá đã hết hạn');
    }
    
    if (status === 'active') {
      // Chỉ cho phép sửa endDate để split version
      const allowedFields = ['endDate'];
      const updateFields = Object.keys(updateData);
      const hasInvalidFields = updateFields.some(field => !allowedFields.includes(field));
      
      if (hasInvalidFields) {
        throw new Error('Bảng giá đang hoạt động chỉ có thể sửa ngày kết thúc để tạo version mới');
      }
    }
  }

  // Kiểm tra quy tắc xóa
  private validateDeleteRules(status: string): void {
    if (status === 'expired') {
      throw new Error('Không thể xóa bảng giá đã hết hạn');
    }
    
    if (status === 'active') {
      throw new Error('Không thể xóa bảng giá đang hoạt động');
    }
  }

  // Kiểm tra khoảng trống thời gian
  async checkTimeGaps(): Promise<{ hasGap: boolean; message?: string; gaps?: string[] }> {
    const priceLists = await PriceList.find().sort({ startDate: 1 });
    
    if (priceLists.length === 0) {
      return { hasGap: false };
    }

    const now = new Date();
    const firstPriceList = priceLists[0];
    const lastPriceList = priceLists[priceLists.length - 1];
    const gaps: string[] = [];

    // Kiểm tra khoảng trống ở đầu (trước bảng giá đầu tiên)
    if (firstPriceList.startDate > now) {
      const timeDiff = firstPriceList.startDate.getTime() - now.getTime();
      if (timeDiff > 24 * 60 * 60 * 1000) { // Khoảng trống lớn hơn 1 ngày
        const todayStr = now.toLocaleDateString('vi-VN');
        const startStr = firstPriceList.startDate.toLocaleDateString('vi-VN');
        gaps.push(`Khoảng trống từ ${todayStr} đến ${startStr} (trước bảng giá "${firstPriceList.name}")`);
      }
    }

    // Kiểm tra khoảng trống giữa các bảng giá
    for (let i = 0; i < priceLists.length - 1; i++) {
      const current = priceLists[i];
      const next = priceLists[i + 1];
      
      // Nếu có khoảng trống giữa endDate của bảng giá hiện tại và startDate của bảng giá tiếp theo
      const timeDiff = next.startDate.getTime() - current.endDate.getTime();
      if (timeDiff > 24 * 60 * 60 * 1000) { // Khoảng trống lớn hơn 1 ngày
        const endStr = current.endDate.toLocaleDateString('vi-VN');
        const startStr = next.startDate.toLocaleDateString('vi-VN');
        gaps.push(`Khoảng trống từ ${endStr} đến ${startStr} (giữa bảng giá "${current.name}" và "${next.name}")`);
      }
    }

    // Kiểm tra khoảng trống ở cuối (sau bảng giá cuối cùng)
    if (lastPriceList.endDate < now) {
      const endStr = lastPriceList.endDate.toLocaleDateString('vi-VN');
      const todayStr = now.toLocaleDateString('vi-VN');
      gaps.push(`Khoảng trống từ ${endStr} đến ${todayStr} (sau bảng giá "${lastPriceList.name}" đã hết hạn)`);
    }

    if (gaps.length > 0) {
      return {
        hasGap: true,
        message: `Phát hiện ${gaps.length} khoảng thời gian trống chưa có bảng giá. Xem chi tiết bên dưới để biết thời gian cụ thể.`,
        gaps: gaps
      };
    }

    return { hasGap: false };
  }

  // Lấy danh sách sản phẩm/combo để tạo bảng giá
  async getProductsForPriceList(): Promise<{ combos: any[], singleProducts: any[] }> {
    const combos = await FoodCombo.find({ type: 'combo' }).select('_id name price');
    const singleProducts = await FoodCombo.find({ type: 'single' }).select('_id name price');
    
    return { combos, singleProducts };
  }

  // Split version bảng giá
  async splitPriceListVersion(id: string, splitData: {
    newName: string;
    oldEndDate: Date;
    newStartDate: Date;
  }): Promise<IPriceList> {
    const priceList = await PriceList.findById(id);
    if (!priceList) {
      throw new Error('Bảng giá không tồn tại');
    }

    if (priceList.status !== 'active') {
      throw new Error('Chỉ có thể split version bảng giá đang hoạt động');
    }

    // Kiểm tra ngày hợp lệ
    if (splitData.oldEndDate >= splitData.newStartDate) {
      throw new Error('Ngày kết thúc bảng giá cũ phải trước ngày bắt đầu bảng giá mới');
    }

    // Lấy ngày hiện tại và reset về đầu ngày để so sánh chính xác
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const oldEndDate = new Date(splitData.oldEndDate);
    oldEndDate.setHours(0, 0, 0, 0);
    
    if (oldEndDate < today) {
      throw new Error(`Ngày kết thúc bảng giá cũ (${oldEndDate.toLocaleDateString('vi-VN')}) không thể là ngày trong quá khứ. Ngày hiện tại là ${today.toLocaleDateString('vi-VN')}`);
    }

    // Kiểm tra ngày bắt đầu bảng giá mới không được trong quá khứ
    const newStartDate = new Date(splitData.newStartDate);
    newStartDate.setHours(0, 0, 0, 0);
    
    if (newStartDate < today) {
      throw new Error(`Ngày bắt đầu bảng giá mới (${newStartDate.toLocaleDateString('vi-VN')}) không thể là ngày trong quá khứ. Ngày hiện tại là ${today.toLocaleDateString('vi-VN')}`);
    }

    // Kiểm tra không có khoảng trống thời gian
    const timeDiff = splitData.newStartDate.getTime() - splitData.oldEndDate.getTime();
    if (timeDiff > 24 * 60 * 60 * 1000) { // Nếu khoảng cách > 1 ngày
      throw new Error(`Không được có khoảng trống thời gian giữa 2 bảng giá. Khoảng cách hiện tại là ${Math.ceil(timeDiff / (24 * 60 * 60 * 1000))} ngày`);
    }

    // Sử dụng transaction để đảm bảo tính nhất quán
    const session = await PriceList.startSession();
    session.startTransaction();

    try {
      // 1. Cập nhật bảng giá cũ (kết thúc sớm)
      await PriceList.findByIdAndUpdate(
        id,
        { endDate: splitData.oldEndDate },
        { session }
      );

      // 2. Tạo bảng giá mới
      const newPriceList = new PriceList({
        name: splitData.newName,
        startDate: splitData.newStartDate,
        endDate: priceList.endDate, // Giữ nguyên ngày kết thúc ban đầu của bảng giá cũ
        lines: priceList.lines, // Copy toàn bộ lines
        status: 'scheduled' // Mặc định là scheduled
      });

      // Kiểm tra validation cuối cùng
      if (newPriceList.startDate >= newPriceList.endDate) {
        throw new Error(`Ngày bắt đầu bảng giá mới (${newPriceList.startDate.toLocaleDateString('vi-VN')}) phải trước ngày kết thúc (${newPriceList.endDate.toLocaleDateString('vi-VN')})`);
      }

      await newPriceList.save({ session });

      // Commit transaction
      await session.commitTransaction();

      return newPriceList;
    } catch (error) {
      // Rollback transaction nếu có lỗi
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

export default new PriceListService();
