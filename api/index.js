import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { testConnection } from "./db/index.js";
import spotifyRouter from "./modules/spotify/spotify.routes.js";
import weatherRouter from "./modules/weather/weather.routes.js";
import newsRouter from "./modules/news/news.routes.js";
import hiveRouter from "./modules/hive/hive.routes.js";
import workoutRouter from "./modules/workout/workout.routes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", async (req, res) => {
  const dbConnected = await testConnection();
  res.json({
    ok: true,
    message: "API is running",
    database: dbConnected ? "connected" : "disconnected",
  });
});

app.use("/api/spotify", spotifyRouter);
app.use("/api/weather", weatherRouter);
app.use("/api/news", newsRouter);
app.use("/api/hive", hiveRouter);
app.use("/api/workout", workoutRouter);

const PORT = process.env.PORT || 3001;

testConnection()
  .then((connected) => {
    if (connected) {
      console.log("Database connection established");
    } else {
      console.warn("Database connection failed - check your DATABASE_URL");
    }
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
