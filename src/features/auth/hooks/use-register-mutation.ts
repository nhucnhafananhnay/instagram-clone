import { useMutation } from "@tanstack/react-query";
import { registerAccount } from "@/services/auth/auth.api";

export function useRegisterMutation() {
  return useMutation({
    mutationFn: registerAccount,
    retry: false,
  });
}
