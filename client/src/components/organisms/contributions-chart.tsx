import { Skeleton } from "@/components/ui/skeleton";
import type {
  ContributionEntry,
  ContributionLevel,
  ColorScheme,
  ContributionsChartProps,
} from "@/lib/types/contributions";

const DAYS_IN_WEEK = 7;
const WEEKS_TO_SHOW = 53;

function getSquareColor(level: ContributionLevel, colorScheme: ColorScheme): string {
  switch (level) {
    case 0:
      return colorScheme.level0;
    case 1:
      return colorScheme.level1;
    case 2:
      return colorScheme.level2;
    case 3:
      return colorScheme.level3;
    case 4:
      return colorScheme.level4;
    default:
      return colorScheme.level0;
  }
}

export function ContributionsChart({
  data,
  isLoading,
  error,
  title,
  colorScheme,
  emptyMessage = "No data available",
  legendLabel,
  actionButtons,
  showLegend = true,
}: ContributionsChartProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-white/10 p-6 bg-white/5 flex flex-col gap-6">
        <div className="text-xs uppercase tracking-[0.2em] opacity-60">
          {title}
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-white/10 p-6 bg-white/5 flex flex-col gap-6">
        <div className="text-xs uppercase tracking-[0.2em] opacity-60">
          {title}
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
          {title}
        </div>
        <div className="text-sm opacity-60 text-center py-8">
          {emptyMessage}
        </div>
      </div>
    );
  }

  const entries = data.entries;

  const firstDate = new Date(entries[0].date);
  const firstDayOfWeek = firstDate.getDay();
  const startDate = new Date(firstDate);
  startDate.setDate(startDate.getDate() - firstDayOfWeek);

  const entriesMap = new Map<string, ContributionEntry>();
  entries.forEach((entry) => {
    entriesMap.set(entry.date, entry);
  });

  const allDays: Array<ContributionEntry | null> = [];
  const currentDate = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  while (currentDate <= today) {
    const dateStr = currentDate.toISOString().split("T")[0];
    const entry = entriesMap.get(dateStr) || {
      date: dateStr,
      level: 0 as ContributionLevel,
    };
    allDays.push(entry);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const weeks: Array<Array<ContributionEntry | null>> = [];
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

  return (
    <div className="rounded-xl border border-white/10 p-6 bg-white/5 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.2em] opacity-60">
          {title}
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex flex-col gap-1">
            <div className="flex gap-1 overflow-x-auto pb-1">
              <div className="w-10 pr-2" />
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
              <div className="flex flex-col gap-1 pr-2 min-w-[40px]">
                {dayLabels.map((label, dayIndex) => (
                  <div
                    key={dayIndex}
                    className="w-10 h-3 flex items-center justify-end text-xs opacity-60"
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

                    const date = new Date(entry.date);
                    const dateStr = date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });

                    const tooltipText = entry.tooltip || dateStr;

                    return (
                      <div
                        key={`${weekIndex}-${dayIndex}-${entry.date}`}
                        className={`w-3 h-3 rounded ${getSquareColor(
                          entry.level,
                          colorScheme
                        )} border ${colorScheme.border} transition-colors`}
                        title={tooltipText}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {actionButtons && (
          <div className="flex flex-col gap-3 min-w-[140px]">
            {actionButtons}
          </div>
        )}
      </div>

      {showLegend && (
        <div className="flex items-center gap-4 text-xs opacity-60">
          <span>Less</span>
          <div className="flex gap-1">
            <div className={`w-3 h-3 rounded ${colorScheme.level0} border ${colorScheme.border}`} />
            <div className={`w-3 h-3 rounded ${colorScheme.level1} border ${colorScheme.border}`} />
            <div className={`w-3 h-3 rounded ${colorScheme.level2} border ${colorScheme.border}`} />
            <div className={`w-3 h-3 rounded ${colorScheme.level3} border ${colorScheme.border}`} />
            <div className={`w-3 h-3 rounded ${colorScheme.level4} border ${colorScheme.border}`} />
          </div>
          <span>More</span>
          {legendLabel && (
            <span className="ml-4 text-xs opacity-40">{legendLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
