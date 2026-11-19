import { useEffect, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { queryClient } from "@/providers/query-client";
import { useAuthStore } from "@/stores/use-auth-store";

function AuthBootstrap() {
  const restoreSession = useAuthStore((state) => state.restoreSession);
  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);
  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap />
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}
