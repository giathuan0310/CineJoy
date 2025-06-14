import express, { Application } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './configs/dbconnect';
import authRouter from './routes/AuthRouter';
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

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Access-Control-Allow-Headers",
        "Origin",
        "Accept",
        "X-Requested-With",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
        "Access-Control-Allow-Credentials",
        "delay",
        ],
        exposedHeaders: ["Set-Cookie"],
        optionsSuccessStatus: 204,
    })
);

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

//import routes
app.use('/v1/api/auth', authRouter);
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
