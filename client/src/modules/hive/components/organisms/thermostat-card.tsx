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
      <div className="flex items-stretch gap-3">
        <div className="rounded-xl border border-white/10 p-4 bg-white/5 flex-1">
          <div className="text-xs uppercase tracking-[0.2em] opacity-60 mb-3">
            Thermostat
          </div>
          <Skeleton className="h-12 w-24 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="flex items-stretch gap-3">
        <div className="rounded-xl border border-white/10 p-4 bg-white/5 flex-1">
          <div className="text-xs uppercase tracking-[0.2em] opacity-60 mb-2">
            Thermostat
          </div>
          <div className="text-sm opacity-60">No heating device found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-stretch gap-3">
      {/* Main thermostat card */}
      <div className="rounded-xl border border-white/10 p-4 bg-white/5 flex-1">
        <div className="text-xs uppercase tracking-[0.2em] opacity-60 mb-3">
          Thermostat
        </div>
        <div>
          <div className="text-3xl font-semibold leading-none">
            {currentTemp !== null ? `${currentTemp}°` : "--°"}
          </div>
          <div className="text-sm opacity-80 mt-1">Current</div>
        </div>
      </div>

      {/* Expand/Collapse button */}
      <div className="flex items-center">
        <IconButton
          onClick={handleExpand}
          aria-label={isExpanded ? "Collapse thermostat" : "Expand thermostat"}
          className="h-full"
        >
          {isExpanded ? "‹" : "›"}
        </IconButton>
      </div>

      {/* Expanded panel - slides in from right */}
      {isExpanded && (
        <div
          className="rounded-xl border border-white/10 p-4 bg-white/5 flex flex-col items-center justify-between gap-4 min-w-[120px] animate-in slide-in-from-right"
          style={{ animationDuration: "300ms" }}
        >
          <div className="text-xs uppercase tracking-[0.2em] opacity-60">
            Target
          </div>
          <IconButton
            onClick={handleIncreaseTemp}
            disabled={setTemperatureMutation.isPending}
            aria-label="Increase temperature"
            className="w-full"
          >
            ^
          </IconButton>
          <div className="text-2xl font-semibold text-center">
            {targetTemp !== null ? `${targetTemp}°` : "--°"}
          </div>
          <IconButton
            onClick={handleDecreaseTemp}
            disabled={setTemperatureMutation.isPending}
            aria-label="Decrease temperature"
            className="w-full"
          >
            v
          </IconButton>
        </div>
      )}
    </div>
  );
}

