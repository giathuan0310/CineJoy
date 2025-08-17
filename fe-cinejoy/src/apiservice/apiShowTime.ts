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

export const createShowtime = async (showtimeData: Partial<IShowtime>) => {
    try {
        const response = await axiosClient.post<IBackendResponse<IShowtime>>('/showtimes/add', showtimeData);
        return response.data;
    } catch (error) {
        console.error("Error creating showtime:", error);
        throw error;
    }
};

export const updateShowtime = async (id: string, showtimeData: Partial<IShowtime>) => {
    try {
        const response = await axiosClient.put<IBackendResponse<IShowtime>>(`/showtimes/update/${id}`, showtimeData);
        return response.data;
    } catch (error) {
        console.error("Error updating showtime:", error);
        throw error;
    }
};

export const deleteShowtime = async (id: string) => {
    try {
        const response = await axiosClient.delete<IBackendResponse<IShowtime>>(`/showtimes/delete/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting showtime:", error);
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

export const getShowTimesByTheater = async (theaterId: string) => {
    try {
        const response = await axiosClient.get<IShowtime[]>(
            `/showtimes/theater/${theaterId}`
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching showtimes by theater:", error);
        throw error;
    }
};