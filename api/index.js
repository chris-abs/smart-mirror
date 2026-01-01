import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import spotifyRouter from "./modules/spotify/spotify.routes.js";
import weatherRouter from "./modules/weather/weather.routes.js";
import newsRouter from "./modules/news/news.routes.js";
import hiveRouter from "./modules/hive/hive.routes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "API is running" });
});

app.use("/api/spotify", spotifyRouter);
app.use("/api/weather", weatherRouter);
app.use("/api/news", newsRouter);
app.use("/api/hive", hiveRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
