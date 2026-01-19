import { Router } from "express";

import { authenticateToken } from "../../middleware/auth.js";
import { getContributionsData } from "./github.service.js";

const router = Router();

router.use(authenticateToken);

router.get("/contributions", async (_req, res) => {
  try {
    const data = await getContributionsData();
    res.json(data);
  } catch (err) {
    console.error("[GitHub] contributions error:", err);
    res.status(500).json({
      error: err.message || "Failed to get GitHub contributions",
    });
  }
});

export default router;
