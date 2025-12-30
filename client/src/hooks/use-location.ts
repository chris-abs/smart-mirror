import { useEffect, useState } from "react";

export type LocationData = {
  coordinates: { lat: number; lon: number } | null;
  countryCode: string | null;
  isLoading: boolean;
  error: Error | null;
};

const DEFAULT_COUNTRY_CODE = "gb"; 
const DEFAULT_CITY = "London";

async function getCountryCodeFromCoordinates(
  lat: number,
  lon: number
): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
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
      return countryCode;
    }

    return DEFAULT_COUNTRY_CODE;
  } catch (error) {
    console.error("[Location] Reverse geocoding error:", error);
    return DEFAULT_COUNTRY_CODE;
  }
}

export function useLocation(): LocationData {
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [countryCode, setCountryCode] = useState<string | null>(DEFAULT_COUNTRY_CODE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      const timeoutId = setTimeout(() => {
        setIsLoading(false);
      }, 0);
      return () => clearTimeout(timeoutId);
    }

    const timeoutId = setTimeout(() => {
      setIsLoading(true);
      setError(null);
    }, 0);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };

        setCoordinates(coords);

        const code = await getCountryCodeFromCoordinates(coords.lat, coords.lon);
        setCountryCode(code);
        setIsLoading(false);
      },
      (geoError) => {
        console.error("[Location] Geolocation error:", geoError);
        setError(new Error(geoError.message || "Geolocation failed"));
        setCountryCode(DEFAULT_COUNTRY_CODE);
        setIsLoading(false);
      },
      {
        timeout: 10000,
        maximumAge: 5 * 60 * 1000, 
      }
    );

    return () => clearTimeout(timeoutId);
  }, []);

  return {
    coordinates,
    countryCode,
    isLoading,
    error,
  };
}

export function getDefaultWeatherLocation() {
  return {
    type: "city" as const,
    city: DEFAULT_CITY,
  };
}
