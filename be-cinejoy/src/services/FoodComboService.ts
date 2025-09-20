import { FoodCombo, IFoodCombo, IComboItem } from "../models/FoodCombo";
import mongoose from "mongoose";

export default class FoodComboService {
    // Lấy tất cả sản phẩm và combo
    getFoodCombos(): Promise<IFoodCombo[]> {
        return FoodCombo.find().populate('items.productId').sort({ _id: -1 });
    }

    // Lấy sản phẩm đơn lẻ
    getSingleProducts(): Promise<IFoodCombo[]> {
        return FoodCombo.find({ type: "single" }).sort({ _id: -1 });
    }

    // Lấy combo
    getCombos(): Promise<IFoodCombo[]> {
        return FoodCombo.find({ type: "combo" }).populate('items.productId').sort({ _id: -1 });
    }

    // Lấy theo category
    getProductsByCategory(category: string): Promise<IFoodCombo[]> {
        return FoodCombo.find({ type: "single", category }).sort({ _id: -1 });
    }

    getFoodComboById(id: string): Promise<IFoodCombo | null> {
        return FoodCombo.findById(id).populate('items.productId');
    }

    // Thêm sản phẩm đơn lẻ
    async addSingleProduct(data: {
        name: string;
        price: number;
        category: string;
        description: string;
        quantity: number;
    }): Promise<IFoodCombo> {
        const product = new FoodCombo({
            ...data,
            type: "single"
        });
        const savedProduct = await product.save();
        
        // Tính lại số lượng combo sau khi thêm sản phẩm mới
        await this.recalculateComboQuantities();
        
        return savedProduct;
    }

    // Thêm combo
    async addCombo(data: {
        name: string;
        description: string;
        items: IComboItem[];
        discountType: "percent" | "fixed";
        discountValue: number;
    }): Promise<IFoodCombo> {
        const combo = new FoodCombo({
            ...data,
            type: "combo",
            price: 0, // Sẽ được tính tự động trong middleware
            quantity: 0 // Sẽ được tính tự động trong middleware
        });
        const savedCombo = await combo.save();
        
        // Tính lại số lượng combo sau khi thêm combo mới
        await this.recalculateComboQuantities();
        
        return savedCombo;
    }

    async updateFoodCombo(id: string, data: Partial<IFoodCombo>): Promise<IFoodCombo | null> {
        const updatedCombo = await FoodCombo.findByIdAndUpdate(id, data, { new: true }).populate('items.productId');
        
        // Tính lại số lượng combo trong cả hai trường hợp:
        // 1. Cập nhật sản phẩm đơn lẻ (ảnh hưởng đến combo khác)
        // 2. Cập nhật combo (thay đổi items hoặc số lượng)
        if (updatedCombo) {
            await this.recalculateComboQuantities();
        }
        
        return updatedCombo;
    }

    async deleteFoodCombo(id: string): Promise<IFoodCombo | null> {
        const deletedCombo = await FoodCombo.findByIdAndDelete(id);
        
        // Tính lại số lượng combo trong cả hai trường hợp:
        // 1. Xóa sản phẩm đơn lẻ (ảnh hưởng đến combo khác)
        // 2. Xóa combo (có thể ảnh hưởng đến combo khác nếu có dependency)
        if (deletedCombo) {
            await this.recalculateComboQuantities();
        }
        
        return deletedCombo;
    }

    // Cập nhật số lượng khi bán sản phẩm
    async updateQuantityAfterSale(items: Array<{ productId: string; quantity: number }>): Promise<void> {
        for (const item of items) {
            // Trừ số lượng sản phẩm đơn lẻ
            await FoodCombo.findByIdAndUpdate(
                item.productId,
                { $inc: { quantity: -item.quantity } },
                { $min: { quantity: 0 } } // Đảm bảo không âm
            );
        }

        // Tính lại số lượng combo dựa trên sản phẩm đơn lẻ
        await this.recalculateComboQuantities();
    }

    // Tính lại số lượng combo
    async recalculateComboQuantities(): Promise<void> {
        const combos = await FoodCombo.find({ type: "combo" });
        
        for (const combo of combos) {
            if (combo.items && combo.items.length > 0) {
                let minQuantity = Infinity;
                
                for (const item of combo.items) {
                    const product = await FoodCombo.findById(item.productId);
                    if (product && product.type === "single") {
                        const maxPossible = Math.floor(product.quantity / item.quantity);
                        minQuantity = Math.min(minQuantity, maxPossible);
                    }
                }
                
                combo.quantity = minQuantity === Infinity ? 0 : minQuantity;
                await combo.save();
            }
        }
    }

    // Lấy combo có sẵn (quantity > 0)
    getAvailableCombos(): Promise<IFoodCombo[]> {
        return FoodCombo.find({ 
            type: "combo", 
            quantity: { $gt: 0 } 
        }).populate('items.productId').sort({ _id: -1 });
    }

    // Lấy sản phẩm đơn lẻ có sẵn (quantity > 0)
    getAvailableSingleProducts(): Promise<IFoodCombo[]> {
        return FoodCombo.find({ 
            type: "single", 
            quantity: { $gt: 0 } 
        }).sort({ _id: -1 });
    }

    // Tính giá combo với discount
    calculateComboPrice(combo: IFoodCombo): number {
        if (combo.type !== "combo" || !combo.items) {
            return combo.price;
        }

        let totalPrice = 0;
        // Logic này sẽ được xử lý trong middleware, nhưng có thể dùng để tính toán trước
        return combo.price;
    }

    // Kiểm tra combo có thể bán được không
    async canSellCombo(comboId: string, requestedQuantity: number): Promise<boolean> {
        const combo = await FoodCombo.findById(comboId).populate('items.productId');
        if (!combo || combo.type !== "combo") {
            return false;
        }

        if (combo.quantity < requestedQuantity) {
            return false;
        }

        // Kiểm tra từng sản phẩm trong combo
        for (const item of combo.items || []) {
            const product = item.productId as any;
            if (product.type === "single" && product.quantity < (item.quantity * requestedQuantity)) {
                return false;
            }
        }

        return true;
    }
}