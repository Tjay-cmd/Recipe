-- Add unique constraint on user_id to prevent duplicate subscriptions
-- First, remove any duplicate subscriptions, keeping only the most recent one
DELETE FROM subscriptions a USING subscriptions b
WHERE a.id < b.id
AND a.user_id = b.user_id;

-- Now add the unique constraint
ALTER TABLE subscriptions
ADD CONSTRAINT subscriptions_user_id_unique UNIQUE (user_id);

-- Add comment
COMMENT ON CONSTRAINT subscriptions_user_id_unique ON subscriptions IS 'Ensures each user can only have one subscription record';
