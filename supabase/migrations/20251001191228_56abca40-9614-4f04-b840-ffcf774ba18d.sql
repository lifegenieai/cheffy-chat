-- Add category column to saved_recipes table
ALTER TABLE saved_recipes ADD COLUMN category TEXT;

-- Add a check constraint to ensure category is one of the valid values
ALTER TABLE saved_recipes ADD CONSTRAINT saved_recipes_category_check 
  CHECK (category IN ('Appetizers', 'Soups', 'Salads', 'Main Dishes', 'Side Dishes', 'Desserts', 'Breads', 'Pastry'));