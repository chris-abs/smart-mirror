import { Router } from "express";

import {
  getDevices,
  getHeatingStatus,
  setTemperature,
  setMode,
} from "./hive.service.js";

const router = Router();

router.get("/devices", async (_req, res) => {
  try {
    const devices = await getDevices();
    res.json(devices);
  } catch (err) {
    console.error("[Hive] devices error:", err);
    res.status(500).json({
      error: err.message || "Failed to get devices",
    });
  }
});

router.get("/status/:deviceId", async (req, res) => {
  try {
    const { deviceId } = req.params;
    const status = await getHeatingStatus(deviceId);
    res.json(status);
  } catch (err) {
    console.error("[Hive] status error:", err);
    res.status(500).json({
      error: err.message || "Failed to get heating status",
    });
  }
});

router.post("/temperature/:deviceId", async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { temperature } = req.body;

    if (typeof temperature !== "number") {
      return res.status(400).json({
        error: "temperature (number) is required",
      });
    }

    const result = await setTemperature(deviceId, temperature);
    res.json(result);
  } catch (err) {
    console.error("[Hive] temperature error:", err);
    res.status(400).json({
      error: err.message || "Failed to set temperature",
    });
  }
});

router.post("/mode/:deviceId", async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { mode } = req.body;

    if (!mode) {
      return res.status(400).json({
        error: "mode is required",
      });
    }

    const result = await setMode(deviceId, mode);
    res.json(result);
  } catch (err) {
    console.error("[Hive] mode error:", err);
    res.status(400).json({
      error: err.message || "Failed to set mode",
    });
  }
});

export default router;
