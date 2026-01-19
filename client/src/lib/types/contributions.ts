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
  level0: string; // No contributions
  level1: string; // Low contributions
  level2: string; // Medium contributions
  level3: string; // High contributions
  level4: string; // Very high contributions
  border: string;
}

export const COLOR_SCHEMES = {
  blue: {
    level0: "bg-gray-600",
    level1: "bg-blue-400",
    level2: "bg-blue-500",
    level3: "bg-blue-600",
    level4: "bg-blue-800",
    border: "border-gray-500",
  } as ColorScheme,
  green: {
    level0: "bg-gray-600",
    level1: "bg-green-500",
    level2: "bg-green-600",
    level3: "bg-green-700",
    level4: "bg-green-800",
    border: "border-gray-500",
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
