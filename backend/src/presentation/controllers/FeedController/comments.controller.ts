import { Request, Response, NextFunction } from "express";
import commentService from "../../../business/services/comments.service";

const commentController = {
  // ─── CREATE COMMENT ─────────────────────
  async createComment(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const postId = Number(req.params.id);

      const comment = await commentService.createComment(
        user.userId,
        postId,
        req.body
      );

      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  },

  // ─── UPDATE COMMENT ─────────────────────
  async updateComment(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const commentId = Number(req.params.id);

      const updated = await commentService.updateComment(
        user.userId,
        commentId,
        req.body
      );

      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  },

  // ─── DELETE COMMENT ─────────────────────
  async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const commentId = Number(req.params.id);

      await commentService.deleteComment(user.userId, commentId);

      res.status(200).json({
        message: "Comment deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};

export default commentController;