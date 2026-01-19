import { Skeleton } from "@/components/ui/skeleton";
import { useContributionsData, useRecordWorkoutType } from "../../queries";

const DAYS_IN_WEEK = 7;
const WEEKS_TO_SHOW = 53;

function getSquareColor(
  hasWeights: boolean,
  hasClass: boolean
) {
  if (hasWeights && hasClass) {
    return "bg-blue-700"; // Dark blue for both workouts
  }
  if (hasWeights || hasClass) {
    return "bg-blue-500"; // Medium blue for one workout
  }
  return "bg-gray-600"; // Gray for no workouts
}

function getSquareBorder(hasDailyExercise: boolean) {
  if (hasDailyExercise) {
    return "border border-black";
  }
  return "border border-gray-500";
}

export function ContributionsChart() {
  const { data, isLoading, error } = useContributionsData();
  const recordWorkoutTypeMutation = useRecordWorkoutType();

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

  if (error) {
    return (
      <div className="rounded-xl border border-white/10 p-6 bg-white/5 flex flex-col gap-6">
        <div className="text-xs uppercase tracking-[0.2em] opacity-60">
          Workouts contributed over the last year
        </div>
        <div className="text-sm opacity-60 text-center py-8">
          Error loading data: {error.message}
        </div>
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

  const firstDate = new Date(entries[0].date);
  const firstDayOfWeek = firstDate.getDay(); 
  const startDate = new Date(firstDate);
  startDate.setDate(startDate.getDate() - firstDayOfWeek);

  const entriesMap = new Map();
  entries.forEach((entry) => {
    entriesMap.set(entry.date, entry);
  });

  const allDays: Array<typeof entries[0] | null> = [];
  const currentDate = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  while (currentDate <= today) {
    const dateStr = currentDate.toISOString().split("T")[0];
    const entry = entriesMap.get(dateStr) || {
      date: dateStr,
      has_workout: false,
      has_daily_exercise: false,
    };
    allDays.push(entry);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const weeks: Array<Array<typeof entries[0] | null>> = [];
  for (let i = 0; i < allDays.length; i += DAYS_IN_WEEK) {
    const week = allDays.slice(i, i + DAYS_IN_WEEK);
    while (week.length < DAYS_IN_WEEK) {
      week.push(null);
    }
    weeks.push(week);
  }

  const displayWeeks = weeks.slice(-WEEKS_TO_SHOW);

  const monthLabels: Array<{ month: string; weekIndex: number }> = [];
  const seenMonths = new Set<string>();
  
  displayWeeks.forEach((week, weekIndex) => {
    for (const day of week) {
      if (day) {
        const date = new Date(day.date);
        if (date.getDate() === 1) {
          const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
          
          if (!seenMonths.has(monthKey)) {
            seenMonths.add(monthKey);
            const monthName = date.toLocaleDateString("en-US", { month: "short" });
            monthLabels.push({ month: monthName, weekIndex });
            break; 
          }
        }
      }
    }
  });

  const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""]; 

  const handleRecordWorkoutType = (type: 'weights' | 'class' | 'dailies') => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    recordWorkoutTypeMutation.mutate(
      { dates: [todayStr], type }
    );
  };

  const isPending = recordWorkoutTypeMutation.isPending;

  return (
    <div className="rounded-xl border border-white/10 p-6 bg-white/5 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.2em] opacity-60">
          {total} Workout{total !== 1 ? "s" : ""} contributed over the last year
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex flex-col gap-1">
            <div className="flex gap-1 overflow-x-auto pb-1">
              <div className="w-3 pr-2" /> 
              {displayWeeks.map((_week, weekIndex) => {
                const monthLabel = monthLabels.find((ml) => ml.weekIndex === weekIndex);
                return (
                  <div
                    key={weekIndex}
                    className="w-3 flex items-start text-xs opacity-60"
                  >
                    {monthLabel ? monthLabel.month : ""}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-1 overflow-x-auto pb-2">
              <div className="flex flex-col gap-1 pr-2">
                {dayLabels.map((label, dayIndex) => (
                  <div
                    key={dayIndex}
                    className="w-3 h-3 flex items-center justify-end text-xs opacity-60"
                  >
                    {label}
                  </div>
                ))}
              </div>

              {displayWeeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((entry, dayIndex) => {
                    if (entry === null) {
                      return (
                        <div
                          key={`${weekIndex}-${dayIndex}`}
                          className="w-3 h-3 rounded bg-transparent border border-transparent"
                        />
                      );
                    }

                    const hasDailyExercise = entry.has_daily_exercise;
                    const hasWeights = entry.has_weights || false;
                    const hasClass = entry.has_class || false;
                    const date = new Date(entry.date);
                    const dateStr = date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });

                    let tooltipText = dateStr;
                    const workoutTypes = [];
                    if (hasWeights) workoutTypes.push("Weights");
                    if (hasClass) workoutTypes.push("Class");
                    if (hasDailyExercise) workoutTypes.push("Dailies");
                    
                    if (workoutTypes.length > 0) {
                      tooltipText += ` - ${workoutTypes.join(", ")}`;
                    } else {
                      tooltipText += " - No activity";
                    }

                    return (
                      <div
                        key={`${weekIndex}-${dayIndex}-${entry.date}`}
                        className={`w-3 h-3 rounded ${getSquareColor(
                          hasWeights,
                          hasClass
                        )} ${getSquareBorder(hasDailyExercise)} transition-colors`}
                        title={tooltipText}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 min-w-[140px]">
          <button
            onClick={() => handleRecordWorkoutType('weights')}
            disabled={isPending}
            className={`px-4 py-2.5 rounded-lg border transition-all ${
              isPending
                ? "border-white/20 bg-white/5 opacity-50 cursor-not-allowed"
                : "border-white/30 bg-white/10 hover:bg-white/15 active:bg-white/20"
            } flex items-center justify-center gap-2 text-sm`}
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Recording...</span>
              </>
            ) : (
              <>
                <span>Record Weights</span>
              </>
            )}
          </button>
          <button
            onClick={() => handleRecordWorkoutType('class')}
            disabled={isPending}
            className={`px-4 py-2.5 rounded-lg border transition-all ${
              isPending
                ? "border-white/20 bg-white/5 opacity-50 cursor-not-allowed"
                : "border-white/30 bg-white/10 hover:bg-white/15 active:bg-white/20"
            } flex items-center justify-center gap-2 text-sm`}
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Recording...</span>
              </>
            ) : (
              <>
                <span>Record Class</span>
              </>
            )}
          </button>
          <button
            onClick={() => handleRecordWorkoutType('dailies')}
            disabled={isPending}
            className={`px-4 py-2.5 rounded-lg border transition-all ${
              isPending
                ? "border-white/20 bg-white/5 opacity-50 cursor-not-allowed"
                : "border-white/30 bg-white/10 hover:bg-white/15 active:bg-white/20"
            } flex items-center justify-center gap-2 text-sm`}
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Recording...</span>
              </>
            ) : (
              <>
                <span>Record Dailies</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs opacity-60">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded bg-gray-600 border border-gray-500" />
          <div className="w-3 h-3 rounded bg-blue-500 border border-gray-500" />
          <div className="w-3 h-3 rounded bg-blue-700 border border-gray-500" />
        </div>
        <span>More</span>
        <span className="ml-4 text-xs opacity-40">(One workout / Both workouts)</span>
      </div>
    </div>
  );
}
