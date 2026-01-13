import { bulkImportWorkouts } from "../modules/workout/workout.service.js";
import { testConnection } from "../db/index.js";
import dotenv from "dotenv";

dotenv.config();

function generateEntries() {
  const entries = [];
  const startDate = new Date("2025-05-01");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentDate = new Date(startDate);

  while (currentDate <= today) {
    const dateStr = currentDate.toISOString().split("T")[0];

    entries.push({
      date: dateStr,
      has_workout: false,
      has_daily_exercise: false,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return entries;
}

async function importData() {
  console.log("Starting data import...");

  const connected = await testConnection();
  if (!connected) {
    console.error(
      "Failed to connect to database. Please check your DATABASE_URL."
    );
    process.exit(1);
  }

  const args = process.argv.slice(2);
  let entries;

  if (args.length >= 2) {
    const startDate = new Date(args[0]);
    const endDate = new Date(args[1]);
    entries = [];

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      entries.push({
        date: dateStr,
        has_workout: false,
        has_daily_exercise: false,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(
      `Generating entries from ${args[0]} to ${args[1]} (${entries.length} days)`
    );
  } else {
    entries = generateEntries();
    console.log(
      `Generating entries from May 2025 to today (${entries.length} days)`
    );
  }

  try {
    const BATCH_SIZE = 100;
    let imported = 0;

    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
      const batch = entries.slice(i, i + BATCH_SIZE);
      const result = await bulkImportWorkouts(batch);
      imported += result.imported;
      console.log(`Imported batch: ${imported}/${entries.length} entries`);
    }

    console.log(`✓ Successfully imported ${imported} entries`);
  } catch (error) {
    console.error("Error importing data:", error);
    process.exit(1);
  }

  console.log("Data import complete!");
}

importData()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Import failed:", error);
    process.exit(1);
  });
