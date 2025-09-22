import { Request, Response, NextFunction } from "express";
import VoucherService from "../services/VoucherService";
import { AuthenticatedRequest } from "../middlewares/AuthMiddleware";
const voucherService = new VoucherService();

export default class VoucherController {
    async getVouchers(req: Request, res: Response): Promise<void> {
        try {
            const vouchers = await voucherService.getVouchers();
            res.status(200).json(vouchers);
        } catch (error) {
            res.status(500).json({ message: "Error fetching vouchers", error });
        }
    }

    async getVoucherById(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        try {
            const voucher = await voucherService.getVoucherById(id);
            if (!voucher) {
                res.status(404).json({ message: "Voucher not found" });
                return;
            }
            res.status(200).json(voucher);
        } catch (error) {
            res.status(500).json({ message: "Error fetching voucher", error });
        }
    }

    async addVoucher(req: Request, res: Response): Promise<void> {
        try {
            const body = req.body as any;

            // Chuẩn hóa dữ liệu: hỗ trợ cả cấu trúc legacy và cấu trúc mới (lines)
            const applyType = body.applyType ?? 'voucher';
            const status = body.status ?? 'hoạt động';

            // Nếu chưa có lines nhưng có các trường cũ -> map sang lines[0]
            if (!Array.isArray(body.lines) || body.lines.length === 0) {
                const legacyDescription = body.description || body.name || '';
                const legacyPoints = body.pointToRedeem;
                const legacyQuantity = body.quantity;
                const legacyDiscountPercent = body.discountPercent;

                body.lines = [
                    {
                        description: legacyDescription,
                        condition: {
                            points: legacyPoints,
                            quantity: legacyQuantity,
                        },
                        discount: {
                            type: 'percent',
                            value: legacyDiscountPercent ?? 0,
                            maxValue: body.maxValue,
                        },
                        details: [],
                    },
                ];
            }

            // Bổ sung applyType/status mặc định
            body.applyType = applyType;
            body.status = status;

            // Validate cơ bản theo applyType
            const line = body.lines[0];
            if (!line || !line.description || !line.discount || line.discount.value === undefined) {
                res.status(400).json({ message: 'Thiếu thông tin khuyến mãi bắt buộc' });
                return;
            }
            if (applyType === 'voucher') {
                if (line.condition?.points === undefined || line.condition?.quantity === undefined) {
                    res.status(400).json({ message: 'Voucher cần points và quantity' });
                    return;
                }
            }
            if (applyType === 'ticket') {
                if (!line.condition?.seatType) {
                    res.status(400).json({ message: 'Ticket cần seatType' });
                    return;
                }
            }
            if (applyType === 'combo') {
                if (!line.condition?.comboId || !line.condition?.comboName) {
                    res.status(400).json({ message: 'Combo cần comboId và comboName' });
                    return;
                }
            }

            // Bổ sung mặc định cho discount.type nếu thiếu (trường hợp FE disable select)
            if (Array.isArray(body.lines) && body.lines[0]?.discount) {
                body.lines[0].discount.type = body.lines[0].discount.type || 'percent';
            }

            const newVoucher = await voucherService.addVoucher(body);
            res.status(201).json(newVoucher);
        } catch (error) {
            const message = (error as any)?.message || 'Error adding voucher';
            res.status(500).json({ message, error });
        }
    }

    async updateVoucher(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        try {
            const updatedVoucher = await voucherService.updateVoucher(id, req.body);
            if (!updatedVoucher) {
                res.status(404).json({ message: "Voucher not found" });
                return;
            }
            res.status(200).json(updatedVoucher);
        } catch (error) {
            res.status(500).json({ message: "Error updating voucher", error });
        }
    }

    async deleteVoucher(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        try {
            const deletedVoucher = await voucherService.deleteVoucher(id);
            if (!deletedVoucher) {
                res.status(404).json({ message: "Voucher not found" });
                return;
            }
            res.status(200).json({ message: "Voucher deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting voucher", error });
        }
    }

    async getMyVouchers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try { 
            const vouchers = await voucherService.getUserVouchers(req.user!._id as string);
            res.json({
                status: true,
                error: 0,
                message: "Lấy danh sách voucher thành công",
                data: vouchers
            });
        } catch (err) {
            res.status(500).json({
                status: false,
                error: 1,
                message: "Lỗi lấy voucher của bạn!",
                data: null
            });
        }
    };

    async redeemVoucher(req: any, res: any) {
        try {
            const userId = req.user!._id as string;
            const { voucherId } = req.body;
            if (!voucherId) {
                return res.status(400).json({ status: false, error: 1, message: "Thiếu voucherId", data: null });
            }
            const userVoucher = await voucherService.redeemVoucher(userId, voucherId);
            res.json({
                status: true,
                error: 0,
                message: "Đổi voucher thành công",
                data: userVoucher
            });
        } catch (err: any) {
            res.status(400).json({
                status: false,
                error: 1,
                message: err.message || "Lỗi đổi voucher",
                data: null
            });
        }
    }
}