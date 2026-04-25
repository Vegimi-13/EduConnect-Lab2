export const TARGET_TYPES = ["POST", "COMMENT"] as const;
export const REACTION_TYPES = ["LIKE", "LOVE", "HAHA"] as const;
export type TargetType = typeof TARGET_TYPES[number];
export type ReactionType = typeof REACTION_TYPES[number];

