import { useMutation } from "@tanstack/react-query";
import { verifyEmail } from "@/services/auth/auth.api";

export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: verifyEmail,
    retry: false,
  });
}
