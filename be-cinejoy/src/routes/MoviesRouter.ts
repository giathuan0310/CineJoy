import { Router } from "express";
import MoviesController from "../controllers/MoviesController";

const router = Router();
const moviesController = new MoviesController();

router.get("/", (req, res) => moviesController.getMovies(req, res));
router.get("/:id", (req, res) => moviesController.getMovieById(req, res));
router.post("/add", (req, res) => moviesController.addMovie(req, res));
router.put("/update/:id", (req, res) => moviesController.updateMovie(req, res));
router.delete("/delete/:id", (req, res) => moviesController.deleteMovie(req, res));

export default router;