-- Allow users to delete their own saved recipes
CREATE POLICY "Users can delete their own saved recipes"
ON public.saved_recipes
FOR DELETE
USING (auth.uid() = user_id);