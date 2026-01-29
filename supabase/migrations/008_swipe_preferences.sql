-- Migration: Add recipe swipes table for swipe-based recipe discovery mode
-- This table stores user preferences (like/dislike/skip) for recipes

-- Create recipe_swipes table
CREATE TABLE IF NOT EXISTS recipe_swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  preference SMALLINT NOT NULL CHECK (preference IN (-1, 0, 1)),
  -- -1 = dislike, 0 = skip, 1 = like
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add unique constraint so each user can only have one swipe per recipe
ALTER TABLE recipe_swipes ADD CONSTRAINT recipe_swipes_user_recipe_unique UNIQUE (user_id, recipe_id);

-- Create indexes for fast lookups
CREATE INDEX idx_recipe_swipes_user_id ON recipe_swipes(user_id);
CREATE INDEX idx_recipe_swipes_recipe_id ON recipe_swipes(recipe_id);
CREATE INDEX idx_recipe_swipes_preference ON recipe_swipes(preference);
CREATE INDEX idx_recipe_swipes_created_at ON recipe_swipes(created_at DESC);

-- Enable Row Level Security
ALTER TABLE recipe_swipes ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only insert their own swipes
CREATE POLICY "Users can insert their own swipes"
  ON recipe_swipes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only update their own swipes
CREATE POLICY "Users can update their own swipes"
  ON recipe_swipes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policy: Users can only select their own swipes
CREATE POLICY "Users can select their own swipes"
  ON recipe_swipes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_recipe_swipes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before update
CREATE TRIGGER update_recipe_swipes_updated_at_trigger
  BEFORE UPDATE ON recipe_swipes
  FOR EACH ROW
  EXECUTE FUNCTION update_recipe_swipes_updated_at();

-- Add comment to table
COMMENT ON TABLE recipe_swipes IS 'Stores user swipe preferences for recipe discovery mode';
COMMENT ON COLUMN recipe_swipes.preference IS 'User preference: -1 = dislike, 0 = skip, 1 = like';
