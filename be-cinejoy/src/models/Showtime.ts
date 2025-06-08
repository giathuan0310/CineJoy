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
    showTime: {
        start: Date;
        end: Date;
    };
    room: string;
    seats: ISeat[];
}

const ShowtimeSchema = new Schema<IShowtime>({
    movieId: { type: Schema.Types.ObjectId, required: true, ref: "Movie" },
    theaterId: { type: Schema.Types.ObjectId, required: true, ref: "Theater" },
    showDate: {
        start: { type: Date, required: true },
        end: { type: Date, required: true },
    },
    showTime: {
        start: { type: Date, required: true },
        end: { type: Date, required: true },
    },
    room: { type: String, required: true },
    seats: [
        {
            seatId: { type: String, required: true },
            status: { type: String, required: true },
            type: { type: String, required: true },
            price: { type: Number, required: true },
        },
    ],
});

export const Showtime = model<IShowtime>("Showtime", ShowtimeSchema);
