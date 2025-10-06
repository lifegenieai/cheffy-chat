-- Add thumbnail_url column to recipe_images table
ALTER TABLE recipe_images 
ADD COLUMN IF NOT EXISTS thumbnail_url text;