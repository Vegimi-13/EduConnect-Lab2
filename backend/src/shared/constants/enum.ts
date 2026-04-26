export const TARGET_TYPES = ["POST", "COMMENT"] as const;
export const REACTION_TYPES = ["LIKE", "LOVE", "HAHA"] as const;
export const MESSAGE_TYPES = ["text", "image", "file"] as const;
export type TargetType = typeof TARGET_TYPES[number];
export type ReactionType = typeof REACTION_TYPES[number];
export type MessageType = typeof MESSAGE_TYPES[number];

