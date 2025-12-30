import { Router } from "express";

import { getBreakingNews, getUFCNews } from "./news.service.js";

const router = Router();

router.get("/breaking", async (req, res) => {
  try {
    const { country = "us", pageSize = 10 } = req.query;
    const pageSizeNum = parseInt(pageSize, 10);

    if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 100) {
      return res.status(400).json({
        error: "pageSize must be a number between 1 and 100",
      });
    }

    const data = await getBreakingNews(country, pageSizeNum);
    res.json(data);
  } catch (err) {
    console.error("[News] Breaking news error:", err);
    res.status(500).json({
      error: err.message || "Failed to get breaking news",
    });
  }
});

router.get("/ufc", async (req, res) => {
  try {
    const { pageSize = 10 } = req.query;
    const pageSizeNum = parseInt(pageSize, 10);

    if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 100) {
      return res.status(400).json({
        error: "pageSize must be a number between 1 and 100",
      });
    }

    const data = await getUFCNews(pageSizeNum);
    res.json(data);
  } catch (err) {
    console.error("[News] UFC news error:", err);
    res.status(500).json({
      error: err.message || "Failed to get UFC news",
    });
  }
});

export default router;
