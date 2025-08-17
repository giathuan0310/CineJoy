import { IShowtime, Showtime } from "../models/Showtime";





class ShowtimeService {
    async getShowtimes(): Promise<IShowtime[]> {
        try {
            const showtimes = await Showtime.find()
                .populate('movieId', 'title')
                .populate('theaterId', 'name');
            return showtimes;
        } catch (error) {
            throw error;
        }
    }

    async getShowtimeById(id: string): Promise<IShowtime | null> {
        try {
            const showtime = await Showtime.findById(id)
                .populate('movieId', 'title')
                .populate('theaterId', 'name');
            return showtime;
        } catch (error) {
            throw error;
        }
    }

    async addShowtime(showtimeData: Partial<IShowtime>): Promise<IShowtime> {
        try {
            const newShowtime = new Showtime(showtimeData);
            await newShowtime.save();
            return newShowtime;
        } catch (error) {
            throw error;
        }
    }

    async updateShowtime(id: string, showtimeData: Partial<IShowtime>): Promise<IShowtime | null> {
        try {
            const updatedShowtime = await Showtime.findByIdAndUpdate(
                id,
                showtimeData,
                { new: true }
            );
            return updatedShowtime;
        } catch (error) {
            throw error;
        }
    }

    async deleteShowtime(id: string): Promise<IShowtime | null> {
        try {
            const deletedShowtime = await Showtime.findByIdAndDelete(id);
            return deletedShowtime;
        } catch (error) {
            throw error;
        }
    }

    async getShowtimesByTheaterMovie(theaterId: string, movieId: string): Promise<IShowtime[]> {
        try {
            const showtimes = await Showtime.find({
                theaterId,
                movieId
            })
                .populate('movieId', 'title')
                .populate('theaterId', 'name');
            return showtimes;
        } catch (error) {
            throw error;
        }
    }

    async getShowtimesByTheater(theaterId: string): Promise<IShowtime[]> {
        try {
            const showtimes = await Showtime.find({
                theaterId,
            })
                .populate('movieId', 'title ageRating genre')
                .populate('theaterId', 'name');
            return showtimes;
        } catch (error) {
            throw error;
        }
    }
}

export default ShowtimeService;