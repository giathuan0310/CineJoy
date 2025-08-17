import { Request, Response } from "express";
import FoodComboService from "../services/FoodComboService";
const foodComboService = new FoodComboService();

export default class FoodComboController {
  async getFoodCombos(req: Request, res: Response): Promise<void> {
    try {
      const combos = await foodComboService.getFoodCombos();
      res.status(200).json(combos);
    } catch (error) {
      res.status(500).json({ message: "Error fetching food combos", error });
    }
  }

  async getFoodComboById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const combo = await foodComboService.getFoodComboById(id);
      if (!combo) {
        res.status(404).json({ message: "Food combo not found" });
        return;
      }
      res.status(200).json(combo);
    } catch (error) {
      res.status(500).json({ message: "Error fetching food combo", error });
    }
  }

  async addFoodCombo(req: Request, res: Response): Promise<void> {
    try {
      const newCombo = await foodComboService.addFoodCombo(req.body);
      res.status(201).json(newCombo);
    } catch (error) {
      res.status(500).json({ message: "Error adding food combo", error });
    }
  }

  async updateFoodCombo(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const updatedCombo = await foodComboService.updateFoodCombo(id, req.body);
      if (!updatedCombo) {
        res.status(404).json({ message: "Food combo not found" });
        return;
      }
      res.status(200).json(updatedCombo);
    } catch (error) {
      res.status(500).json({ message: "Error updating food combo", error });
    }
  }

  async deleteFoodCombo(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const deletedCombo = await foodComboService.deleteFoodCombo(id);
      if (!deletedCombo) {
        res.status(404).json({ message: "Food combo not found" });
        return;
      }
      res.status(200).json({ message: "Food combo deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting food combo", error });
    }
  }
}
