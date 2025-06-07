import { FoodCombo, IFoodCombo } from "../models/FoodCombo";

export default class FoodComboService {
    getFoodCombos(): Promise<IFoodCombo[]> {
        return FoodCombo.find();
    }

    getFoodComboById(id: string): Promise<IFoodCombo | null> {
        return FoodCombo.findById(id);
    }

    addFoodCombo(data: IFoodCombo): Promise<IFoodCombo> {
        const combo = new FoodCombo(data);
        return combo.save();
    }

    updateFoodCombo(id: string, data: Partial<IFoodCombo>): Promise<IFoodCombo | null> {
        return FoodCombo.findByIdAndUpdate(id, data, { new: true });
    }

    deleteFoodCombo(id: string): Promise<IFoodCombo | null> {
        return FoodCombo.findByIdAndDelete(id);
    }
}