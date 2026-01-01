import { useState, useMemo } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { IconButton } from "@/components/atoms/icon-button";
import { useHiveDevices, useHiveStatus, useSetTemperature } from "../../queries";

export function ThermostatCard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: devices, isLoading: devicesLoading } = useHiveDevices();

  const primaryDevice = useMemo(() => {
    if (!devices || devices.length === 0) return null;
    return devices.find((d) => d.type === "heating") || devices[0];
  }, [devices]);

  const { data: status, isLoading: statusLoading } = useHiveStatus(
    primaryDevice?.id || null
  );

  const setTemperatureMutation = useSetTemperature();

  const isLoading = devicesLoading || statusLoading;
  const currentTemp = status?.temperature ?? null;
  const targetTemp = status?.targetTemperature ?? null;

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleIncreaseTemp = () => {
    if (!primaryDevice) return;
    const currentTarget = targetTemp ?? 20;
    const newTemp = Math.min(30, currentTarget + 0.5);
    setTemperatureMutation.mutate({
      deviceId: primaryDevice.id,
      temperature: newTemp,
    });
  };

  const handleDecreaseTemp = () => {
    if (!primaryDevice) return;
    const currentTarget = targetTemp ?? 20;
    const newTemp = Math.max(5, currentTarget - 0.5);
    setTemperatureMutation.mutate({
      deviceId: primaryDevice.id,
      temperature: newTemp,
    });
  };

  if (isLoading && !status) {
    return (
      <div className="rounded-xl border border-white/10 p-4 bg-white/5">
        <div className="text-xs uppercase tracking-[0.2em] opacity-60 mb-3">
          Thermostat
        </div>
        <Skeleton className="h-12 w-24 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  if (!status) {
    return (
      <div className="rounded-xl border border-white/10 p-4 bg-white/5">
        <div className="text-xs uppercase tracking-[0.2em] opacity-60 mb-2">
          Thermostat
        </div>
        <div className="text-sm opacity-60">No heating device found</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 p-4 bg-white/5">
      <div className="flex items-start justify-between mb-3">
        <div className="text-xs uppercase tracking-[0.2em] opacity-60">
          Thermostat
        </div>
        <IconButton onClick={handleExpand} aria-label="Expand thermostat">
          {isExpanded ? "‹" : "›"}
        </IconButton>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <div className="text-3xl font-semibold leading-none">
            {currentTemp !== null ? `${currentTemp}°` : "--°"}
          </div>
          <div className="text-sm opacity-80 mt-1">Current</div>
        </div>

        {isExpanded && (
          <div className="pt-4 border-t border-white/10">
            <div className="text-xs uppercase tracking-[0.2em] opacity-60 mb-3">
              Target
            </div>
            <div className="flex items-center gap-3">
              <IconButton
                onClick={handleDecreaseTemp}
                disabled={setTemperatureMutation.isPending}
                aria-label="Decrease temperature"
              >
                v
              </IconButton>
              <div className="flex-1 text-center">
                <div className="text-2xl font-semibold">
                  {targetTemp !== null ? `${targetTemp}°` : "--°"}
                </div>
              </div>
              <IconButton
                onClick={handleIncreaseTemp}
                disabled={setTemperatureMutation.isPending}
                aria-label="Increase temperature"
              >
                ^
              </IconButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

