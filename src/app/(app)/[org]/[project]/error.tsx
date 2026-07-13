"use client";

import { useEffect } from "react";

export default function ProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center">
      <div className="w-11 h-11 rounded-[var(--radius-md)] bg-[var(--component-fill)] border border-[var(--border)] outline outline-1 outline-[var(--border)] outline-offset-2 flex items-center justify-center">
        <span className="text-[var(--accent)] text-lg font-semibold">!</span>
      </div>
      <div>
        <h2 className="text-[15px] font-semibold text-[var(--fg)]">Something went wrong</h2>
        <p className="text-[13px] text-[var(--fg-muted)] mt-1 max-w-[360px]">
          This action couldn&apos;t be completed. It may be a temporary issue — try again.
        </p>
      </div>
      <button onClick={reset} className="btn-cta !h-8 !px-4 !text-[12.5px]">
        Try again
      </button>
    </div>
  );
}
