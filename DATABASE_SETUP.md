# Database Setup Guide - Detailed Instructions

This guide provides step-by-step instructions for setting up PostgreSQL and importing your workout data.

## Table of Contents

1. [PostgreSQL Setup](#postgresql-setup)
2. [API Token Generation](#api-token-generation)
3. [Data Format](#data-format)
4. [Importing Your Data](#importing-your-data)
5. [Verification](#verification)

---

## PostgreSQL Setup

### Option A: Using Docker (Recommended)

Docker will automatically set up PostgreSQL for you. The database is configured in `docker-compose.yml`.

**What happens automatically:**

- PostgreSQL 16 container starts
- Database `workouts` is created
- User `workout_user` is created (password from `.env`)
- Schema is automatically initialized from `api/db/schema.sql`

**Manual steps if needed:**

1. **Start PostgreSQL container:**

   ```bash
   docker compose up -d postgres
   ```

   **Note:** Use `docker compose` (with space) for Docker Compose v2, or `docker-compose` (with hyphen) for v1.

2. **Verify it's running:**

   ```bash
   docker compose ps postgres
   ```

   Should show status as "Up"

3. **Check logs:**

   ```bash
   docker compose logs postgres
   ```

   Look for "database system is ready to accept connections"

4. **Manually initialize schema (if auto-init didn't work):**
   ```bash
   docker compose exec api yarn setup-db
   ```

### Option B: Local PostgreSQL Installation

If you prefer to run PostgreSQL directly on your Raspberry Pi (not in Docker):

1. **Install PostgreSQL:**

   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   ```

2. **Start PostgreSQL service:**

   ```bash
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

3. **Create database and user:**

   ```bash
   sudo -u postgres psql
   ```

   Then in the PostgreSQL prompt:

   ```sql
   CREATE DATABASE workouts;
   CREATE USER workout_user WITH PASSWORD 'your_password_here';
   GRANT ALL PRIVILEGES ON DATABASE workouts TO workout_user;
   \q
   ```

4. **Update your `.env` file:**

   ```env
   DATABASE_URL=postgresql://workout_user:your_password_here@localhost:5432/workouts
   ```

5. **Initialize schema:**
   ```bash
   cd api
   yarn setup-db
   ```

---

## API Token Generation

The API token is used to authenticate all requests to the workout endpoints. You need to generate a secure random token.

### Method 1: Using OpenSSL (Recommended)

```bash
openssl rand -hex 32
```

This will output something like:

```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

### Method 2: Using Node.js

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Method 3: Using Python

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### Setting the Token

1. **Copy the generated token**

2. **Add to your `.env` file:**

   ```env
   API_TOKEN=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
   VITE_API_TOKEN=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
   ```

   **Important:** Both `API_TOKEN` and `VITE_API_TOKEN` must be the same value.

3. **Restart your services:**
   ```bash
   docker compose restart api client
   ```

---

## Data Format

The workout data is stored in the `workout_entries` table with the following structure:

### Database Schema

```sql
CREATE TABLE workout_entries (
    date DATE PRIMARY KEY,              -- Date in YYYY-MM-DD format
    has_workout BOOLEAN DEFAULT false,  -- true if workout was done
    has_daily_exercise BOOLEAN DEFAULT false,  -- true if daily exercises done
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Data Format for Import

Each entry is a JSON object with this structure:

```json
{
  "date": "2025-05-15",
  "has_workout": true,
  "has_daily_exercise": false
}
```

**Field descriptions:**

- `date`: Date in `YYYY-MM-DD` format (ISO 8601)
- `has_workout`: `true` if you did a workout that day, `false` otherwise
- `has_daily_exercise`: `true` if you completed daily exercises (sit-ups, push-ups, etc.), `false` otherwise

**Examples:**

```json
// Day with both workout and daily exercise
{
  "date": "2025-05-15",
  "has_workout": true,
  "has_daily_exercise": true
}

// Day with only workout
{
  "date": "2025-05-16",
  "has_workout": true,
  "has_daily_exercise": false
}

// Day with only daily exercise
{
  "date": "2025-05-17",
  "has_workout": false,
  "has_daily_exercise": true
}

// Day with no activity
{
  "date": "2025-05-18",
  "has_workout": false,
  "has_daily_exercise": false
}
```

### Bulk Import Format

For the bulk import API endpoint, you provide an array of entries:

```json
{
  "entries": [
    {
      "date": "2025-05-15",
      "has_workout": true,
      "has_daily_exercise": false
    },
    {
      "date": "2025-05-16",
      "has_workout": true,
      "has_daily_exercise": true
    },
    {
      "date": "2025-05-17",
      "has_workout": false,
      "has_daily_exercise": true
    }
  ]
}
```

---

## Importing Your Data

### Method 1: Using the Import Script (Recommended for Initial Setup)

The import script creates entries for all dates from May 2025 to today with default values (no workouts/exercises). You'll then need to update specific dates.

1. **Import all dates (creates empty entries):**

   ```bash
   docker compose exec api yarn import-data
   ```

2. **Or specify a date range:**

   ```bash
   docker compose exec api node scripts/import-data.js 2025-05-01 2025-12-31
   ```

3. **Update specific dates using SQL:**

   ```bash
   docker compose exec postgres psql -U workout_user -d workouts
   ```

   Then:

   ```sql
   -- Mark a date as having a workout
   UPDATE workout_entries
   SET has_workout = true
   WHERE date = '2025-05-15';

   -- Mark a date as having daily exercise
   UPDATE workout_entries
   SET has_daily_exercise = true
   WHERE date = '2025-05-15';

   -- Mark both
   UPDATE workout_entries
   SET has_workout = true, has_daily_exercise = true
   WHERE date = '2025-05-15';
   ```

### Method 2: Using the Bulk Import API Endpoint

If you have a JSON file with your workout data:

1. **Create a JSON file** (e.g., `my-workouts.json`):

   ```json
   {
     "entries": [
       {
         "date": "2025-05-15",
         "has_workout": true,
         "has_daily_exercise": false
       },
       {
         "date": "2025-05-16",
         "has_workout": true,
         "has_daily_exercise": true
       }
     ]
   }
   ```

2. **Import using curl:**

   ```bash
   curl -X POST http://localhost:3001/api/workout/bulk-import \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_API_TOKEN" \
     -d @my-workouts.json
   ```

3. **Or using the API directly from Node.js:**

   ```javascript
   const entries = [
     { date: "2025-05-15", has_workout: true, has_daily_exercise: false },
     { date: "2025-05-16", has_workout: true, has_daily_exercise: true },
   ];

   const response = await fetch(
     "http://localhost:3001/api/workout/bulk-import",
     {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer YOUR_API_TOKEN`,
       },
       body: JSON.stringify({ entries }),
     }
   );
   ```

### Method 3: Manual SQL Insert

For individual dates or small batches:

```bash
docker compose exec postgres psql -U workout_user -d workouts
```

```sql
-- Insert a single entry
INSERT INTO workout_entries (date, has_workout, has_daily_exercise)
VALUES ('2025-05-15', true, false)
ON CONFLICT (date)
DO UPDATE SET
  has_workout = EXCLUDED.has_workout,
  has_daily_exercise = EXCLUDED.has_daily_exercise;

-- Insert multiple entries
INSERT INTO workout_entries (date, has_workout, has_daily_exercise)
VALUES
  ('2025-05-15', true, false),
  ('2025-05-16', true, true),
  ('2025-05-17', false, true)
ON CONFLICT (date)
DO UPDATE SET
  has_workout = EXCLUDED.has_workout,
  has_daily_exercise = EXCLUDED.has_daily_exercise;
```

### Method 4: Converting from Your Old JSON Files

If you have data in the old format (`workout-data.json` and `daily-exercise-data.json`), you can convert it:

**Old format:**

```json
// workout-data.json
{
  "workouts": [
    "2025-01-02T23:07:52.877Z",
    "2025-01-03T23:19:54.442Z"
  ]
}

// daily-exercise-data.json
{
  "streak": 4,
  "lastWorkoutDate": "2025-01-04"
}
```

**Conversion script** (create `convert-data.js`):

```javascript
import { readFile } from "fs/promises";
import { bulkImportWorkouts } from "./api/modules/workout/workout.service.js";

const workoutData = JSON.parse(
  await readFile("api/modules/workout/workout-data.json", "utf-8")
);

// Convert timestamps to dates and create entries
const entries = workoutData.workouts.map((timestamp) => {
  const date = new Date(timestamp);
  const dateStr = date.toISOString().split("T")[0];
  return {
    date: dateStr,
    has_workout: true,
    has_daily_exercise: false, // You'll need to add this separately
  };
});

// Import
await bulkImportWorkouts(entries);
console.log(`Imported ${entries.length} workouts`);
```

---

## Verification

### 1. Check Database Connection

```bash
# Test connection
docker compose exec api node -e "
import('./api/db/index.js').then(({ testConnection }) => {
  testConnection().then(connected => {
    console.log(connected ? '✓ Connected' : '✗ Failed');
    process.exit(connected ? 0 : 1);
  });
});
"
```

### 2. Verify Schema

```bash
docker-compose exec postgres psql -U workout_user -d workouts -c "\d workout_entries"
```

Should show the table structure.

### 3. Check Data

```bash
docker-compose exec postgres psql -U workout_user -d workouts -c "SELECT COUNT(*) FROM workout_entries;"
```

### 4. View Sample Data

```bash
docker-compose exec postgres psql -U workout_user -d workouts -c "SELECT * FROM workout_entries ORDER BY date DESC LIMIT 10;"
```

### 5. Test API Endpoints

```bash
# Health check (no auth required)
curl http://localhost:3001/api/health

# Get contributions (requires auth)
curl -H "Authorization: Bearer YOUR_API_TOKEN" \
     http://localhost:3001/api/workout/contributions

# Get workout counts
curl -H "Authorization: Bearer YOUR_API_TOKEN" \
     http://localhost:3001/api/workout/counts
```

---

## Quick Reference

### Common Commands

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f api
docker compose logs -f postgres

# Access PostgreSQL CLI
docker compose exec postgres psql -U workout_user -d workouts

# Run setup script
docker compose exec api yarn setup-db

# Run import script
docker compose exec api yarn import-data
```

### Environment Variables Checklist

Make sure your `.env` has:

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `POSTGRES_USER` - Database username
- [ ] `POSTGRES_PASSWORD` - Database password
- [ ] `POSTGRES_DB` - Database name
- [ ] `API_TOKEN` - Generated secure token
- [ ] `VITE_API_TOKEN` - Same as API_TOKEN
- [ ] `PORT` - API port (default: 3001)
- [ ] `VITE_API_BASE` - API base URL

---

## Troubleshooting

### Database Connection Failed

1. Check if PostgreSQL is running:

   ```bash
   docker compose ps postgres
   ```

2. Check connection string format:

   ```
   postgresql://username:password@host:port/database
   ```

3. For Docker, use service name as host:
   ```
   postgresql://workout_user:password@postgres:5432/workouts
   ```

### Authentication Errors

1. Verify `API_TOKEN` is set in `.env`
2. Verify `VITE_API_TOKEN` matches `API_TOKEN`
3. Check token is included in requests:
   ```bash
   curl -v -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/workout/contributions
   ```

### Import Errors

1. Check date format is `YYYY-MM-DD`
2. Verify dates are valid (not future dates beyond today)
3. Check database connection before importing

---

## Next Steps

After setup:

1. Import your historical data (May 2025 to today)
2. Test recording new workouts via the UI
3. Verify the contributions chart displays correctly
4. Set up automated backups (recommended for production)
