import { Schema, model, Document } from "mongoose";

export interface IFoodCombo extends Document {
  name: string;
  description: string;
  price: number;
  quantity: number;
}

const FoodComboSchema = new Schema<IFoodCombo>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 0 },
});

export const FoodCombo = model<IFoodCombo>("FoodCombo", FoodComboSchema);
