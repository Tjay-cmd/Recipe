-- Add nutritional information columns to recipes table
ALTER TABLE recipes
ADD COLUMN calories INTEGER,
ADD COLUMN protein_g DECIMAL(10, 2),
ADD COLUMN carbs_g DECIMAL(10, 2),
ADD COLUMN fat_g DECIMAL(10, 2),
ADD COLUMN fiber_g DECIMAL(10, 2),
ADD COLUMN sugar_g DECIMAL(10, 2),
ADD COLUMN sodium_mg DECIMAL(10, 2),
ADD COLUMN cholesterol_mg DECIMAL(10, 2);

-- Add comments for documentation
COMMENT ON COLUMN recipes.calories IS 'Calories per serving';
COMMENT ON COLUMN recipes.protein_g IS 'Protein in grams per serving';
COMMENT ON COLUMN recipes.carbs_g IS 'Carbohydrates in grams per serving';
COMMENT ON COLUMN recipes.fat_g IS 'Fat in grams per serving';
COMMENT ON COLUMN recipes.fiber_g IS 'Fiber in grams per serving';
COMMENT ON COLUMN recipes.sugar_g IS 'Sugar in grams per serving';
COMMENT ON COLUMN recipes.sodium_mg IS 'Sodium in milligrams per serving';
COMMENT ON COLUMN recipes.cholesterol_mg IS 'Cholesterol in milligrams per serving';
