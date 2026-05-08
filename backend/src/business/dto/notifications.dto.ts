import { z } from "zod";

export const NotificationQueryDto = z.object({
  unread: z
    .string()
    .optional()
    .transform((value) => value === "true"),
});

export const NotificationIdParamDto = z.object({
  id: z.string().transform((value) => Number(value)),
});

export type NotificationQueryDtoType = z.infer<typeof NotificationQueryDto>;
