import { Request, Response } from "express";
import MoviesService from "../services/MoviesService";
const moviesService = new MoviesService();
export default class MoviesController {
    // Lấy danh sách phim
    async getMovies(req: Request, res: Response): Promise<void> {
        try {
            const movies = await moviesService.getMovies();
            res.status(200).json(movies);
        } catch (error) {
            res.status(500).json({ message: "Error fetching movies", error });
        }
    }

    // Lấy thông tin chi tiết của một phim
    async getMovieById(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        try {
            const movie = await moviesService.getMovieById(id);
            if (!movie) {
                res.status(404).json({ message: "Movie not found" });
                return;
            }
            res.status(200).json(movie);
        } catch (error) {
            res.status(500).json({ message: "Error fetching movie", error });
        }
    }

    async addMovie(req: Request, res: Response): Promise<void> {
        const movieData = req.body;
        try {
            const newMovie = await moviesService.addMovie(movieData);
            res.status(201).json(newMovie)
        } catch (error) {
            res.status(500).json({ message: "Error adding movie", error });
        }
    }
    // Cập nhật thông tin của một phim
    async updateMovie(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const movieData = req.body;
        try {
            const updatedMovie = await moviesService.updateMovie(id, movieData);
            if (!updatedMovie) {
                res.status(404).json({ message: "Movie not found" });
                return;
            }
            res.status(200).json(updatedMovie);
        } catch (error) {
            res.status(500).json({ message: "Error updating movie", error });
        }
    }
    // Xóa một phim
    async deleteMovie(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        try {
            const deletedMovie = await moviesService.deleteMovie(id);
            if (!deletedMovie) {
                res.status(404).json({ message: "Movie not found" });
                return;
            }
            res.status(200).json({ message: "Movie deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting movie", error });
        }
    }
}