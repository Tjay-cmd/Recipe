-- Add PayPal subscription fields to subscriptions table
ALTER TABLE subscriptions
ADD COLUMN paypal_subscription_id TEXT,
ADD COLUMN paypal_customer_id TEXT;

-- Add index for PayPal subscription lookups
CREATE INDEX idx_subscriptions_paypal_subscription_id ON subscriptions(paypal_subscription_id);

-- Update comment to reflect both Stripe and PayPal support
COMMENT ON TABLE subscriptions IS 'User subscriptions - supports both Stripe and PayPal';
