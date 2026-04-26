import { Request, Response, NextFunction } from "express";
import bookmarkService from "../../../business/services/bookmark.service"

const bookmarkController = {
  // ─── ADD BOOKMARK ─────────────────────
  async bookmarkPost(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const postId = Number(req.params.id);

      const result = await bookmarkService.bookmarkPost(
        user.userId,
        postId
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  // ─── REMOVE BOOKMARK ───────────────────
  async unbookmarkPost(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const postId = Number(req.params.id);

      const result = await bookmarkService.unbookmarkPost(
        user.userId,
        postId
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

export default bookmarkController;