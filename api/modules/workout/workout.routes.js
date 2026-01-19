import { Router } from "express";

import { authenticateToken } from "../../middleware/auth.js";
import {
  getWorkoutStreak,
  recordWorkout,
  resetWorkoutStreak,
  getWorkoutCounts,
  recordWorkoutType,
  getContributionsData,
} from "./workout.service.js";

const router = Router();

router.use(authenticateToken);

router.get("/streak", async (_req, res) => {
  try {
    const data = await getWorkoutStreak();
    res.json(data);
  } catch (err) {
    console.error("[Workout] streak error:", err);
    res.status(500).json({
      error: err.message || "Failed to get workout streak",
    });
  }
});

router.post("/record", async (_req, res) => {
  try {
    const data = await recordWorkout();
    res.json(data);
  } catch (err) {
    console.error("[Workout] record error:", err);
    res.status(500).json({
      error: err.message || "Failed to record workout",
    });
  }
});

router.post("/reset", async (_req, res) => {
  try {
    const data = await resetWorkoutStreak();
    res.json(data);
  } catch (err) {
    console.error("[Workout] reset error:", err);
    res.status(500).json({
      error: err.message || "Failed to reset workout streak",
    });
  }
});

router.get("/counts", async (_req, res) => {
  try {
    const data = await getWorkoutCounts();
    res.json(data);
  } catch (err) {
    console.error("[Workout] counts error:", err);
    res.status(500).json({
      error: err.message || "Failed to get workout counts",
    });
  }
});

router.post("/record-workout-type", async (req, res) => {
  try {
    const { dates, type } = req.body;
    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({
        error: "Dates array is required",
      });
    }
    if (!type || !['weights', 'class', 'dailies'].includes(type)) {
      return res.status(400).json({
        error: "Type must be 'weights', 'class', or 'dailies'",
      });
    }
    const data = await recordWorkoutType(dates, type);
    res.json(data);
  } catch (err) {
    console.error("[Workout] record-workout-type error:", err);
    res.status(500).json({
      error: err.message || "Failed to record workout type",
    });
  }
});

router.get("/contributions", async (_req, res) => {
  try {
    const data = await getContributionsData();
    res.json(data);
  } catch (err) {
    console.error("[Workout] contributions error:", err);
    res.status(500).json({
      error: err.message || "Failed to get contributions data",
    });
  }
});

export default router;
