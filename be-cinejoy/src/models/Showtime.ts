import { Schema, model, Document } from "mongoose";

export interface ISeat {
    seatId: string;
    status: string;
    type: string;
    price: number;
}

export interface IShowtime extends Document {
    movieId: Schema.Types.ObjectId;
    theaterId: Schema.Types.ObjectId;
    showDate: {
        start: Date;
        end: Date;
    };
    showTimes: Array<{
        date: Date; // ngày chiếu cụ thể (YYYY-MM-DD)
        start: Date; // giờ bắt đầu
        end: Date;   // giờ kết thúc
        room: string;
        seats: ISeat[];
    }>;
}

const ShowtimeSchema = new Schema<IShowtime>({
    movieId: { type: Schema.Types.ObjectId, required: true, ref: "Movie" },
    theaterId: { type: Schema.Types.ObjectId, required: true, ref: "Theater" },
    showDate: {
        start: { type: Date, required: true },
        end: { type: Date, required: true },
    },
    showTimes: [
        {
            date: { type: Date, required: true },
            start: { type: Date, required: true },
            end: { type: Date, required: true },
            room: { type: String, required: true },
            seats: [
                {
                    seatId: { type: String, required: true },
                    status: { type: String, required: true },
                    type: { type: String, required: true },
                    price: { type: Number, required: true },
                },
            ],
        },
    ],
});

export const Showtime = model<IShowtime>("Showtime", ShowtimeSchema);
