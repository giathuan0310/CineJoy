import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import connectDB from './configs/dbconnect';
import moviesRouter from './routes/MoviesRouter';
import theaterRouter from './routes/TheaterRouter';
import ShowtimeRouter from './routes/ShowtimeRouter';
import FoodComboRouter from './routes/FoodComboRouter';
import BlogRouter from './routes/BlogRouter';
import VoucherRouter from './routes/VoucherRouter';
import RegionRouter from './routes/RegionRouter';
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT;



// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//impoer routes
app.use('/movies', moviesRouter);
app.use('/theaters', theaterRouter);
app.use("/showtimes", ShowtimeRouter);
app.use("/food-combos", FoodComboRouter);
app.use("/blogs", BlogRouter);
app.use("/vouchers", VoucherRouter);
app.use("/regions", RegionRouter);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
