import { Request, Response, NextFunction } from "express";

import categoryService from "../../../business/services/categories.service";

const categoryController = {

  // ─── GET ALL CATEGORIES ─────────────────

  async getAllCategories(req: Request, res: Response, next: NextFunction) {

    try {

      const categories = await categoryService.getAllCategories();

      res.status(200).json(categories);

    } catch (error) {

      next(error);

    }

  },

};

export default categoryController;