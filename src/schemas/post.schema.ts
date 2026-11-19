import { z } from "zod";

export const createPostSchema = z.object({
  caption: z.string().max(2200, "Chú thích tối đa 2.200 ký tự"),
});

export type CreatePostFormValues = z.infer<typeof createPostSchema>;
