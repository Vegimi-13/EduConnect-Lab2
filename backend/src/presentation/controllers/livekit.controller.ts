import { Request, Response, NextFunction } from "express";
import livekitService from "../../business/services/livekit.service";

const livekitController = {
  async privateCallToken(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.userId;
      const conversationId = Number(req.params.conversationId);

      const token = await livekitService.createPrivateCallToken(userId, conversationId);

      res.status(200).json({
        token,
        roomName: `private-conversation-${conversationId}`,
      });
    } catch (error) {
      next(error);
    }
  },

  async channelCallToken(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.userId;
      const channelId = Number(req.params.channelId);

      const token = await livekitService.createChannelCallToken(userId, channelId);

      res.status(200).json({
        token,
        roomName: `group-channel-${channelId}`,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default livekitController;
