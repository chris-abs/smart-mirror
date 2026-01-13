CREATE TABLE IF NOT EXISTS workout_entries (
    date DATE PRIMARY KEY,
    has_workout BOOLEAN DEFAULT false NOT NULL,
    has_daily_exercise BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

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
