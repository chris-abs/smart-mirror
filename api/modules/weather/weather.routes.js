import { Router } from "express";
import {
  getCurrentWeather,
  getCurrentWeatherByCity,
} from "./weather.service.js";

const router = Router();

router.get("/current", async (req, res) => {
  try {
    const { lat, lon, city, country } = req.query;

    let data;

    if (lat && lon) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);

      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({
          error: "Invalid latitude or longitude",
        });
      }

      data = await getCurrentWeather(latitude, longitude);
    } else if (city) {
      data = await getCurrentWeatherByCity(city, country || null);
    } else {
      return res.status(400).json({
        error: "Either lat/lon or city parameter is required",
      });
    }

    res.json(data);
  } catch (err) {
    console.error("[Weather] current error:", err);
    res.status(500).json({
      error: err.message || "Failed to get current weather",
    });
  }
});

export default router;
