export const POST_REACTIONS = [
  "heart",
  "clap",
  "laugh",
] as const;

export type PostReactionType = (typeof POST_REACTIONS)[number];