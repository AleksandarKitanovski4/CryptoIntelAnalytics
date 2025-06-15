// client/src/components/ui/spinner.tsx
import React from "react";

export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-8 w-8" : "h-6 w-6";
  return (
    <div className={`animate-spin rounded-full border-2 border-t-transparent ${dims}`} />
  );
}