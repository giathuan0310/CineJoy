import { Schema, model, Document, Types } from "mongoose";

export interface IVoucherLineDetail {
    buyItem?: string;
    buyQuantity?: number;
    rewardItem?: string;
    rewardItemId?: Types.ObjectId;
    rewardQuantity?: number;
    rewardType?: "free" | "discount";
    rewardDiscountPercent?: number;
}

export interface IVoucherLineCondition {
    points?: number;
    quantity?: number;
    seatType?: "normal" | "vip" | "couple" | "4dx";
    comboName?: string;
    comboId?: Types.ObjectId;
}

export interface IVoucherLineDiscount {
    type: "percent" | "amount";
    value: number;
    maxValue?: number;
}

export interface IVoucherLine {
    description: string;
    condition: IVoucherLineCondition;
    discount: IVoucherLineDiscount;
    details: IVoucherLineDetail[];
}

export interface IVoucher extends Document {
    name: string;
    validityPeriod: {
        startDate: Date;
        endDate: Date;
    };
    status: "hoạt động" | "không hoạt động";
    applyType: "voucher" | "combo" | "ticket";
    lines: IVoucherLine[];
    // Legacy fields for backward compatibility
    quantity?: number;
    discountPercent?: number;
    pointToRedeem?: number;
}

const VoucherLineDetailSchema = new Schema<IVoucherLineDetail>({
    buyItem: { type: String },
    buyQuantity: { type: Number },
    rewardItem: { type: String },
    rewardItemId: { type: Schema.Types.ObjectId, ref: "FoodCombo" },
    rewardQuantity: { type: Number },
    rewardType: { type: String, enum: ["free", "discount"] },
    rewardDiscountPercent: { type: Number },
}, { _id: false });

const VoucherLineSchema = new Schema<IVoucherLine>({
    description: { type: String, required: true },
    condition: {
        points: { type: Number },
        quantity: { type: Number },
        seatType: { type: String, enum: ["normal", "vip", "couple", "4dx"] },
        comboName: { type: String },
        comboId: { type: Schema.Types.ObjectId, ref: "FoodCombo" },
    },
    discount: {
        type: { type: String, enum: ["percent", "amount"], required: true },
        value: { type: Number, required: true },
        maxValue: { type: Number },
    },
    details: { type: [VoucherLineDetailSchema], default: [] },
}, { _id: false });

const VoucherSchema = new Schema<IVoucher>({
    name: { type: String, required: true },
    validityPeriod: {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
    },
    status: { type: String, enum: ["hoạt động", "không hoạt động"], default: "hoạt động" },
    applyType: { type: String, enum: ["voucher", "combo", "ticket"], default: "voucher" },
    lines: { type: [VoucherLineSchema], default: [] },
    // Legacy fields to support old flows
    quantity: { type: Number },
    discountPercent: { type: Number },
    pointToRedeem: { type: Number },
});

export const Voucher = model<IVoucher>("Voucher", VoucherSchema);