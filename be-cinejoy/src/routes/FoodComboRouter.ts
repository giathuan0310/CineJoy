import { Router } from "express";
import FoodComboController from "../controllers/FoodComboController";

const router = Router();
const foodComboController = new FoodComboController();

// Lấy tất cả sản phẩm và combo
router.get("/", foodComboController.getFoodCombos.bind(foodComboController));

// Lấy sản phẩm đơn lẻ
router.get("/single-products", foodComboController.getSingleProducts.bind(foodComboController));

// Lấy combo
router.get("/combos", foodComboController.getCombos.bind(foodComboController));

// Lấy combo có sẵn
router.get("/available/combos", foodComboController.getAvailableCombos.bind(foodComboController));

// Lấy sản phẩm đơn lẻ có sẵn
router.get("/available/single-products", foodComboController.getAvailableSingleProducts.bind(foodComboController));

// Lấy theo category
router.get("/category/:category", foodComboController.getProductsByCategory.bind(foodComboController));

// Lấy chi tiết sản phẩm/combo
router.get("/:id", foodComboController.getFoodComboById.bind(foodComboController));

// Thêm sản phẩm đơn lẻ
router.post("/single-product", foodComboController.addSingleProduct.bind(foodComboController));

// Thêm combo
router.post("/combo", foodComboController.addCombo.bind(foodComboController));

// Cập nhật số lượng sau khi bán
router.put("/update-quantity", foodComboController.updateQuantityAfterSale.bind(foodComboController));

// Tính lại số lượng combo
router.put("/recalculate-combo-quantities", foodComboController.recalculateComboQuantities.bind(foodComboController));

// Kiểm tra combo có thể bán được không
router.get("/:id/can-sell", foodComboController.canSellCombo.bind(foodComboController));

// Cập nhật sản phẩm/combo
router.put("/update/:id", foodComboController.updateFoodCombo.bind(foodComboController));

// Xóa sản phẩm/combo
router.delete("/delete/:id", foodComboController.deleteFoodCombo.bind(foodComboController));

export default router;