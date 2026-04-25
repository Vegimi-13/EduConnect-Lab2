import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { config } from './config/env';
import authRoutes from './presentation/routes/auth.routes';
import profileRoutes from './presentation/routes/profile.routes';
import { prisma } from './database/prismaClients';
import reactionsRoutes from "./presentation/routes/reactions.routes";
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
app.use('/api/profile', profileRoutes);
app.use("/api/reactions", reactionsRoutes);

// TEST ROUTE FOR PRISMA
app.get('/api/test-db', async (_req, res) => {
  try {
    const users = await prisma.user.findMany();

    res.status(200).json({
      success: true,
            message: 'Prisma is working',
      count: users.length,
      data: users,
    });
  } catch (error) {
        console.error('DB ERROR:', error);
    res.status(500).json({
      success: false,
            message: 'Database connection failed',
      error,
    });
  }
});

export default app;