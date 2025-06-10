import { Schema, model, Document, Types } from "mongoose";

export interface IRegion extends Document {

    name: string;
}

const RegionSchema = new Schema<IRegion>({

    name: { type: String, required: true },
});

export const Region = model<IRegion>("Region", RegionSchema);