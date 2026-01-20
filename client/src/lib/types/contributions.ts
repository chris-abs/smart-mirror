import type { ReactNode } from "react";

export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export interface ContributionEntry {
  date: string;
  level: ContributionLevel;
  tooltip?: string;
}

export interface ContributionsChartData {
  entries: ContributionEntry[];
  total: number;
}

export interface ColorScheme {
  level0: string;
  level1: string;
  level2: string;
  level3: string;
  level4: string;
  border: string;
}

export const COLOR_SCHEMES = {
  blue: {
    level0: "bg-neutral-900",
    level1: "bg-blue-950",
    level2: "bg-blue-800",
    level3: "bg-blue-600",
    level4: "bg-blue-500",
    border: "border-neutral-900/80",
  } as ColorScheme,
  green: {
    level0: "bg-neutral-900",
    level1: "bg-green-950",
    level2: "bg-green-800",
    level3: "bg-green-500",
    level4: "bg-green-300",
    border: "border-neutral-900/80",
  } as ColorScheme,
};

export interface ContributionsChartProps {
  data: ContributionsChartData | undefined;
  isLoading: boolean;
  error: Error | null;
  title: string;
  colorScheme: ColorScheme;
  emptyMessage?: string;
  legendLabel?: string;
  actionButtons?: ReactNode;
  showLegend?: boolean;
}
