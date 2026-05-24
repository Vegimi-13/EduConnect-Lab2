import { Request } from "express";

export const getSearchQuery = (req: Request) => {
  return {
    q: req.query.q as string,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
  };
};
