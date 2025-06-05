import { Showtime, IShowtime } from "../models/Showtime";

export default class ShowtimeService {
    async getShowtimes(): Promise<IShowtime[]> {
        return Showtime.find();
    }

    async getShowtimeById(id: string): Promise<IShowtime | null> {
        return Showtime.findById(id);
    }

    async addShowtime(showtimeData: Partial<IShowtime>): Promise<IShowtime> {
        const showtime = new Showtime(showtimeData);
        return showtime.save();
    }

    async updateShowtime(id: string, showtimeData: Partial<IShowtime>): Promise<IShowtime | null> {
        return Showtime.findByIdAndUpdate(id, showtimeData, { new: true });
    }

    async deleteShowtime(id: string): Promise<IShowtime | null> {
        return Showtime.findByIdAndDelete(id);
    }

    async getShowtimesByTheaterAndDate(theaterId: string, showDate: string): Promise<IShowtime[]> {
        // showDate dạng "YYYY-MM-DD"
        const startOfDay = new Date(showDate + "T00:00:00.000Z");
        const endOfDay = new Date(showDate + "T23:59:59.999Z");
        return Showtime.find({
            theaterId,
            showDate: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });
    }
}