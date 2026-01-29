-- Migration: Add DELETE policy for recipe_swipes table
-- Users need to be able to delete their own swipes for the reset functionality

-- RLS Policy: Users can delete their own swipes
CREATE POLICY "Users can delete their own swipes"
  ON recipe_swipes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
