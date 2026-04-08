-- Migration: Add favorites and frequency tracking to exercises library
ALTER TABLE biblioteca_ejercicios ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;
ALTER TABLE biblioteca_ejercicios ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;

-- Optional: Index for filtering by favorites
CREATE INDEX IF NOT EXISTS idx_exercise_favorites ON biblioteca_ejercicios(profesor_id, is_favorite) WHERE is_favorite = true;
