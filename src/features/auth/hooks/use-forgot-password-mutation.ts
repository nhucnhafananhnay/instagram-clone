import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "@/services/auth/auth.api";

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: forgotPassword,
    retry: false,
  });
}
