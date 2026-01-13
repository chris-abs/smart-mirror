export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  const apiToken = process.env.API_TOKEN;

  if (!apiToken) {
    console.error("API_TOKEN not configured in environment");
    return res.status(500).json({ error: "Server configuration error" });
  }

  if (!token) {
    return res.status(401).json({ error: "Authentication token required" });
  }

  if (token !== apiToken) {
    return res.status(403).json({ error: "Invalid authentication token" });
  }

  next();
}
