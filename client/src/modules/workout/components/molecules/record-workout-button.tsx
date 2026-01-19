import { CheckCircle2 } from "lucide-react";

interface RecordWorkoutButtonProps {
  type: "weights" | "class" | "dailies";
  onClick: () => void;
  disabled: boolean;
  isPending: boolean;
}

const typeLabels: Record<"weights" | "class" | "dailies", string> = {
  weights: "Weights",
  class: "Class",
  dailies: "Dailies",
};

export function RecordWorkoutButton({
  type,
  onClick,
  disabled,
  isPending,
}: RecordWorkoutButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-2.5 py-1.5 rounded-md border transition-all text-xs ${
        isPending
          ? "border-white/20 bg-white/5 opacity-50 cursor-not-allowed"
          : "border-white/30 bg-white/10 hover:bg-white/15 active:bg-white/20"
      } flex items-center justify-center gap-1.5`}
    >
      {isPending ? (
        <>
          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Recording...</span>
        </>
      ) : (
        <>
          <CheckCircle2 className="w-3 h-3" />
          <span>Record {typeLabels[type]}</span>
        </>
      )}
    </button>
  );
}
