import { ContributionsChart } from "@/components/organisms/contributions-chart";
import {
  COLOR_SCHEMES,
  type ContributionEntry,
  type ContributionLevel,
  type ContributionsChartData,
} from "@/lib/types/contributions";
import { useContributionsData } from "../../queries";
import type { WorkoutEntry } from "../../../../lib/types/workout";

function transformWorkoutEntryToContribution(entry: WorkoutEntry): ContributionEntry {
  const hasWeights = entry.has_weights || false;
  const hasClass = entry.has_class || false;
  const hasDailyExercise = entry.has_daily_exercise;

  const workoutCount = [hasWeights, hasClass, hasDailyExercise].filter(Boolean).length;
  let level: ContributionLevel = 0;
  if (workoutCount === 1) {
    level = 1;
  } else if (workoutCount === 2) {
    level = 3;
  } else if (workoutCount === 3) {
    level = 4;
  }

  const date = new Date(entry.date);
  const dateStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const workoutTypes: string[] = [];
  if (hasWeights) workoutTypes.push("Weights");
  if (hasClass) workoutTypes.push("Class");
  if (hasDailyExercise) workoutTypes.push("Dailies");

  let tooltipText = dateStr;
  if (workoutTypes.length > 0) {
    tooltipText += ` - ${workoutTypes.join(", ")}`;
  } else {
    tooltipText += " - No activity";
  }

  return {
    date: entry.date,
    level,
    tooltip: tooltipText,
  };
}

function transformWorkoutData(
  data: { entries: WorkoutEntry[]; total: number } | undefined
): ContributionsChartData | undefined {
  if (!data) return undefined;

  return {
    entries: data.entries.map(transformWorkoutEntryToContribution),
    total: data.total,
  };
}

export function WorkoutContributionsChart() {
  const { data, isLoading, error } = useContributionsData();

  const transformedData = transformWorkoutData(data);

  const title = transformedData
    ? `${transformedData.total.toLocaleString()} workout${transformedData.total !== 1 ? "s" : ""} over the last year`
    : "Workouts over the last year";

  return (
    <ContributionsChart
      data={transformedData}
      isLoading={isLoading}
      error={error}
      title={title}
      colorScheme={COLOR_SCHEMES.blue}
      emptyMessage="No workout data available"
      legendLabel="(workouts per day)"
      showLegend={true}
    />
  );
}
