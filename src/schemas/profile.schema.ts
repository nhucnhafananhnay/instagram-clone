import { z } from "zod";

export const editProfileSchema = z.object({
  fullName: z.string().trim().min(2, "Vui lòng nhập họ tên").max(50, "Họ tên tối đa 50 ký tự"),
  bio: z.string().max(150, "Tiểu sử tối đa 150 ký tự"),
  website: z.union([z.literal(""), z.url("Địa chỉ trang web không hợp lệ")]),
  gender: z.enum(["female", "male", "other"]),
});

export type EditProfileFormValues = z.infer<typeof editProfileSchema>;
