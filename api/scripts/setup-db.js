import { query, testConnection } from "../db/index.js";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupDatabase() {
  console.log("Setting up database...");

  // Test connection first
  const connected = await testConnection();
  if (!connected) {
    console.error("Failed to connect to database. Please check your DATABASE_URL.");
    process.exit(1);
  }

  // Read and execute schema
  const schemaPath = join(__dirname, "../db/schema.sql");
  const schema = await readFile(schemaPath, "utf-8");

  try {
    // Execute schema (PostgreSQL will handle IF NOT EXISTS)
    await query(schema);
    console.log("✓ Database schema initialized successfully");
  } catch (error) {
    console.error("Error setting up database schema:", error);
    process.exit(1);
  }

  console.log("Database setup complete!");
}

setupDatabase()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Setup failed:", error);
    process.exit(1);
  });
