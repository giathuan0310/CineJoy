import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import connectDB from './configs/dbconnect';
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Example route
app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to ViviCinema!');
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
