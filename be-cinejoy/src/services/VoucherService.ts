import { Voucher, IVoucher } from "../models/Voucher";

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
}