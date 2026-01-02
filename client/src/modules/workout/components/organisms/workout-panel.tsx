import { CheckCircle2 } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  useWorkoutCounts,
  useRecordActualWorkout,
} from "../../queries";
import { useWorkoutCountResetChecker } from "../../utils/reset-checker";

export function WorkoutPanel() {
  useWorkoutCountResetChecker();
  
  const { data: countsData, isLoading } = useWorkoutCounts();
  const recordWorkoutMutation = useRecordActualWorkout();

  const daily = countsData?.daily ?? 0;
  const weekly = countsData?.weekly ?? 0;
  const monthly = countsData?.monthly ?? 0;
  const lastWorkoutDate = countsData?.lastWorkoutDate;

  const handleRecordWorkout = () => {
    recordWorkoutMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-white/10 p-6 bg-white/5 flex flex-col gap-6 min-h-[200px]">
        <div className="text-xs uppercase tracking-[0.2em] opacity-60">
          Workouts Tracked
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="flex justify-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 p-6 bg-white/5 flex flex-col gap-6">
      <div className="text-xs uppercase tracking-[0.2em] opacity-60">
        Workouts Tracked
      </div>

      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={handleRecordWorkout}
          disabled={recordWorkoutMutation.isPending}
          className={`px-4 py-2 rounded-lg border transition-all ${
            recordWorkoutMutation.isPending
              ? "border-white/20 bg-white/5 opacity-50 cursor-not-allowed"
              : "border-white/30 bg-white/10 hover:bg-white/15 active:bg-white/20"
          } flex items-center justify-center gap-2`}
        >
          {recordWorkoutMutation.isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Recording...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Record Workout</span>
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-xs flex justify-center uppercase tracking-[0.2em] opacity-60 mb-9">
        </div>
        <div className="flex justify-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs opacity-80 text-center invisible">
            </span>
            <div className="w-12 h-12 rounded-full border-2 border-white/30 bg-white/5 flex items-center justify-center">
              <span className="text-sm font-semibold">{daily}</span>
            </div>
            <span className="text-xs opacity-60 uppercase tracking-widest">
              Daily
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs opacity-80 text-center invisible">
            </span>
            <div className="w-12 h-12 rounded-full border-2 border-white/30 bg-white/5 flex items-center justify-center">
              <span className="text-sm font-semibold">{weekly}</span>
            </div>
            <span className="text-xs opacity-60 uppercase tracking-widest">
              Weekly
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs opacity-80 text-center invisible">
            </span>
            <div className="w-12 h-12 rounded-full border-2 border-white/30 bg-white/5 flex items-center justify-center">
              <span className="text-sm font-semibold">{monthly}</span>
            </div>
            <span className="text-xs opacity-60 uppercase tracking-widest">
              Monthly
            </span>
          </div>
        </div>
      </div>

      {lastWorkoutDate && (
        <div className="text-xs opacity-40 text-center">
          Last workout: {new Date(lastWorkoutDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

