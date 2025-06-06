import { Router } from "express";
import FoodComboController from "../controllers/FoodComboController";

const router = Router();
const foodComboController = new FoodComboController();

router.get("/", foodComboController.getFoodCombos.bind(foodComboController));
router.get("/:id", foodComboController.getFoodComboById.bind(foodComboController));
router.post("/add", foodComboController.addFoodCombo.bind(foodComboController));
router.put("/update/:id", foodComboController.updateFoodCombo.bind(foodComboController));
router.delete("/delete/:id", foodComboController.deleteFoodCombo.bind(foodComboController));

export default router;