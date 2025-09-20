import { Request, Response } from "express";
import FoodComboService from "../services/FoodComboService";
const foodComboService = new FoodComboService();

export default class FoodComboController {
  // Lấy tất cả sản phẩm và combo
  async getFoodCombos(req: Request, res: Response): Promise<void> {
    try {
      const combos = await foodComboService.getFoodCombos();
      res.status(200).json(combos);
    } catch (error) {
      res.status(500).json({ message: "Error fetching food combos", error });
    }
  }

  // Lấy sản phẩm đơn lẻ
  async getSingleProducts(req: Request, res: Response): Promise<void> {
    try {
      const products = await foodComboService.getSingleProducts();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching single products", error });
    }
  }

  // Lấy combo
  async getCombos(req: Request, res: Response): Promise<void> {
    try {
      const combos = await foodComboService.getCombos();
      res.status(200).json(combos);
    } catch (error) {
      res.status(500).json({ message: "Error fetching combos", error });
    }
  }

  // Lấy combo có sẵn
  async getAvailableCombos(req: Request, res: Response): Promise<void> {
    try {
      const combos = await foodComboService.getAvailableCombos();
      res.status(200).json(combos);
    } catch (error) {
      res.status(500).json({ message: "Error fetching available combos", error });
    }
  }

  // Lấy sản phẩm đơn lẻ có sẵn
  async getAvailableSingleProducts(req: Request, res: Response): Promise<void> {
    try {
      const products = await foodComboService.getAvailableSingleProducts();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching available single products", error });
    }
  }

  // Lấy theo category
  async getProductsByCategory(req: Request, res: Response): Promise<void> {
    const { category } = req.params;
    try {
      const products = await foodComboService.getProductsByCategory(category);
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching products by category", error });
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

  // Thêm sản phẩm đơn lẻ
  async addSingleProduct(req: Request, res: Response): Promise<void> {
    try {
      const { name, price, category, description, quantity } = req.body;
      
      // Validation
      if (!name || !price || !category || !description || quantity === undefined) {
        res.status(400).json({ message: "Missing required fields for single product" });
        return;
      }

      const newProduct = await foodComboService.addSingleProduct({
        name,
        price,
        category,
        description,
        quantity
      });
      
      res.status(201).json(newProduct);
    } catch (error) {
      res.status(500).json({ message: "Error adding single product", error });
    }
  }

  // Thêm combo
  async addCombo(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, items, discountType, discountValue } = req.body;
      
      // Validation
      if (!name || !description || !items || !discountType || discountValue === undefined) {
        res.status(400).json({ message: "Missing required fields for combo" });
        return;
      }

      if (!Array.isArray(items) || items.length === 0) {
        res.status(400).json({ message: "Combo must have at least one item" });
        return;
      }

      const newCombo = await foodComboService.addCombo({
        name,
        description,
        items,
        discountType,
        discountValue
      });
      
      res.status(201).json(newCombo);
    } catch (error) {
      res.status(500).json({ message: "Error adding combo", error });
    }
  }

  // Cập nhật số lượng sau khi bán
  async updateQuantityAfterSale(req: Request, res: Response): Promise<void> {
    try {
      const { items } = req.body;
      
      if (!Array.isArray(items)) {
        res.status(400).json({ message: "Items must be an array" });
        return;
      }

      await foodComboService.updateQuantityAfterSale(items);
      res.status(200).json({ message: "Quantity updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error updating quantity", error });
    }
  }

  // Tính lại số lượng combo
  async recalculateComboQuantities(req: Request, res: Response): Promise<void> {
    try {
      await foodComboService.recalculateComboQuantities();
      res.status(200).json({ message: "Combo quantities recalculated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error recalculating combo quantities", error });
    }
  }

  // Kiểm tra combo có thể bán được không
  async canSellCombo(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { quantity } = req.query;
    
    try {
      const canSell = await foodComboService.canSellCombo(id, parseInt(quantity as string));
      res.status(200).json({ canSell });
    } catch (error) {
      res.status(500).json({ message: "Error checking combo availability", error });
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
