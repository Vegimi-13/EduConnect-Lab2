import { Request, Response, NextFunction } from "express";
import groupService from "../../business/services/group.service";

const groupController = {
  async createGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ message: "Unauthorized" });

      const result = await groupService.createGroup(user.userId, req.body);

      res.status(201).json({
        message: "Group created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getGroupById(req: Request, res: Response, next: NextFunction) {
    try {
      const groupId = Number(req.params.id);
      const result = await groupService.getGroupById(groupId);

      res.status(200).json({
        message: "Group fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ message: "Unauthorized" });

      const groupId = Number(req.params.id);
      const result = await groupService.updateGroup(user.userId, groupId, req.body);

      res.status(200).json({
        message: "Group updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ message: "Unauthorized" });

      const groupId = Number(req.params.id);
      const result = await groupService.deleteGroup(user.userId, groupId);

      res.status(200).json({
        message: "Group deleted successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMyGroups(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ message: "Unauthorized" });

      const result = await groupService.getMyGroups(user.userId);

      res.status(200).json({
        message: "My groups fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async joinGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ message: "Unauthorized" });

      const groupId = Number(req.params.id);
      const result = await groupService.joinGroup(user.userId, groupId);

      res.status(200).json({
        message: "Group join operation completed successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async handleJoinRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ message: "Unauthorized" });

      const groupId = Number(req.params.groupId);
      const requestId = Number(req.params.requestId);
      const { status } = req.body;

      const result = await groupService.handleJoinRequest(
        user.userId,
        groupId,
        requestId,
        status,
      );

      res.status(200).json({
        message: `Request ${status} successfully`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getGroupMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const groupId = Number(req.params.id);
      const result = await groupService.getGroupMembers(groupId);

      res.status(200).json({
        message: "Group members fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateGroupMember(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ message: "Unauthorized" });

      const groupId = Number(req.params.groupId);
      const userId = Number(req.params.userId);

      const result = await groupService.updateGroupMember(
        user.userId,
        groupId,
        userId,
        req.body,
      );

      res.status(200).json({
        message: "Group member updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async removeGroupMember(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ message: "Unauthorized" });

      const groupId = Number(req.params.groupId);
      const userId = Number(req.params.userId);

      const result = await groupService.removeGroupMember(
        user.userId,
        groupId,
        userId,
      );

      res.status(200).json({
        message: "Member removed successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async createChannel(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ message: "Unauthorized" });

      const groupId = Number(req.params.id);
      const result = await groupService.createChannel(user.userId, groupId, req.body);

      res.status(201).json({
        message: "Channel created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getGroupChannels(req: Request, res: Response, next: NextFunction) {
    try {
      const groupId = Number(req.params.id);
      const result = await groupService.getGroupChannels(groupId);

      res.status(200).json({
        message: "Group channels fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateChannel(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ message: "Unauthorized" });

      const groupId = Number(req.params.groupId);
      const channelId = Number(req.params.channelId);

      const result = await groupService.updateChannel(
        user.userId,
        groupId,
        channelId,
        req.body,
      );

      res.status(200).json({
        message: "Channel updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteChannel(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ message: "Unauthorized" });

      const groupId = Number(req.params.groupId);
      const channelId = Number(req.params.channelId);

      const result = await groupService.deleteChannel(
        user.userId,
        groupId,
        channelId,
      );

      res.status(200).json({
        message: "Channel deleted successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default groupController;