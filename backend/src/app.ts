import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { config } from "./config/env";
import authRoutes from "./presentation/routes/auth.routes";
import profileRoutes from "./presentation/routes/profile.routes";
import { prisma } from "./database/prismaClients";
import reactionsRoutes from "./presentation/routes/FeedRoutes/reactions.routes";
import followRoutes from "./presentation/routes/follow.routes";
import postRoutes from "./presentation/routes/FeedRoutes/posts.routes";
import groupRoutes from "./presentation/routes/group.routes";
import commentRoutes from "./presentation/routes/FeedRoutes/comments.routes";
import messagingRoutes from './presentation/routes/message.routes'; 
import bookmarkRoutes from "./presentation/routes/FeedRoutes/bookmark.routes";
import categoryRoutes from "./presentation/routes/FeedRoutes/categories.routes"
import feedRoutes from "./presentation/routes/FeedRoutes/feed.routes";
import roleRoutes from "./presentation/routes/role.routes";
import notificationRoutes from "./presentation/routes/notification.routes";
import livekitRoutes from "./presentation/routes/livekit.routes";
dotenv.config();

// Initialize Express app
const app = express();

// Express and Cors middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/reactions", reactionsRoutes);
app.use('/api/conversations', messagingRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/posts", bookmarkRoutes)
app.use("/api/groups", groupRoutes);
app.use("/api", commentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/livekit", livekitRoutes);


// TEST ROUTE FOR PRISMA
app.get("/api/test-db", async (_req, res) => {
  try {
    const users = await prisma.user.findMany();

    res.status(200).json({
      success: true,
      message: "Prisma is working",
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("DB ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error,
    });
  }
});

export default app;
