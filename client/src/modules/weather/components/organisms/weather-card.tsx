import { useMemo } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentWeather } from "../../queries";
import { useLocation, getDefaultWeatherLocation } from "../../../../hooks/use-location";
import type { WeatherQueryParams } from "../../../../lib/types/weather";

export function WeatherCard() {
  const { coordinates, isLoading: locationLoading } = useLocation();

  const locationParams = useMemo<WeatherQueryParams | null>(() => {
    if (locationLoading) return null;
    
    if (coordinates) {
      return {
        type: "coordinates",
        lat: coordinates.lat,
        lon: coordinates.lon,
      };
    }
    
    return getDefaultWeatherLocation();
  }, [coordinates, locationLoading]);

  const { data, isLoading, error } = useCurrentWeather(locationParams);

  if ((locationLoading || isLoading) && !data) {
    return (
      <div className="rounded-xl border border-white/10 p-4 bg-white/5 min-h-[200px]">
        <div className="text-xs uppercase tracking-[0.2em] opacity-60 mb-3">
          Weather
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div>
              <Skeleton className="h-9 w-16 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="w-16 h-16 shrink-0" />
          </div>
          <Skeleton className="h-3 w-32" />
          <div className="flex items-center gap-4 pt-2 border-t border-white/10">
            <div>
              <Skeleton className="h-3 w-16 mb-0.5" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div>
              <Skeleton className="h-3 w-16 mb-0.5" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div>
              <Skeleton className="h-3 w-12 mb-0.5" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-xl border border-red-500/40 p-4 bg-white/5">
        <div className="text-xs uppercase tracking-[0.2em] opacity-60 mb-2">
          Weather
        </div>
        <div className="text-sm text-red-300">
          Error: {(error as Error).message}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-white/10 p-4 bg-white/5">
        <div className="text-xs uppercase tracking-[0.2em] opacity-60 mb-2">
          Weather
        </div>
        <div className="text-sm opacity-60">No weather data available</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 p-4 bg-white/5 min-h-[200px]">
      <div className="text-xs uppercase tracking-[0.2em] opacity-60 mb-3">
        Weather
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-3xl font-semibold leading-none">
              {data.temperature}°
            </div>
            <div className="text-sm opacity-80 mt-1 capitalize">
              {data.description}
            </div>
          </div>
          {data.icon && (
            <img
              src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`}
              alt={data.description}
              className="w-16 h-16"
            />
          )}
        </div>

        <div className="text-xs opacity-60">
          {data.location.name}
          {data.location.country && `, ${data.location.country}`}
        </div>

        <div className="flex items-center gap-4 text-xs opacity-80 pt-2 border-t border-white/10">
          <div>
            <span className="opacity-60">Feels like</span>
            <div className="font-medium mt-0.5">{data.feelsLike}°</div>
          </div>
          <div>
            <span className="opacity-60">Humidity</span>
            <div className="font-medium mt-0.5">{data.humidity}%</div>
          </div>
          <div>
            <span className="opacity-60">Wind</span>
            <div className="font-medium mt-0.5">{data.windSpeed.toFixed(1)} m/s</div>
          </div>
        </div>
      </div>
    </div>
  );
}

