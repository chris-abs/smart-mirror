import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { workoutKey } from "../queries";

interface PeriodBoundaries {
  day: number;
  week: number;
  month: number;
}

function calculatePeriodBoundaries(now: Date): PeriodBoundaries {
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

  return {
    day: today.getTime(),
    week: thisWeek.getTime(),
    month: thisMonth.getTime(),
  };
}

export function useWorkoutCountResetChecker() {
  const queryClient = useQueryClient();
  const lastCheckedRef = useRef<PeriodBoundaries | null>(null);

  useEffect(() => {
    const checkAndRefetch = () => {
      const now = new Date();
      const currentPeriods = calculatePeriodBoundaries(now);

      if (
        !lastCheckedRef.current ||
        lastCheckedRef.current.day !== currentPeriods.day ||
        lastCheckedRef.current.week !== currentPeriods.week ||
        lastCheckedRef.current.month !== currentPeriods.month
      ) {
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
}

