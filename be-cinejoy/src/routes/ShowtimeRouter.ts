import { Router } from "express";
import ShowtimeController from "../controllers/ShowtimeController";

const router = Router();
const showtimeController = new ShowtimeController();

router.get("/filter", showtimeController.getShowtimesByTheaterMovie.bind(showtimeController));
router.get("/theater/:theaterId", showtimeController.getShowtimesByTheater.bind(showtimeController));
router.get("/", showtimeController.getShowtimes.bind(showtimeController));
router.get("/:id", showtimeController.getShowtimeById.bind(showtimeController));
router.post("/add", showtimeController.addShowtime.bind(showtimeController));
router.put("/update/:id", showtimeController.updateShowtime.bind(showtimeController));
router.delete("/delete/:id", showtimeController.deleteShowtime.bind(showtimeController));
// Route lấy suất chiếu theo rạp, phim và ngày
export default router;