"use client";

import { useEffect } from "react";
import { RefreshCw, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error for debugging (console only, no external service)
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      {/* Error icon */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red/10 text-red mb-6">
        <span className="text-4xl font-bold font-serif italic">!</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
        Something went wrong
      </h1>
      <p className="text-muted max-w-md mb-8">
        An unexpected error occurred. You can try again or navigate back to the
        home page.
      </p>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={reset}
          className={cn(
            "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl",
            "bg-accent text-background font-semibold text-sm",
            "hover:bg-accent/90 transition-colors duration-200"
          )}
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
        <button
          onClick={() => window.location.href = "/"}
          className={cn(
            "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl",
            "border border-border text-foreground font-semibold text-sm",
            "hover:bg-surface-2 hover:border-border-accent transition-colors duration-200"
          )}
        >
          <Home className="h-4 w-4" />
          Go Home
        </button>
      </div>
    </div>
  );
}
