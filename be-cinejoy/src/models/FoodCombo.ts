import { Schema, model, Document, Types } from "mongoose";

export interface IComboItem {
  productId: Types.ObjectId;
  quantity: number;
}

export interface IFoodCombo extends Document {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  type: "single" | "combo";
  category?: string; // Chỉ cho single products
  description?: string; // Cho cả single products và combo
  items?: IComboItem[]; // Chỉ cho combo
  discountType?: "percent" | "fixed"; // Chỉ cho combo
  discountValue?: number; // Chỉ cho combo
  createdAt: Date;
  updatedAt: Date;
}

const ComboItemSchema = new Schema<IComboItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'FoodCombo', required: true },
  quantity: { type: Number, required: true, min: 1 }
});

const FoodComboSchema = new Schema<IFoodCombo>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 0, min: 0 },
  type: { 
    type: String, 
    required: true, 
    enum: ["single", "combo"],
    default: "single"
  },
  category: { 
    type: String, 
    required: function(this: IFoodCombo) { return this.type === "single"; }
  },
  description: { 
    type: String, 
    required: true // Bắt buộc cho cả single và combo
  },
  items: { 
    type: [ComboItemSchema], 
    required: function(this: IFoodCombo) { return this.type === "combo"; },
    validate: {
      validator: function(this: IFoodCombo, items: IComboItem[]) {
        return this.type !== "combo" || (items && items.length > 0);
      },
      message: 'Combo must have at least one item'
    }
  },
  discountType: { 
    type: String, 
    enum: ["percent", "fixed"],
    required: function(this: IFoodCombo) { return this.type === "combo"; }
  },
  discountValue: { 
    type: Number, 
    required: function(this: IFoodCombo) { return this.type === "combo"; },
    min: 0,
    validate: {
      validator: function(this: IFoodCombo, value: number) {
        if (this.type === "combo") {
          if (this.discountType === "percent") {
            return value >= 0 && value <= 100;
          }
          return value >= 0;
        }
        return true;
      },
      message: 'Invalid discount value'
    }
  }
}, {
  timestamps: true // Tự động tạo createdAt và updatedAt
});

// Index để tối ưu hóa truy vấn
FoodComboSchema.index({ type: 1 });
FoodComboSchema.index({ category: 1 });

// Middleware để tính lại giá combo khi có thay đổi
FoodComboSchema.pre('save', async function(this: IFoodCombo) {
  if (this.type === "combo" && this.items && this.items.length > 0) {
    let totalPrice = 0;
    
    for (const item of this.items) {
      const product = await FoodCombo.findById(item.productId);
      if (product && product.type === "single") {
        totalPrice += (product.price * item.quantity);
      }
    }
    
    // Áp dụng giảm giá
    if (this.discountType === "percent") {
      this.price = totalPrice * (1 - this.discountValue! / 100);
    } else if (this.discountType === "fixed") {
      this.price = Math.max(0, totalPrice - this.discountValue!);
    } else {
      this.price = totalPrice;
    }
  }
});

// Middleware để tính lại quantity của combo khi có thay đổi
FoodComboSchema.pre('save', async function(this: IFoodCombo) {
  if (this.type === "combo" && this.items && this.items.length > 0) {
    let minQuantity = Infinity;
    
    for (const item of this.items) {
      const product = await FoodCombo.findById(item.productId);
      if (product && product.type === "single") {
        const maxPossible = Math.floor(product.quantity / item.quantity);
        minQuantity = Math.min(minQuantity, maxPossible);
      }
    }
    
    this.quantity = minQuantity === Infinity ? 0 : minQuantity;
  }
});

export const FoodCombo = model<IFoodCombo>("FoodCombo", FoodComboSchema);
