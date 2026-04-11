import Link from "next/link";
import { Home, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      {/* 404 number */}
      <div className="text-8xl sm:text-9xl font-bold text-accent/20 font-serif italic select-none mb-2">
        404
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
        Page not found
      </h1>
      <p className="text-muted max-w-md mb-8">
        The page you are looking for does not exist or may have been moved. Try
        navigating back to the curriculum or searching for what you need.
      </p>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className={cn(
            "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl",
            "bg-accent text-background font-semibold text-sm",
            "hover:bg-accent/90 transition-colors duration-200"
          )}
        >
          <Home className="h-4 w-4" />
          Go Home
        </Link>
        <Link
          href="/curriculum"
          className={cn(
            "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl",
            "border border-border text-foreground font-semibold text-sm",
            "hover:bg-surface-2 hover:border-border-accent transition-colors duration-200"
          )}
        >
          <BookOpen className="h-4 w-4" />
          Browse Curriculum
        </Link>
      </div>
    </div>
  );
}
