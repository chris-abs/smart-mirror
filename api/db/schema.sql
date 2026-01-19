CREATE TABLE IF NOT EXISTS workout_entries (
    date DATE PRIMARY KEY,
    has_workout BOOLEAN DEFAULT false NOT NULL,
    has_daily_exercise BOOLEAN DEFAULT false NOT NULL,
    has_weights BOOLEAN DEFAULT false NOT NULL,
    has_class BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Migration: Add new workout type columns if they don't exist, and rename old ones
DO $$
BEGIN
    -- Add new columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workout_entries' AND column_name = 'has_weights') THEN
        ALTER TABLE workout_entries ADD COLUMN has_weights BOOLEAN DEFAULT false NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workout_entries' AND column_name = 'has_class') THEN
        ALTER TABLE workout_entries ADD COLUMN has_class BOOLEAN DEFAULT false NOT NULL;
    END IF;
    
    -- Migrate data from old column names if they exist
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'workout_entries' AND column_name = 'has_weight_training') THEN
        UPDATE workout_entries SET has_weights = has_weight_training WHERE has_weights = false;
        ALTER TABLE workout_entries DROP COLUMN IF EXISTS has_weight_training;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'workout_entries' AND column_name = 'has_kickboxing') THEN
        UPDATE workout_entries SET has_class = has_kickboxing WHERE has_class = false;
        ALTER TABLE workout_entries DROP COLUMN IF EXISTS has_kickboxing;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_workout_entries_date ON workout_entries(date);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workout_entries_updated_at
    BEFORE UPDATE ON workout_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
