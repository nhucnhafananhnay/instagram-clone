import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "@/services/auth/auth.api";
import type { ResetPasswordRequest } from "@/services/auth/auth.types";

export function useResetPasswordMutation(token: string) {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => resetPassword(token, data),
    retry: false,
  });
}
