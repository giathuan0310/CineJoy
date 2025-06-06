import { Schema, model, Document } from "mongoose";

export interface IVoucher extends Document {
    name: string;
    validityPeriod: {
        startDate: Date;
        endDate: Date;
    };
    quantity: number;
}

const VoucherSchema = new Schema<IVoucher>({
    name: { type: String, required: true },
    validityPeriod: {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
    },
    quantity: { type: Number, required: true },
});

export const Voucher = model<IVoucher>("Voucher", VoucherSchema);