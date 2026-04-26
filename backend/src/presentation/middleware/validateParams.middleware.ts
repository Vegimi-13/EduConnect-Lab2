import { Request, Response, NextFunction } from "express";

import { ZodType } from "zod";

export const validateParams = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      res.status(400).json({
        message: "Invalid params",

        errors: result.error.flatten().fieldErrors,
      });

      return;
    }

    req.params = result.data as typeof req.params;

    next();
  };
};
