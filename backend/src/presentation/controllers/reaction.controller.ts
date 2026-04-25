import { Request, Response, NextFunction } from "express";
import reactionService from "../../business/services/reaction.service";

const reactionController = {
  async addReaction(req: Request, res: Response, next: NextFunction) {
    try {
      const user =req.user;

      if(!user){
        return res.status(401).json({message:"Unauthorized"});
      }
   
      const result = await reactionService.addReaction(user.userId, req.body);
      const status =
        result.action === "CREATED" ? 201 : 200;

      res.status(status).json(result);
    } catch (error) {
      next(error);
    }
  },
};

export default reactionController;
