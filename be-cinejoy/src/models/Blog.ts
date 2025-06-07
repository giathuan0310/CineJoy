import { Schema, model, Document } from "mongoose";

export interface IBlog extends Document {
    title: string;
    postedDate: Date;
    content: string;
    image: string;
}

const BlogSchema = new Schema<IBlog>({
    title: { type: String, required: true },
    postedDate: { type: Date, required: true },
    content: { type: String, required: true },
    image: { type: String, required: true }, // URL for blog image
});

export const Blog = model<IBlog>("Blog", BlogSchema);