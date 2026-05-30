import { Request, Response } from "express";
import { prisma } from "../../../database/prismaClients";

export const getReportsOverview = async (
  _req: Request,
  res: Response,
) => {
  try {
    const [users, posts, reactions, groups, messages, follows, courses] = await prisma.$transaction([
      prisma.user.count(),
      prisma.post.count({ where: { is_deleted: false } }),
      prisma.reaction.count(),
      prisma.group.count(),
      prisma.message.count(),
      prisma.follow.count(),
      prisma.course.count(),
    ]);

    const reports = {
      users,
      posts,
      reactions,
      groups,
      messages,
      follows,
      courses,
    };

    return res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate reports overview",
      error,
    });
  }
};