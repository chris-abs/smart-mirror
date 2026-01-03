import { Router } from "express";

import {
  getWorkoutStreak,
  recordWorkout,
  resetWorkoutStreak,
  getWorkoutCounts,
  recordActualWorkout,
} from "./workout.service.js";

const router = Router();

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

router.post("/record-actual", async (_req, res) => {
  try {
    const data = await recordActualWorkout();
    res.json(data);
  } catch (err) {
    console.error("[Workout] record-actual error:", err);
    res.status(500).json({
      error: err.message || "Failed to record workout",
    });
  }
});

export default router;
