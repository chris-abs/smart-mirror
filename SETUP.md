# Smart Mirror Setup Guide

This guide will help you set up the Smart Mirror application with PostgreSQL database on your Raspberry Pi 5.

## Prerequisites

- Docker and Docker Compose installed on your Raspberry Pi
- Node.js and Yarn (if running locally without Docker)

## Database Setup

### Step 1: Configure Environment Variables

Create a `.env` file in the project root (you can copy from `.env.example`):

```bash
# Database Configuration
DATABASE_URL=postgresql://workout_user:workout_password@postgres:5432/workouts
POSTGRES_USER=workout_user
POSTGRES_PASSWORD=workout_password
POSTGRES_DB=workouts

# API Configuration
API_TOKEN=your-secret-api-token-here
PORT=3001
NODE_ENV=development

# Client Configuration (for Vite)
VITE_API_BASE=http://localhost:3001
VITE_API_TOKEN=your-secret-api-token-here
```

**Important:** Replace `your-secret-api-token-here` with a strong, random token. You can generate one using:
```bash
openssl rand -hex 32
```

### Step 2: Start Docker Containers

Start all services using Docker Compose:

```bash
docker compose up -d
```

This will:
- Start PostgreSQL database
- Start the API server
- Start the client development server
- Automatically create the database schema on first run

### Step 3: Initialize Database Schema

The schema should be automatically created when PostgreSQL starts (via the init script). However, if you need to manually set it up:

```bash
# If running in Docker
docker compose exec api yarn setup-db

# If running locally
cd api
yarn setup-db
```

### Step 4: Import Initial Data

Import data from May 2025 to today:

```bash
# If running in Docker
docker compose exec api yarn import-data

# If running locally
cd api
yarn import-data
```

To import a custom date range:
```bash
docker compose exec api node scripts/import-data.js 2025-05-01 2025-12-31
```

### Step 5: Verify Setup

Check that everything is working:

1. **Health Check:**
   ```bash
   curl http://localhost:3001/api/health
   ```
   Should return database connection status.

2. **Test API (with authentication):**
   ```bash
   curl -H "Authorization: Bearer your-secret-api-token-here" \
        http://localhost:3001/api/workout/contributions
   ```

3. **Access Client:**
   Open http://localhost:5173 in your browser

## Database Management

### Accessing PostgreSQL

```bash
# Connect to PostgreSQL container
docker compose exec postgres psql -U workout_user -d workouts
```

### Common SQL Queries

```sql
-- View all workout entries
SELECT * FROM workout_entries ORDER BY date DESC;

-- Count workouts by month
SELECT 
  DATE_TRUNC('month', date) as month,
  COUNT(*) as workout_count
FROM workout_entries
WHERE has_workout = true
GROUP BY month
ORDER BY month DESC;

-- View current streak
SELECT date, has_daily_exercise 
FROM workout_entries 
WHERE has_daily_exercise = true 
ORDER BY date DESC;
```

### Manual Data Entry

You can manually insert workout data:

```sql
-- Record a workout for a specific date
INSERT INTO workout_entries (date, has_workout, has_daily_exercise)
VALUES ('2025-05-15', true, false)
ON CONFLICT (date) 
DO UPDATE SET has_workout = true;

-- Record daily exercise for a specific date
INSERT INTO workout_entries (date, has_workout, has_daily_exercise)
VALUES ('2025-05-15', false, true)
ON CONFLICT (date) 
DO UPDATE SET has_daily_exercise = true;
```

## Auto-Start on Boot

Docker Compose is configured with `restart: unless-stopped`, which means containers will automatically restart when the Raspberry Pi boots up.

To ensure Docker starts on boot:

```bash
sudo systemctl enable docker
sudo systemctl enable docker compose
```

## Troubleshooting

### Database Connection Issues

1. Check if PostgreSQL container is running:
   ```bash
   docker compose ps
   ```

2. Check PostgreSQL logs:
   ```bash
   docker compose logs postgres
   ```

3. Verify DATABASE_URL in `.env` matches Docker service name (`postgres:5432`)

### API Authentication Issues

1. Ensure `API_TOKEN` is set in `.env`
2. Ensure `VITE_API_TOKEN` matches `API_TOKEN` in client `.env`
3. Check API logs:
   ```bash
   docker compose logs api
   ```

### Client Connection Issues

1. Verify `VITE_API_BASE` points to correct API URL
2. Check client logs:
   ```bash
   docker compose logs client
   ```

## Development vs Production

For production deployment on Raspberry Pi:

1. Build production client:
   ```bash
   cd client
   yarn build
   ```

2. Update `client/Dockerfile` to serve production build instead of dev server

3. Consider using `docker compose.prod.yml` for production-specific configuration

## Next Steps

- Customize the import script to mark specific dates with workouts/exercises
- Set up automated backups of the PostgreSQL database
- Configure monitoring and logging for production use
