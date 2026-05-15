import { Request, Response, NextFunction } from "express";
import searchService from "../../../business/services/search.service";


const searchController = {
  async searchUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const users = await searchService.searchUsers({
        q: query,
        page,
        limit,
      });


      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  },
};

export default searchController;
