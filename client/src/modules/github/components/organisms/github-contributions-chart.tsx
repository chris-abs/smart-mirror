import { ContributionsChart } from "@/components/organisms/contributions-chart";
import {
  COLOR_SCHEMES,
  type ContributionEntry,
  type ContributionLevel,
  type ContributionsChartData,
} from "@/lib/types/contributions";
import { useGitHubContributions } from "../../queries";
import type { GitHubEntry, GitHubContributionsData } from "../../../../lib/types/github";

function transformGitHubEntryToContribution(entry: GitHubEntry): ContributionEntry {
  const contributionCount = entry.contribution_count || 0;
  
  let level: ContributionLevel = 0;
  if (contributionCount >= 20) {
    level = 4;
  } else if (contributionCount >= 10) {
    level = 3;
  } else if (contributionCount >= 5) {
    level = 2;
  } else if (contributionCount >= 1) {
    level = 1;
  }

  const date = new Date(entry.date);
  const dateStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  let tooltipText = dateStr;
  if (contributionCount > 0) {
    tooltipText += ` - ${contributionCount} contribution${contributionCount !== 1 ? "s" : ""}`;
  } else {
    tooltipText += " - No contributions";
  }

  return {
    date: entry.date,
    level,
    tooltip: tooltipText,
  };
}

function transformGitHubData(
  data: GitHubContributionsData | undefined
): ContributionsChartData | undefined {
  if (!data) return undefined;

  return {
    entries: data.entries.map(transformGitHubEntryToContribution),
    total: data.total,
  };
}

export function GitHubContributionsChart() {
  const { data, isLoading, error } = useGitHubContributions();

  const transformedData = transformGitHubData(data);

  const title = transformedData
    ? `${transformedData.total.toLocaleString()} contribution${transformedData.total !== 1 ? "s" : ""} over the last year`
    : "GitHub contributions over the last year";

  return (
    <ContributionsChart
      data={transformedData}
      isLoading={isLoading}
      error={error}
      title={title}
      colorScheme={COLOR_SCHEMES.green}
      emptyMessage="No GitHub contributions available"
      legendLabel="(contributions per day)"
      showLegend={true}
    />
  );
}
