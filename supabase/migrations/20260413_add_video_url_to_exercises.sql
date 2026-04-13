-- Add video_url column to biblioteca_ejercicios
-- This allows separate storage for image (media_url) and tech video (video_url)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'biblioteca_ejercicios' AND column_name = 'video_url') THEN
        ALTER TABLE biblioteca_ejercicios ADD COLUMN video_url text;
    END IF;
END $$;
