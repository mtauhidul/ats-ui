import { z } from "zod";

export const schema = z.object({
  id: z.number(),
  header: z.string(),
  type: z.string(),
  status: z.string(),
  target: z.number(),
  limit: z.number(),
  reviewer: z.string(),
});
