import { Schema, model, Document } from "mongoose";

export interface IShowtimeSeat {
    seat: Schema.Types.ObjectId; // Reference to Seat model
    status: 'available' | 'selected' | 'booked' | 'maintenance';
    reservedUntil?: Date; // Temporary reservation
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
        room: Schema.Types.ObjectId; // Reference to Room model
        seats: IShowtimeSeat[];
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
            room: { type: Schema.Types.ObjectId, required: true, ref: "Room" },
            seats: [
                {
                    seat: { type: Schema.Types.ObjectId, required: true, ref: "Seat" },
                    status: { 
                        type: String, 
                        enum: ['available', 'selected', 'booked', 'maintenance'],
                        default: 'available',
                        required: true 
                    },
                    reservedUntil: { type: Date }
                },
            ],
        },
    ],
});

export const Showtime = model<IShowtime>("Showtime", ShowtimeSchema);
