import { Request, Response, NextFunction } from "express";
import permissionRepository from "../../persistence/repositories/permission.repository";

export const authorize = (permissionName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const allowed = await permissionRepository.userHasPermission(
        user.userId,
        permissionName,
      );

      if (!allowed) {
        return res.status(403).json({ message: "Forbidden" });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
