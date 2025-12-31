import { useQuery } from "@tanstack/react-query";

export type LocationData = {
  coordinates: { lat: number; lon: number } | null;
  countryCode: string | null;
  isLoading: boolean;
  error: Error | null;
};

const DEFAULT_COUNTRY_CODE = "gb"; 
const DEFAULT_CITY = "London";

const locationKey = ["location", "current"] as const;

type LocationResult = {
  coordinates: { lat: number; lon: number };
  countryCode: string;
};

async function getLocation(): Promise<LocationResult> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lon}&addressdetails=1`,
            {
              headers: {
                "User-Agent": "SmartMirror/1.0", 
              },
            }
          );

          if (!response.ok) {
            throw new Error("Reverse geocoding failed");
          }

          const data = await response.json();
          const countryCode = data.address?.country_code?.toLowerCase();

          if (countryCode && countryCode.length === 2) {
            resolve({ coordinates: coords, countryCode });
          } else {
            resolve({ coordinates: coords, countryCode: DEFAULT_COUNTRY_CODE });
          }
        } catch (error) {
          console.error("[Location] Reverse geocoding error:", error);
          resolve({ coordinates: coords, countryCode: DEFAULT_COUNTRY_CODE });
        }
      },
      (geoError) => {
        console.error("[Location] Geolocation error:", geoError);
        reject(new Error(geoError.message || "Geolocation failed"));
      },
      {
        timeout: 10000,
        maximumAge: 5 * 60 * 1000, 
      }
    );
  });
}

export function useLocation(): LocationData {
  const { data, isLoading, error } = useQuery<LocationResult>({
    queryKey: locationKey,
    queryFn: getLocation,
    staleTime: 1000 * 60 * 30, 
    gcTime: 1000 * 60 * 60, 
    retry: 1,
  });

  return {
    coordinates: data?.coordinates ?? null,
    countryCode: data?.countryCode ?? DEFAULT_COUNTRY_CODE,
    isLoading,
    error: error as Error | null,
  };
}

export function getDefaultWeatherLocation() {
  return {
    type: "city" as const,
    city: DEFAULT_CITY,
  };
}
