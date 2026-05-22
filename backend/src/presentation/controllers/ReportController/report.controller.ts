import { Request, Response } from "express";

export const getReportsOverview = async (
  _req: Request,
  res: Response,
) => {
  try {
    const reports = {
      users: 128,
      posts: 542,
      reactions: 2184,
      groups: 24,
      messages: 1032,
      follows: 412,
      courses: 16,
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