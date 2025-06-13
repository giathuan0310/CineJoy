import axiosClient from "./axiosClient";




export const getMovies = async () => {
    try {

        const response = await axiosClient.get<IBackendResponse<IMovie[]>>("/movies");
        return response.data;
    } catch (error) {
        console.error("Error fetching movies:", error);
        throw error;
    }
};
export const getMovieById = async (id: string) => {
    try {
        const response = await axiosClient.get<IMovie>(`/movies/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching movie by ID:", error);
        throw error;
    }
};
export const createMovie = async (movie: IMovie) => {
    try {
        const response = await axiosClient.post<IMovie>("/movies/add", movie);
        return response.data;
    } catch (error) {
        console.error("Error creating movie:", error);
        throw error;
    }
};

export const updateMovie = async (id: string, movie: IMovie) => {
    try {
        const response = await axiosClient.put<IMovie>(`/movies/update/${id}`, movie);
        return response.data;
    } catch (error) {
        console.error("Error updating movie:", error);
        throw error;
    }
};

export const deleteMovie = async (id: string) => {
    try {
        const response = await axiosClient.delete<IBackendResponse<IMovie>>(`/movies/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting movie:", error);
        throw error;
    }
};
