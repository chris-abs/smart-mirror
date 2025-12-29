import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import spotifyRouter from "./modules/spotify/spotify.routes.js";
import weatherRouter from "./modules/weather/weather.routes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "API is running" });
});

app.use("/api/spotify", spotifyRouter);
app.use("/api/weather", weatherRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
