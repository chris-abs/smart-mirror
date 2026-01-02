import { Flame, CheckCircle2, RotateCcw } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { IconButton } from "@/components/atoms/icon-button";
import {
  useWorkoutStreak,
  useRecordWorkout,
  useResetWorkoutStreak,
} from "../../queries";

const DAILY_REQUIREMENTS = [
  { exercise: "Sit Ups", reps: 150 },
  { exercise: "Push Ups", reps: 100 },
  { exercise: "Pull Ups", reps: 25 },
  { exercise: "Skipping", mins: 15 },
] as const;

export function WorkoutStreak() {
  const { data: streakData, isLoading } = useWorkoutStreak();
  const recordWorkoutMutation = useRecordWorkout();
  const resetStreakMutation = useResetWorkoutStreak();

  const streak = streakData?.streak ?? 0;
  const lastWorkoutDate = streakData?.lastWorkoutDate;

  const handleRecordWorkout = () => {
    recordWorkoutMutation.mutate();
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset your workout streak?")) {
      resetStreakMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-white/10 p-6 bg-white/5 flex flex-col items-center gap-4 min-h-[200px]">
        <div className="text-xs uppercase tracking-[0.2em] opacity-60">
          Daily Exercise Streak
        </div>
        <Skeleton className="h-20 w-20 rounded-full" />
        <Skeleton className="h-8 w-24" />
      </div>
    );
  }

  const isToday = lastWorkoutDate
    ? new Date(lastWorkoutDate).toDateString() === new Date().toDateString()
    : false;

  return (
    <div className="rounded-xl border border-white/10 p-6 bg-white/5 flex flex-col gap-6 relative">
      <div className="flex justify-between items-start">
        <div className="text-xs uppercase tracking-[0.2em] opacity-60">
        Daily Exercise Streak
        </div>
        {streak > 0 && (
          <IconButton
            onClick={handleReset}
            disabled={resetStreakMutation.isPending}
            aria-label="Reset streak"
            className="opacity-30 hover:opacity-60 p-1! min-w-0! -mt-0.5"
          >
            <RotateCcw className="w-3 h-3" />
          </IconButton>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <Flame
            className={`w-16 h-16 ${
              streak > 0 ? "text-orange-500" : "text-white/20"
            } transition-colors`}
          />
          {streak > 0 && (
            <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {streak}
            </div>
          )}
        </div>
        <div className="text-3xl font-bold">{streak}</div>
        <div className="text-sm opacity-60">
          {streak === 0
            ? "Start your streak today!"
            : streak === 1
              ? "day in a row"
              : "days in a row"}
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={handleRecordWorkout}
          disabled={recordWorkoutMutation.isPending || isToday}
          className={`px-4 py-2 rounded-lg border transition-all ${
            isToday
              ? "border-white/20 bg-white/5 opacity-50 cursor-not-allowed"
              : recordWorkoutMutation.isPending
                ? "border-white/20 bg-white/5 opacity-50 cursor-not-allowed"
                : "border-white/30 bg-white/10 hover:bg-white/15 active:bg-white/20"
          } flex items-center justify-center gap-2`}
        >
          {recordWorkoutMutation.isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Recording...</span>
            </>
          ) : isToday ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Exercises completed today</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Record Exercises</span>
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col gap-2 mt-auto">
        <div className="text-xs flex justify-center uppercase tracking-[0.2em] opacity-60 mb-1">
          Daily Requirements
        </div>
        <div className="grid grid-cols-4 gap-3">
          {DAILY_REQUIREMENTS.map((req) => (
            <div
              key={req.exercise}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-xs opacity-80 text-center">
                {req.exercise}
              </span>
              <div className="w-12 h-12 rounded-full border-2 border-white/30 bg-white/5 flex items-center justify-center">
                <span className="text-sm font-semibold">
                  {"reps" in req ? req.reps : req.mins}
                </span>
              </div>
              <span className="text-xs opacity-60 text-center">
                {"reps" in req ? "reps" : "mins"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {lastWorkoutDate && (
        <div className="text-xs opacity-40 text-center">
          Last completed: {new Date(lastWorkoutDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

