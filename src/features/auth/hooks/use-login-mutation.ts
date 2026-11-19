import { useMutation } from "@tanstack/react-query";
import { login } from "@/services/auth/auth.api";
import { useAuthStore } from "@/stores/use-auth-store";

export function useLoginMutation() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: login,
    retry: false,
    onSuccess: (response) => setSession(response.data),
  });
}
