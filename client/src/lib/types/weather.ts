export type WeatherLocation = {
  name: string;
  country: string | null;
  lat: number;
  lon: number;
};

export type CurrentWeather = {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  description: string;
  icon: string | null;
  windSpeed: number;
  windDirection: number | null;
  visibility: number | null;
  cloudiness: number;
  sunrise: string | null;
  sunset: string | null;
  location: WeatherLocation;
};

export type WeatherQueryParams =
  | { type: "coordinates"; lat: number; lon: number }
  | { type: "city"; city: string; country?: string };

