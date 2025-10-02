-- Create recipe_images table for caching generated images
CREATE TABLE IF NOT EXISTS public.recipe_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_name TEXT UNIQUE NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  cost DECIMAL(10, 4) DEFAULT 0.039
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_recipe_images_dish_name ON public.recipe_images(dish_name);

-- Enable RLS
ALTER TABLE public.recipe_images ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all recipe images
CREATE POLICY "Anyone can view recipe images"
ON public.recipe_images
FOR SELECT
TO authenticated
USING (true);

-- Only allow insert via service role (from edge function)
CREATE POLICY "Service role can insert recipe images"
ON public.recipe_images
FOR INSERT
TO service_role
WITH CHECK (true);

-- Add image_url column to saved_recipes if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'saved_recipes' 
    AND column_name = 'image_url'
  ) THEN
    ALTER TABLE public.saved_recipes ADD COLUMN image_url TEXT;
  END IF;
END $$;

-- Create storage bucket for recipe images
INSERT INTO storage.buckets (id, name, public)
VALUES ('recipe-images', 'recipe-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for recipe images
CREATE POLICY "Public can view recipe images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'recipe-images');

CREATE POLICY "Service role can upload recipe images"
ON storage.objects
FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'recipe-images');