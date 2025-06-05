import { Theater, ITheater } from "../models/Theater";

export default class TheaterService {
    async getTheaters(): Promise<ITheater[]> {
        return Theater.find();
    }

    async getTheaterById(id: string): Promise<ITheater | null> {
        return Theater.findById(id);
    }

    async addTheater(theaterData: Partial<ITheater>): Promise<ITheater> {
        const theater = new Theater(theaterData);
        return theater.save();
    }

    async updateTheater(id: string, theaterData: Partial<ITheater>): Promise<ITheater | null> {
        return Theater.findByIdAndUpdate(id, theaterData, { new: true });
    }

    async deleteTheater(id: string): Promise<ITheater | null> {
        return Theater.findByIdAndDelete(id);
    }
}