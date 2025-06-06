import { Schema, model, Document, Types } from "mongoose";

export interface IRegion extends Document {
    regionId: Types.ObjectId;
    name: string;
}

const RegionSchema = new Schema<IRegion>({
    regionId: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
});

export const Region = model<IRegion>("Region", RegionSchema);