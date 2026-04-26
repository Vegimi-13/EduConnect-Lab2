export const TARGET_TYPES = ["POST", "COMMENT"] as const;
export const REACTION_TYPES = ["LIKE", "LOVE", "HAHA"] as const;
export const MESSAGE_TYPES = ["text", "image", "file"] as const;
export type TargetType = typeof TARGET_TYPES[number];
export type ReactionType = typeof REACTION_TYPES[number];
export type MessageType = typeof MESSAGE_TYPES[number];


//Enums for posts
export const POST_VISIBILITY = ["PUBLIC", "PRIVATE", "GROUP"] as const;
export const POST_TYPES = ["TEXT", "SHARE"] as const;

export type PostVisibility = typeof POST_VISIBILITY[number];
export type PostType = typeof POST_TYPES[number];

