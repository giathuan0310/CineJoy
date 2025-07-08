import dotenv from 'dotenv';
import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './configs/dbconnect';
import AuthRouter from './routes/AuthRouter';
import moviesRouter from './routes/MoviesRouter';
import theaterRouter from './routes/TheaterRouter';
import ShowtimeRouter from './routes/ShowtimeRouter';
import FoodComboRouter from './routes/FoodComboRouter';
import BlogRouter from './routes/BlogRouter';
import VoucherRouter from './routes/VoucherRouter';
import RegionRouter from './routes/RegionRouter';
import chatbotRouter from './routes/chatbotRoutes';
import UserRouter from './routes/UserRouter';
import UploadRouter from './routes/UploadRouter';
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

//import routes
app.use('/v1/api/auth', AuthRouter);
app.use("/v1/api/user", UserRouter);
app.use("/v1/api/upload", UploadRouter);
app.use('/movies', moviesRouter);
app.use('/theaters', theaterRouter);
app.use("/showtimes", ShowtimeRouter);
app.use("/foodcombos", FoodComboRouter);
app.use("/blogs", BlogRouter);
app.use("/vouchers", VoucherRouter);
app.use("/regions", RegionRouter);
app.use("/chatbot", chatbotRouter);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
