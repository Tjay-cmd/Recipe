-- Create a function to increment recipe views that bypasses RLS
-- This allows both authenticated and unauthenticated users to increment views
CREATE OR REPLACE FUNCTION increment_recipe_views(recipe_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE recipes
  SET views = COALESCE(views, 0) + 1
  WHERE id = recipe_id;
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION increment_recipe_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_recipe_views(UUID) TO anon;
