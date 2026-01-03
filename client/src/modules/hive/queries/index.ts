import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { apiGet, apiPost } from "../../../lib/api";
import type { HiveDevice, HiveHeatingStatus } from "../../../lib/types/hive";

export const hiveKey = ["hive"] as const;

export function useHiveDevices() {
  return useQuery<HiveDevice[]>({
    queryKey: [...hiveKey, "devices"],
    queryFn: () => apiGet<HiveDevice[]>("/api/hive/devices"),
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000,
  });
}

export function useHiveStatus(deviceId: string | null) {
  return useQuery<HiveHeatingStatus>({
    queryKey: [...hiveKey, "status", deviceId],
    queryFn: () => {
      if (!deviceId) {
        throw new Error("Device ID is required");
      }
      return apiGet<HiveHeatingStatus>(`/api/hive/status/${deviceId}`);
    },
    enabled: deviceId !== null,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: false,
    staleTime: 10 * 1000,
  });
}

export function useSetTemperature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      deviceId,
      temperature,
    }: {
      deviceId: string;
      temperature: number;
    }) => {
      return apiPost<{ ok: boolean; temperature: number }>(
        `/api/hive/temperature/${deviceId}`,
        { temperature }
      );
    },
    onMutate: async ({ deviceId, temperature }) => {
      await queryClient.cancelQueries({
        queryKey: [...hiveKey, "status", deviceId],
      });

      const previousStatus = queryClient.getQueryData<HiveHeatingStatus>([
        ...hiveKey,
        "status",
        deviceId,
      ]);

      if (previousStatus) {
        queryClient.setQueryData<HiveHeatingStatus>(
          [...hiveKey, "status", deviceId],
          {
            ...previousStatus,
            targetTemperature: temperature,
          }
        );
      }

      return { previousStatus };
    },
    onError: (_err, variables, context) => {
      if (context?.previousStatus) {
        queryClient.setQueryData(
          [...hiveKey, "status", variables.deviceId],
          context.previousStatus
        );
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...hiveKey, "status", variables.deviceId],
      });
    },
  });
}

