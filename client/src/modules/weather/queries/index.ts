import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../../../lib/api";
import type { CurrentWeather, WeatherQueryParams } from "../../../lib/types/weather";

export const weatherKey = ["weather", "current"] as const;

function buildWeatherQueryKey(params: WeatherQueryParams) {
  if (params.type === "coordinates") {
    const roundedLat = Math.round(params.lat * 10000) / 10000;
    const roundedLon = Math.round(params.lon * 10000) / 10000;
    return [...weatherKey, "coords", roundedLat, roundedLon] as const;
  }
  return [...weatherKey, "city", params.city, params.country || ""] as const;
}

function buildWeatherUrl(params: WeatherQueryParams): string {
  if (params.type === "coordinates") {
    return `/api/weather/current?lat=${params.lat}&lon=${params.lon}`;
  }
  const cityParam = encodeURIComponent(params.city);
  const countryParam = params.country
    ? `&country=${encodeURIComponent(params.country)}`
    : "";
  return `/api/weather/current?city=${cityParam}${countryParam}`;
}

export function useCurrentWeather(params: WeatherQueryParams | null) {
  return useQuery<CurrentWeather>({
    queryKey: params ? buildWeatherQueryKey(params) : [...weatherKey, "none"],
    queryFn: () => {
      if (!params) {
        throw new Error("Weather query params are required");
      }
      return apiGet<CurrentWeather>(buildWeatherUrl(params));
    },
    enabled: params !== null,
    refetchInterval: 5 * 60 * 1000, 
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000,
  });
}

