import { Request, Response, NextFunction } from "express";
import followService from "../../business/services/follow.service";

const followController = {
  async sendFollowRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const targetUserId = Number(req.params.userId);
      const result = await followService.sendFollowRequest(user.userId, targetUserId);

      res.status(201).json({
        message: "Follow request sent successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async removeFollow(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const targetUserId = Number(req.params.userId);
      const result = await followService.removeFollow(user.userId, targetUserId);

      res.status(200).json({
        message: "Follow connection/request removed successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async acceptFollowRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const requesterId = Number(req.params.userId);
      const result = await followService.acceptFollowRequest(user.userId, requesterId);

      res.status(200).json({
        message: "Follow request accepted successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async rejectFollowRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const requesterId = Number(req.params.userId);
      const result = await followService.rejectFollowRequest(user.userId, requesterId);

      res.status(200).json({
        message: "Follow request rejected successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getFollowers(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.params.userId);
      const result = await followService.getFollowers(userId);

      res.status(200).json({
        message: "Followers fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getFollowing(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.params.userId);
      const result = await followService.getFollowing(userId);

      res.status(200).json({
        message: "Following fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getPendingRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await followService.getPendingRequests(user.userId);

      res.status(200).json({
        message: "Pending follow requests fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default followController;