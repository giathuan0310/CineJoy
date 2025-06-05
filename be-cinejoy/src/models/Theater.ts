import { Schema, model, Document } from "mongoose";

export interface ITheater extends Document {
    name: string;
    regionId: Schema.Types.ObjectId;
    location: {
        city: string;
        address: string;
    };
}

const TheaterSchema = new Schema<ITheater>({
    name: { type: String, required: true },
    regionId: { type: Schema.Types.ObjectId, required: true, ref: "Region" },
    location: {
        city: { type: String, required: true },
        address: { type: String, required: true },
    },
});

export const Theater = model<ITheater>("Theater", TheaterSchema);
