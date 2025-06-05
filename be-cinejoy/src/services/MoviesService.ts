import { Movie, IMovie } from "../models/Movies";

export default class MoviesService {
    // Lấy danh sách phim
    getMovies(): Promise<IMovie[]> {
        return Movie.find();
    }

    // Lấy thông tin chi tiết của một phim
    getMovieById(id: string): Promise<IMovie | null> {
        return Movie.findById(id);
    }

    // Thêm một phim mới
    addMovie(movieData: IMovie): Promise<IMovie> {
        const movie = new Movie(movieData);
        return movie.save();
    }

    // Cập nhật thông tin của một phim
    updateMovie(id: string, movieData: Partial<IMovie>): Promise<IMovie | null> {
        return Movie.findByIdAndUpdate(id, movieData, { new: true });
    }

    // Xóa một phim
    deleteMovie(id: string): Promise<IMovie | null> {
        return Movie.findByIdAndDelete(id);
    }
}