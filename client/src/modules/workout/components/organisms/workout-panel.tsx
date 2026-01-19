import { Skeleton } from "@/components/ui/skeleton";
import {
  useWorkoutCounts,
  useRecordWorkoutType,
} from "../../queries";
import { useWorkoutCountResetChecker } from "../../utils/reset-checker";
import { RecordWorkoutButton } from "../molecules/record-workout-button";

export function WorkoutPanel() {
  useWorkoutCountResetChecker();
  
  const { data: countsData, isLoading } = useWorkoutCounts();
  const recordWorkoutTypeMutation = useRecordWorkoutType();

  const daily = countsData?.daily ?? 0;
  const weekly = countsData?.weekly ?? 0;
  const monthly = countsData?.monthly ?? 0;
  const lastWorkoutDate = countsData?.lastWorkoutDate;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const handleRecord = (type: 'weights' | 'class' | 'dailies') => {
    recordWorkoutTypeMutation.mutate({ dates: [todayStr], type });
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-white/10 p-6 bg-white/5 flex flex-col gap-6 min-h-50">
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

      <div className="flex flex-col gap-2 w-full">
        <RecordWorkoutButton
          type="weights"
          onClick={() => handleRecord('weights')}
          disabled={recordWorkoutTypeMutation.isPending}
          isPending={recordWorkoutTypeMutation.isPending}
        />
        <RecordWorkoutButton
          type="class"
          onClick={() => handleRecord('class')}
          disabled={recordWorkoutTypeMutation.isPending}
          isPending={recordWorkoutTypeMutation.isPending}
        />
        <RecordWorkoutButton
          type="dailies"
          onClick={() => handleRecord('dailies')}
          disabled={recordWorkoutTypeMutation.isPending}
          isPending={recordWorkoutTypeMutation.isPending}
        />
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

