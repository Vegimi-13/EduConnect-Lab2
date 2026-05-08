import { Request, Response, NextFunction } from "express";
import roleService from "../../business/services/role.service";

const roleController = {
  async getRoles(_req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await roleService.getRoles());
    } catch (error) {
      next(error);
    }
  },

  async getPermissions(_req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await roleService.getPermissions());
    } catch (error) {
      next(error);
    }
  },

  async assignRole(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await roleService.assignRole(
        Number(req.params.userId),
        req.body.role_id,
      );

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async removeRole(req: Request, res: Response, next: NextFunction) {
    try {
      await roleService.removeRole(Number(req.params.userId), Number(req.params.roleId));
      res.status(200).json({ message: "Role removed successfully" });
    } catch (error) {
      next(error);
    }
  },

  async assignPermission(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await roleService.assignPermission(
        Number(req.params.roleId),
        req.body.permission_id,
      );

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async removePermission(req: Request, res: Response, next: NextFunction) {
    try {
      await roleService.removePermission(
        Number(req.params.roleId),
        Number(req.params.permissionId),
      );

      res.status(200).json({ message: "Permission removed successfully" });
    } catch (error) {
      next(error);
    }
  },
};

export default roleController;
