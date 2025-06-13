import { Request, Response } from "express";
import MoviesService from "../services/MoviesService";
const moviesService = new MoviesService();
import upload from "../configs/cloudconfig";

// Thêm interface cho Request với file
interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

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

    async addMovie(req: MulterRequest, res: Response): Promise<void> {
        try {

            // Sử dụng middleware upload.fields để xử lý nhiều file upload
            upload.fields([
                { name: 'image', maxCount: 1 },
                { name: 'posterImage', maxCount: 1 }
            ])(req, res, async (err) => {
                if (err) {
                    console.error('Upload error:', err);
                    return res.status(400).json({
                        message: "Error uploading images",
                        error: err.message,
                        details: err
                    });
                }

                try {
                    const movieData = { ...req.body };

                    // Xử lý các trường array từ JSON string
                    ['genre', 'actors', 'language', 'reviews'].forEach(field => {
                        if (movieData[field]) {
                            try {
                                movieData[field] = JSON.parse(movieData[field]);
                                console.log(`Parsed ${field}:`, movieData[field]);
                            } catch (e) {
                                console.error(`Error parsing ${field}:`, e);
                                movieData[field] = [];
                            }
                        }
                    });

                    // Lấy URLs từ Cloudinary
                    if (req.files) {
                        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
                        console.log('Uploaded files:', files);

                        if (files.image) {
                            movieData.image = files.image[0].path;
                            console.log('Image URL:', movieData.image);
                        }
                        if (files.posterImage) {
                            movieData.posterImage = files.posterImage[0].path;
                            console.log('Poster URL:', movieData.posterImage);
                        }
                    }



                    const newMovie = await moviesService.addMovie(movieData);
                    res.status(201).json(newMovie);
                } catch (error: any) {
                    console.error('Error processing movie data:', error);
                    res.status(500).json({
                        message: "Error adding movie",
                        error: error.message,
                        details: error
                    });
                }
            });
        } catch (error: any) {
            console.error('Error in addMovie:', error);
            res.status(500).json({
                message: "Error processing request",
                error: error.message,
                details: error
            });
        }
    }
    // Cập nhật thông tin của một phim
    async updateMovie(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        try {
            // Sử dụng middleware upload.fields để xử lý nhiều file upload
            upload.fields([
                { name: 'image', maxCount: 1 },
                { name: 'posterImage', maxCount: 1 }
            ])(req, res, async (err) => {
                if (err) {
                    console.error('Upload error:', err);
                    return res.status(400).json({
                        message: "Error uploading images",
                        error: err.message,
                        details: err
                    });
                }

                try {
                    const movieData = { ...req.body };
                    console.log('Initial movie data:', movieData);

                    // Xử lý các trường array từ JSON string
                    ['genre', 'actors', 'language', 'reviews'].forEach(field => {
                        if (movieData[field]) {
                            try {
                                movieData[field] = JSON.parse(movieData[field]);
                                console.log(`Parsed ${field}:`, movieData[field]);
                            } catch (e) {
                                console.error(`Error parsing ${field}:`, e);
                                movieData[field] = [];
                            }
                        }
                    });

                    // Lấy URLs từ Cloudinary
                    if (req.files) {
                        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
                        console.log('Uploaded files:', files);

                        if (files.image) {
                            movieData.image = files.image[0].path;
                            console.log('Image URL:', movieData.image);
                        }
                        if (files.posterImage) {
                            movieData.posterImage = files.posterImage[0].path;
                            console.log('Poster URL:', movieData.posterImage);
                        }
                    }

                    console.log('Final movie data:', movieData);

                    const updatedMovie = await moviesService.updateMovie(id, movieData);
                    if (!updatedMovie) {
                        res.status(404).json({ message: "Movie not found" });
                        return;
                    }
                    res.status(200).json(updatedMovie);
                } catch (error: any) {
                    console.error('Error processing movie data:', error);
                    res.status(500).json({
                        message: "Error updating movie",
                        error: error.message,
                        details: error
                    });
                }
            });
        } catch (error: any) {
            console.error('Error in updateMovie:', error);
            res.status(500).json({
                message: "Error processing request",
                error: error.message,
                details: error
            });
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