import { Skeleton } from "@/components/ui/skeleton";
import { useContributionsData } from "../../queries";

const DAYS_IN_WEEK = 7;
const WEEKS_TO_SHOW = 53; // Approximately 365 days

function getSquareColor(hasWorkout: boolean, hasDailyExercise: boolean) {
  if (hasWorkout) {
    return "bg-blue-500";
  }
  return "bg-gray-600";
}

function getSquareBorder(hasDailyExercise: boolean) {
  if (hasDailyExercise) {
    return "border-2 border-black";
  }
  return "border border-gray-500";
}

export function ContributionsChart() {
  const { data, isLoading } = useContributionsData();

  if (isLoading) {
    return (
      <div className="rounded-xl border border-white/10 p-6 bg-white/5 flex flex-col gap-6">
        <div className="text-xs uppercase tracking-[0.2em] opacity-60">
          Workouts contributed over the last year
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!data || !data.entries || data.entries.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 p-6 bg-white/5 flex flex-col gap-6">
        <div className="text-xs uppercase tracking-[0.2em] opacity-60">
          Workouts contributed over the last year
        </div>
        <div className="text-sm opacity-60 text-center py-8">
          No workout data available
        </div>
      </div>
    );
  }

  const entries = data.entries;
  const total = data.total;

  const weeks: Array<Array<typeof entries[0] | null>> = [];
  let currentWeek: Array<typeof entries[0] | null> = [];

  const firstDate = new Date(entries[0].date);
  const firstDayOfWeek = firstDate.getDay();

  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null);
  }

  entries.forEach((entry) => {
    const date = new Date(entry.date);
    const dayOfWeek = date.getDay();

    if (currentWeek.length === DAYS_IN_WEEK) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    currentWeek.push(entry);
  });

  while (currentWeek.length < DAYS_IN_WEEK) {
    currentWeek.push(null);
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const displayWeeks = weeks.slice(-WEEKS_TO_SHOW);

  return (
    <div className="rounded-xl border border-white/10 p-6 bg-white/5 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.2em] opacity-60">
          Workouts contributed over the last year
        </div>
        <div className="text-sm font-semibold opacity-80">{total} workouts</div>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-2">
        {displayWeeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((entry, dayIndex) => {
              if (entry === null) {
                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className="w-3 h-3 rounded-sm bg-transparent"
                  />
                );
              }

              const hasWorkout = entry.has_workout;
              const hasDailyExercise = entry.has_daily_exercise;
              const date = new Date(entry.date);
              const dateStr = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              let tooltipText = dateStr;
              if (hasWorkout && hasDailyExercise) {
                tooltipText += " - Workout & Daily Exercise";
              } else if (hasWorkout) {
                tooltipText += " - Workout";
              } else if (hasDailyExercise) {
                tooltipText += " - Daily Exercise";
              } else {
                tooltipText += " - No activity";
              }

              return (
                <div
                  key={entry.date}
                  className={`w-3 h-3 rounded-sm ${getSquareColor(
                    hasWorkout,
                    hasDailyExercise
                  )} ${getSquareBorder(hasDailyExercise)} transition-all hover:scale-125 cursor-pointer`}
                  title={tooltipText}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 text-xs opacity-60">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-gray-600 border border-gray-500" />
          <span>Less</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-blue-500 border border-gray-500" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
