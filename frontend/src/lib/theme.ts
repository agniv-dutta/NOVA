import { useMemo } from "react";
import { useTheme } from "next-themes";

function toHslVar(variableName: string, fallback: string): string {
  if (typeof window === "undefined") {
    return fallback;
  }

  const rawValue = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();

  return rawValue ? `hsl(${rawValue})` : fallback;
}

export function useThemePalette() {
  const { resolvedTheme } = useTheme();

  return useMemo(
    () => ({
      background: toHslVar("--background", "#ffffff"),
      border: toHslVar("--border", "#d1d5db"),
      foreground: toHslVar("--foreground", "#111827"),
      mutedForeground: toHslVar("--muted-foreground", "#64748b"),
      card: toHslVar("--card", "#ffffff"),
      popover: toHslVar("--popover", "#ffffff"),
      primary: toHslVar("--primary", "#7dd3fc"),
      chart1: toHslVar("--chart-1", "#60a5fa"),
      chart2: toHslVar("--chart-2", "#16a34a"),
      chart3: toHslVar("--chart-3", "#0891b2"),
      chart4: toHslVar("--chart-4", "#dc2626"),
      chart5: toHslVar("--chart-5", "#7c3aed"),
      riskLow: toHslVar("--risk-low", "#22c55e"),
      riskMedium: toHslVar("--risk-medium", "#3b82f6"),
      riskHigh: toHslVar("--risk-high", "#ef4444"),
      surfaceMuted: toHslVar("--muted", "#f3f4f6"),
    }),
    [resolvedTheme],
  );
}
