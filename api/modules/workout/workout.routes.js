import { Router } from "express";
import {
  getWorkoutStreak,
  recordWorkout,
  resetWorkoutStreak,
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

export default router;
