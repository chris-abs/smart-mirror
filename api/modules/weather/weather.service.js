import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

if (!API_KEY) {
  console.warn("[Weather] Missing WEATHER_API_KEY in .env");
}

export async function getCurrentWeather(lat, lon) {
  if (!API_KEY) {
    throw new Error("Weather API key is not configured");
  }

  if (typeof lat !== "number" || typeof lon !== "number") {
    throw new Error("Latitude and longitude must be numbers");
  }

  const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Weather API error: ${res.status}`);
    }

    const data = await res.json();

    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      description: data.weather[0]?.description || "Unknown",
      icon: data.weather[0]?.icon || null,
      windSpeed: data.wind?.speed || 0,
      windDirection: data.wind?.deg || null,
      visibility: data.visibility ? data.visibility / 1000 : null, // Convert to km
      cloudiness: data.clouds?.all || 0,
      sunrise: data.sys?.sunrise
        ? new Date(data.sys.sunrise * 1000).toISOString()
        : null,
      sunset: data.sys?.sunset
        ? new Date(data.sys.sunset * 1000).toISOString()
        : null,
      location: {
        name: data.name,
        country: data.sys?.country || null,
        lat: data.coord?.lat || lat,
        lon: data.coord?.lon || lon,
      },
    };
  } catch (error) {
    console.error("[Weather] API error:", error);
    throw error;
  }
}

export async function getCurrentWeatherByCity(cityName, countryCode = null) {
  if (!API_KEY) {
    throw new Error("Weather API key is not configured");
  }

  const query = countryCode ? `${cityName},${countryCode}` : cityName;
  const url = `${BASE_URL}/weather?q=${encodeURIComponent(
    query
  )}&appid=${API_KEY}&units=metric`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Weather API error: ${res.status}`);
    }

    const data = await res.json();

    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      description: data.weather[0]?.description || "Unknown",
      icon: data.weather[0]?.icon || null,
      windSpeed: data.wind?.speed || 0,
      windDirection: data.wind?.deg || null,
      visibility: data.visibility ? data.visibility / 1000 : null,
      cloudiness: data.clouds?.all || 0,
      sunrise: data.sys?.sunrise
        ? new Date(data.sys.sunrise * 1000).toISOString()
        : null,
      sunset: data.sys?.sunset
        ? new Date(data.sys.sunset * 1000).toISOString()
        : null,
      location: {
        name: data.name,
        country: data.sys?.country || null,
        lat: data.coord?.lat || null,
        lon: data.coord?.lon || null,
      },
    };
  } catch (error) {
    console.error("[Weather] API error:", error);
    throw error;
  }
}
