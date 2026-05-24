import { Request, Response, NextFunction } from "express";
import searchService from "../../../business/services/search.service";
import { getSearchQuery } from "../../../shared/helper/getSearchQuery";

const searchController = {
  async searchUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await searchService.searchUsers(getSearchQuery(req));
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  },

  async searchGroups(req: Request, res: Response, next: NextFunction) {
    try {
      const groups = await searchService.searchGroups(getSearchQuery(req));

      res.status(200).json(groups);
    } catch (error) {
      next(error);
    }
  },
  async searchInstitutions(req: Request, res: Response, next: NextFunction) {
    try {
      const institutions = await searchService.searchInstitutions(
        getSearchQuery(req),
      );

      res.status(200).json(institutions);
    } catch (error) {
      next(error);
    }
  },
};

export default searchController;
