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


    async getShowtimesByTheaterMovie(theaterId: string, movieId: string) {

        // Lấy các suất chiếu mà selectedDate nằm trong khoảng showDate.start và showDate.end
        return Showtime.find({
            theaterId,
            movieId

        });
    }
}