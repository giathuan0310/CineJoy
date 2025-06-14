import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './configs/dbconnect';
import moviesRouter from './routes/MoviesRouter';
import theaterRouter from './routes/TheaterRouter';
import ShowtimeRouter from './routes/ShowtimeRouter';
import FoodComboRouter from './routes/FoodComboRouter';
import BlogRouter from './routes/BlogRouter';
import VoucherRouter from './routes/VoucherRouter';
import RegionRouter from './routes/RegionRouter';
import chatbotRouter from './routes/chatbotRoutes';
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Cấu hình CORS để cho phép truy cập từ cả localhost và ngrok
app.use(cors({
    origin: [
        "http://localhost:3000",
        "https://*.ngrok-free.app"
    ]
}));

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

//impoer routes
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
