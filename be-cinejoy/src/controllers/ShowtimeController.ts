import { Request, Response } from "express";
import ShowtimeService from "../services/ShowtimeService";
const showtimeService = new ShowtimeService();

export default class ShowtimeController {
    async getShowtimes(req: Request, res: Response): Promise<void> {
        try {
            const showtimes = await showtimeService.getShowtimes();
            res.status(200).json(showtimes);
        } catch (error) {
            res.status(500).json({ message: "Error fetching showtimes", error });
        }
    }

    async getShowtimeById(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        try {
            const showtime = await showtimeService.getShowtimeById(id);
            if (!showtime) {
                res.status(404).json({ message: "Showtime not found" });
                return;
            }
            res.status(200).json(showtime);
        } catch (error) {
            res.status(500).json({ message: "Error fetching showtime", error });
        }
    }

    async addShowtime(req: Request, res: Response): Promise<void> {
        try {
            const newShowtime = await showtimeService.addShowtime(req.body);
            res.status(201).json(newShowtime);
        } catch (error) {
            res.status(500).json({ message: "Error adding showtime", error });
        }
    }

    async updateShowtime(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        try {
            const updatedShowtime = await showtimeService.updateShowtime(id, req.body);
            if (!updatedShowtime) {
                res.status(404).json({ message: "Showtime not found" });
                return;
            }
            res.status(200).json(updatedShowtime);
        } catch (error) {
            res.status(500).json({ message: "Error updating showtime", error });
        }
    }

    async deleteShowtime(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        try {
            const deletedShowtime = await showtimeService.deleteShowtime(id);
            if (!deletedShowtime) {
                res.status(404).json({ message: "Showtime not found" });
                return;
            }
            res.status(200).json({ message: "Showtime deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting showtime", error });
        }
    }

   

    async getShowtimesByTheaterMovie(req: Request, res: Response): Promise<void> {
        const { theaterId, movieId } = req.query;
        if (!theaterId || !movieId ) {
            res.status(400).json({ message: "Missing theaterId, movieId, or showDate" });
            return;
        }
        try {
            const showtimes = await showtimeService.getShowtimesByTheaterMovie(
                theaterId as string,
                movieId as string,
               
            );
            res.status(200).json(showtimes);
        } catch (error) {
            res.status(500).json({ message: "Error fetching showtimes", error });
        }
    }

    async getShowtimesByTheater(req: Request, res: Response): Promise<void> {
        const { theaterId } = req.params;
        if (!theaterId) {
            res.status(400).json({ message: "Missing theaterId" });
            return;
        }
        try {
            const showtimes = await showtimeService.getShowtimesByTheater(
                theaterId as string
            );
            res.status(200).json(showtimes);
        } catch (error) {
            res.status(500).json({ message: "Error fetching showtimes", error });
        }
    }
}