import { Schema, model, Document } from "mongoose";

export interface IFoodCombo extends Document {
    name: string;
    price: number;
}

const FoodComboSchema = new Schema<IFoodCombo>({
    name: { type: String, required: true },
    price: { type: Number, required: true },
});

export const FoodCombo = model<IFoodCombo>("FoodCombo", FoodComboSchema);