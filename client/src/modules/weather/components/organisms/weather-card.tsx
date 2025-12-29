import { useEffect, useState } from "react";
import { useCurrentWeather } from "../../queries";
import type { WeatherQueryParams } from "../../../../lib/types/weather";

export function WeatherCard() {
  const [locationParams, setLocationParams] = useState<WeatherQueryParams>({
    type: "city",
    city: "London",
  });
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationParams({
            type: "coordinates",
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  }, []);

  const { data, isLoading, error } = useCurrentWeather(locationParams);

  if (isLoading && !data) {
    return (
      <div className="rounded-xl border border-white/10 p-4 bg-white/5">
        <div className="text-xs uppercase tracking-[0.2em] opacity-60 mb-2">
          Weather
        </div>
        <div className="text-sm opacity-60">Loading weather…</div>
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
    <div className="rounded-xl border border-white/10 p-4 bg-white/5">
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

        <div className="grid grid-cols-2 gap-2 text-xs opacity-80">
          <div>
            <span className="opacity-60">Feels like</span>
            <div className="font-medium">{data.feelsLike}°</div>
          </div>
          <div>
            <span className="opacity-60">Humidity</span>
            <div className="font-medium">{data.humidity}%</div>
          </div>
          {data.visibility !== null && (
            <div>
              <span className="opacity-60">Visibility</span>
              <div className="font-medium">{data.visibility} km</div>
            </div>
          )}
          <div>
            <span className="opacity-60">Wind</span>
            <div className="font-medium">{data.windSpeed.toFixed(1)} m/s</div>
          </div>
        </div>
      </div>
    </div>
  );
}

