import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .min(1)
  .max(39)
  .regex(/^(?!-)(?!.*--)[a-zA-Z0-9-]+(?<!-)$/);

export const analysisRequestSchema = z.object({ username: usernameSchema });
