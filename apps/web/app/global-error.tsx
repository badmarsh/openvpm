"use client";

import { AppErrorView } from "@/components/common/app-error-view";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <AppErrorView error={error} reset={reset} source="global-error" />
      </body>
    </html>
  );
}
