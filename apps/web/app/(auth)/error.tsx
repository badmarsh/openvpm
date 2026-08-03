"use client";

import { AppErrorView } from "@/components/common/app-error-view";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <AppErrorView error={error} reset={reset} source="auth-error" />;
}
