import axiosClient from "./axiosClient";


export const getShowTimes = async () => {
    try {
        const response = await axiosClient.get<IBackendResponse<IShowtime[]>>(`/showtimes`);
        return response.data;
    } catch (error) {
        console.error("Error fetching showtimes:", error);
        throw error;
    }
};

export const getShowTimesByFilter = async (movieId: string, theaterId: string) => {
    try {
        const response = await axiosClient.get<IShowtime[]>(
            `/showtimes/filter?movieId=${movieId}&theaterId=${theaterId}`
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching showtimes by filter:", error);
        throw error;
    }
};