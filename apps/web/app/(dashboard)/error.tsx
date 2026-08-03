"use client";

import { AppErrorView } from "@/components/common/app-error-view";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <AppErrorView error={error} reset={reset} source="dashboard-error" />;
}
