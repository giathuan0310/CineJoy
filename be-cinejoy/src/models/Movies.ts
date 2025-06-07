import { Schema, model, Document } from "mongoose";

interface IReview {
  userName: string;
  comment: string;
  rating: number;
}

export interface IMovie extends Document {
  title: string;
  releaseDate: Date;
  duration: number;
  genre: string[];
  director: string;
  actors: string[];
  language: string[];
  description: string;
  trailer: string;
  status: string;
  image: string;
  posterImage: string;
  ageRating: string;
  reviews: IReview[];
  averageRating: number;
}

const MovieSchema = new Schema<IMovie>({
  title: { type: String, required: true },
  releaseDate: { type: Date, required: true },
  duration: { type: Number, required: true },
  genre: { type: [String], required: true },
  director: { type: String, required: true },
  actors: { type: [String], required: true },
  language: { type: [String], required: true },
  description: { type: String, required: true },
  trailer: { type: String },
  status: { type: String, required: true },
  image: { type: String, required: true },
  posterImage: { type: String, required: true },
  ageRating: { type: String, required: true },
  reviews: [
    {
      userName: { type: String, required: true },
      comment: { type: String, required: true },
      rating: { type: Number, required: true },
    },
  ],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  }
});

export const Movie = model<IMovie>("Movie", MovieSchema);
