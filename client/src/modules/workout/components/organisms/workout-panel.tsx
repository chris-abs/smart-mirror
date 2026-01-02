import { useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Skeleton } from "@/components/ui/skeleton";
import {
  useWorkoutCounts,
  useRecordActualWorkout,
  workoutKey,
} from "../../queries";

export function WorkoutPanel() {
  const { data: countsData, isLoading } = useWorkoutCounts();
  const recordWorkoutMutation = useRecordActualWorkout();
  const queryClient = useQueryClient();
  const lastCheckedRef = useRef<{ day: number; week: number; month: number } | null>(null);

  useEffect(() => {
    const checkAndRefetch = () => {
      const now = new Date();
      
      const today = new Date(now);
      today.setHours(0, 1, 0, 0);
      if (now < today) {
        today.setDate(today.getDate() - 1);
      }
      
      const thisWeek = new Date(now);
      const dayOfWeek = thisWeek.getDay();
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      thisWeek.setDate(thisWeek.getDate() - daysFromMonday);
      thisWeek.setHours(0, 1, 0, 0);
      if (now < thisWeek) {
        thisWeek.setDate(thisWeek.getDate() - 7);
      }
      
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 1, 0, 0);
      if (now < thisMonth) {
        thisMonth.setMonth(thisMonth.getMonth() - 1);
      }
      
      const currentPeriods = {
        day: today.getTime(),
        week: thisWeek.getTime(),
        month: thisMonth.getTime(),
      };
      
      if (!lastCheckedRef.current || 
          lastCheckedRef.current.day !== currentPeriods.day ||
          lastCheckedRef.current.week !== currentPeriods.week ||
          lastCheckedRef.current.month !== currentPeriods.month) {
        queryClient.invalidateQueries({
          queryKey: [...workoutKey, "counts"],
        });
        lastCheckedRef.current = currentPeriods;
      }
    };
    
    checkAndRefetch();
    
    const intervalId = setInterval(checkAndRefetch, 60 * 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [queryClient]);

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
    <div className="rounded-xl border border-white/10 p-6 bg-white/5 flex flex-col gap-6 h-full">
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

      <div className="flex justify-center gap-6 mt-auto">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full border-2 border-white/30 bg-white/5 flex items-center justify-center">
            <span className="text-sm font-semibold">{daily}</span>
          </div>
          <span className="text-xs opacity-60 uppercase tracking-widest">
            Daily
          </span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full border-2 border-white/30 bg-white/5 flex items-center justify-center">
            <span className="text-sm font-semibold">{weekly}</span>
          </div>
          <span className="text-xs opacity-60 uppercase tracking-widest">
            Weekly
          </span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full border-2 border-white/30 bg-white/5 flex items-center justify-center">
            <span className="text-sm font-semibold">{monthly}</span>
          </div>
          <span className="text-xs opacity-60 uppercase tracking-widest">
            Monthly
          </span>
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

