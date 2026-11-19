import { useMutation } from "@tanstack/react-query";
import { resendVerificationEmail } from "@/services/auth/auth.api";

export function useResendVerificationMutation() {
  return useMutation({
    mutationFn: resendVerificationEmail,
    retry: false,
  });
}
