import { Router } from "express";
import VoucherController from "../controllers/VoucherController";

const router = Router();
const voucherController = new VoucherController();

router.get("/", voucherController.getVouchers.bind(voucherController));
router.get("/:id", voucherController.getVoucherById.bind(voucherController));
router.post("/add", voucherController.addVoucher.bind(voucherController));
router.put("/update/:id", voucherController.updateVoucher.bind(voucherController));
router.delete("/delete/:id", voucherController.deleteVoucher.bind(voucherController));

export default router;