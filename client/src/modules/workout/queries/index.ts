import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { apiGet, apiPost } from "../../../lib/api";
import type { WorkoutStreak } from "../../../lib/types/workout";

export const workoutKey = ["workout"] as const;

export function useWorkoutStreak() {
  return useQuery<WorkoutStreak>({
    queryKey: [...workoutKey, "streak"],
    queryFn: () => apiGet<WorkoutStreak>("/api/workout/streak"),
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });
}

export function useRecordWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      return apiPost<WorkoutStreak>("/api/workout/record");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...workoutKey, "streak"],
      });
    },
  });
}

export function useResetWorkoutStreak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      return apiPost<WorkoutStreak>("/api/workout/reset");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...workoutKey, "streak"],
      });
    },
  });
}

