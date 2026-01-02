import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { apiGet, apiPost } from "../../../lib/api";
import type { WorkoutStreak, WorkoutCounts } from "../../../lib/types/workout";

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

export function useWorkoutCounts() {
  return useQuery<WorkoutCounts>({
    queryKey: [...workoutKey, "counts"],
    queryFn: () => apiGet<WorkoutCounts>("/api/workout/counts"),
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });
}

export function useRecordActualWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      return apiPost<WorkoutCounts>("/api/workout/record-actual");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...workoutKey, "counts"],
      });
    },
  });
}


