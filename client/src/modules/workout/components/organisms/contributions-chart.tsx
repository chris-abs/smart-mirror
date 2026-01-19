import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useContributionsData, useBulkImportWorkouts } from "../../queries";

const DAYS_IN_WEEK = 7;
const WEEKS_TO_SHOW = 53;

function getSquareColor(hasWorkout: boolean) {
  if (hasWorkout) {
    return "bg-blue-500";
  }
  return "bg-gray-600";
}

function getSquareBorder(hasDailyExercise: boolean) {
  if (hasDailyExercise) {
    return "border border-black";
  }
  return "border border-gray-500";
}

export function ContributionsChart() {
  const { data, isLoading, error } = useContributionsData();
  const bulkImportMutation = useBulkImportWorkouts();
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

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

  const handleSquareClick = (entry: typeof entries[0]) => {
    if (!isSelectionMode) return;
    
    const dateStr = entry.date;
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(dateStr)) {
        next.delete(dateStr);
      } else {
        next.add(dateStr);
      }
      return next;
    });
  };

  const handleSubmitSelected = () => {
    if (selectedDates.size === 0) return;

    const entriesToUpdate = Array.from(selectedDates).map((dateStr) => {
      const existingEntry = entriesMap.get(dateStr);
      return {
        date: dateStr,
        has_workout: true,
        has_daily_exercise: existingEntry?.has_daily_exercise || false,
      };
    });

    bulkImportMutation.mutate(entriesToUpdate, {
      onSuccess: () => {
        setSelectedDates(new Set());
        setIsSelectionMode(false);
      },
    });
  };

  const handleCancelSelection = () => {
    setSelectedDates(new Set());
    setIsSelectionMode(false);
  };

  return (
    <div className="rounded-xl border border-white/10 p-6 bg-white/5 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.2em] opacity-60">
          Workouts contributed over the last year
        </div>
        <div className="flex items-center gap-4">
          {isSelectionMode ? (
            <>
              <span className="text-sm opacity-60">
                {selectedDates.size} selected
              </span>
              <button
                onClick={handleCancelSelection}
                className="text-xs px-3 py-1 rounded border border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitSelected}
                disabled={selectedDates.size === 0 || bulkImportMutation.isPending}
                className="text-xs px-3 py-1 rounded border border-white/30 bg-white/10 hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {bulkImportMutation.isPending ? "Updating..." : `Mark ${selectedDates.size} as workout${selectedDates.size !== 1 ? "s" : ""}`}
              </button>
            </>
          ) : (
            <>
              <div className="text-sm font-semibold opacity-80">
                {total} workouts
              </div>
              <button
                onClick={() => setIsSelectionMode(true)}
                className="text-xs px-3 py-1 rounded border border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
              >
                Select dates
              </button>
            </>
          )}
        </div>
      </div>

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

                const isSelected = selectedDates.has(entry.date);
                const isClickable = isSelectionMode && !hasWorkout;

                return (
                  <div
                    key={entry.date}
                    onClick={() => isClickable && handleSquareClick(entry)}
                    className={`w-3 h-3 rounded ${getSquareColor(
                      hasWorkout
                    )} ${getSquareBorder(hasDailyExercise)} transition-colors ${
                      isClickable ? "cursor-pointer hover:ring-2 hover:ring-white/50" : "cursor-default"
                    } ${
                      isSelected ? "ring-2 ring-blue-400 ring-offset-1 ring-offset-transparent" : ""
                    }`}
                    title={tooltipText}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs opacity-60">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded bg-gray-600 border border-gray-500" />
          <div className="w-3 h-3 rounded bg-gray-500 border border-gray-500" />
          <div className="w-3 h-3 rounded bg-blue-400 border border-gray-500" />
          <div className="w-3 h-3 rounded bg-blue-500 border border-gray-500" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
