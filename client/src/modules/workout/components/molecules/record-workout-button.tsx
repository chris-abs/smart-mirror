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
      className={`px-4 py-2.5 rounded-lg border transition-all text-sm ${
        isPending
          ? "border-white/10 bg-white/5 opacity-50 cursor-not-allowed"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 active:bg-white/15"
      } flex items-center justify-center gap-2 text-white/80 hover:text-white`}
    >
      {isPending ? (
        <>
          <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          <span>Recording...</span>
        </>
      ) : (
        <>
          <CheckCircle2 className="w-4 h-4" />
          <span>Record {typeLabels[type]}</span>
        </>
      )}
    </button>
  );
}
