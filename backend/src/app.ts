import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { config } from './config/env'
import authRoutes from './presentation/routes/auth.routes';

dotenv.config();

// Initialize Express app
const app = express();

// Express and Cors middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: config.cors.origin,
    credentials: true,
}));

app.use('/api/auth', authRoutes);


export default app