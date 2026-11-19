interface AuthRedirectState {
  from?: {
    pathname?: string;
    search?: string;
    hash?: string;
  };
}

export function getAuthRedirectPath(state: unknown): string {
  const redirectState = state as AuthRedirectState | null;
  const pathname = redirectState?.from?.pathname;
  if (
    !pathname ||
    !pathname.startsWith("/") ||
    pathname.startsWith("//") ||
    pathname === "/login"
  ) {
    return "/";
  }
  return `${pathname}${redirectState.from?.search ?? ""}${redirectState.from?.hash ?? ""}`;
}
