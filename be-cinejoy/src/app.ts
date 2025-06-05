import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import connectDB from './configs/dbconnect';
import moviesRouter from './routes/MoviesRouter';
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



// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
