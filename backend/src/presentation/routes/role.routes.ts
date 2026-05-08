import { Router } from "express";
import roleController from "../controllers/role.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { validate } from "../middleware/validate.middleware";
import { validateParams } from "../middleware/validateParams.middleware";
import {
  AssignPermissionDto,
  AssignRoleDto,
  PermissionIdParamDto,
  RoleIdParamDto,
  UserIdParamDto,
} from "../../business/dto/roles.dto";

const router = Router();

router.get("/", authenticate, authorize("roles.read"), roleController.getRoles);
router.get("/permissions", authenticate, authorize("roles.read"), roleController.getPermissions);

router.post(
  "/users/:userId",
  authenticate,
  authorize("roles.manage"),
  validateParams(UserIdParamDto),
  validate(AssignRoleDto),
  roleController.assignRole,
);

router.delete(
  "/users/:userId/:roleId",
  authenticate,
  authorize("roles.manage"),
  validateParams(UserIdParamDto.merge(RoleIdParamDto)),
  roleController.removeRole,
);

router.post(
  "/:roleId/permissions",
  authenticate,
  authorize("roles.manage"),
  validateParams(RoleIdParamDto),
  validate(AssignPermissionDto),
  roleController.assignPermission,
);

router.delete(
  "/:roleId/permissions/:permissionId",
  authenticate,
  authorize("roles.manage"),
  validateParams(RoleIdParamDto.merge(PermissionIdParamDto)),
  roleController.removePermission,
);

export default router;
