import { useRecordWorkoutType } from "../../queries";
import { RecordWorkoutButton } from "../molecules/record-workout-button";

export function WorkoutRecordButtons() {
  const recordWorkoutTypeMutation = useRecordWorkoutType();

  const handleRecordWorkoutType = (type: "weights" | "class" | "dailies") => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    recordWorkoutTypeMutation.mutate({ dates: [todayStr], type });
  };

  const isPending = recordWorkoutTypeMutation.isPending;

  return (
    <div className="rounded-xl border border-white/10 p-4 bg-white/5 flex flex-col gap-3 w-full">
      <div className="text-xs uppercase tracking-[0.2em] opacity-60">
        Record Workout
      </div>
      <div className="flex flex-col gap-2">
        <RecordWorkoutButton
          type="weights"
          onClick={() => handleRecordWorkoutType("weights")}
          disabled={isPending}
          isPending={isPending}
        />
        <RecordWorkoutButton
          type="class"
          onClick={() => handleRecordWorkoutType("class")}
          disabled={isPending}
          isPending={isPending}
        />
        <RecordWorkoutButton
          type="dailies"
          onClick={() => handleRecordWorkoutType("dailies")}
          disabled={isPending}
          isPending={isPending}
        />
      </div>
    </div>
  );
}
