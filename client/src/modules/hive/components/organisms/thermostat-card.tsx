import { useState, useMemo } from "react";
import { ChevronRight, ChevronLeft, ChevronUp, ChevronDown, RefreshCw } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { IconButton } from "@/components/atoms/icon-button";
import { CircularTempIndicator } from "../molecules/circular-temp-indicator";
import { useHiveDevices, useHiveStatus, useSetTemperature } from "../../queries";

export function ThermostatCard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: devices, isLoading: devicesLoading, refetch: refetchDevices } = useHiveDevices();

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
    const newTemp = Math.min(30, Math.round((currentTarget + 0.5) * 10) / 10);
    setTemperatureMutation.mutate(
      {
        deviceId: primaryDevice.id,
        temperature: newTemp,
      },
      {
        onSuccess: () => {},
      }
    );
  };

  const handleDecreaseTemp = () => {
    if (!primaryDevice) return;
    const currentTarget = targetTemp ?? 20;
    const newTemp = Math.max(5, Math.round((currentTarget - 0.5) * 10) / 10);
    setTemperatureMutation.mutate(
      {
        deviceId: primaryDevice.id,
        temperature: newTemp,
      },
      {
        onSuccess: () => {},
      }
    );
  };

  if (isLoading && !status) {
    return (
      <div className="flex items-stretch">
        <div className="rounded-l-xl border border-white/10 p-4 bg-white/5 flex-1 flex flex-col items-center gap-4 min-h-[200px] mr-1.5">
          <div className="text-xs uppercase tracking-[0.2em] opacity-60">
            Thermostat
          </div>
          <Skeleton className="h-24 w-24 rounded-full" />
        </div>

        <div className="flex items-stretch">
          <IconButton
            disabled
            aria-label="Loading"
            className="h-full self-stretch rounded-r-xl rounded-l-none opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </IconButton>
        </div>
      </div>
    );
  }

  if (!status && !devicesLoading && (!devices || devices.length === 0)) {
    return (
      <div className="flex items-stretch gap-3">
        <div className="rounded-l-xl border border-white/10 p-4 bg-white/5 flex-1 flex flex-col items-center justify-center gap-3 min-h-[200px]">
          <div className="text-xs uppercase tracking-[0.2em] opacity-60">
            Thermostat
          </div>
          <div className="text-sm opacity-60 text-center">No heating device found</div>
          <IconButton
            onClick={() => refetchDevices()}
            disabled={devicesLoading}
            aria-label="Retry connection"
            className="mt-2"
          >
            <RefreshCw className={`w-4 h-4 ${devicesLoading ? "animate-spin" : ""}`} />
          </IconButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-stretch">
      <div
        className={`border border-white/10 p-4 bg-white/5 flex-1 flex flex-col items-center gap-4 min-h-[200px] transition-all duration-300 ease-in-out ${
          isExpanded ? "rounded-xl mr-3" : "rounded-l-xl mr-1.5"
        }`}
      >
        <div className="text-xs uppercase tracking-[0.2em] opacity-60">
          Thermostat
        </div>
        <CircularTempIndicator temperature={currentTemp} size={100} />
      </div>

      <div className="flex items-stretch">
        <IconButton
          onClick={handleExpand}
          aria-label={isExpanded ? "Collapse thermostat" : "Expand thermostat"}
          className={`h-full self-stretch transition-all duration-300 ease-in-out ${
            isExpanded ? "rounded-l-xl rounded-r-none" : "rounded-r-xl rounded-l-none"
          }`}
        >
          {isExpanded ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </IconButton>
      </div>

      <div
        className={`rounded-r-xl border border-white/10 p-4 bg-white/5 flex flex-col items-center justify-between gap-4 min-h-[140px] transition-all duration-300 ease-in-out ml-1.5 ${
          isExpanded
            ? "w-[120px] opacity-100 translate-x-0"
            : "w-0 opacity-0 -translate-x-4 overflow-hidden"
        }`}
      >
        {isExpanded && (
          <>
            <div className="text-xs uppercase tracking-[0.2em] opacity-60 whitespace-nowrap">
              Target
            </div>
            <IconButton
              onClick={handleIncreaseTemp}
              disabled={setTemperatureMutation.isPending}
              aria-label="Increase temperature"
              className="w-full"
            >
              <ChevronUp className="w-4 h-4" />
            </IconButton>
            <div className="text-2xl font-semibold text-center whitespace-nowrap">
              {targetTemp !== null ? `${targetTemp}°` : "--°"}
            </div>
            <IconButton
              onClick={handleDecreaseTemp}
              disabled={setTemperatureMutation.isPending}
              aria-label="Decrease temperature"
              className="w-full"
            >
              <ChevronDown className="w-4 h-4" />
            </IconButton>
          </>
        )}
      </div>
    </div>
  );
}

