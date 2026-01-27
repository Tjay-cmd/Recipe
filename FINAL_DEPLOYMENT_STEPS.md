# Final Deployment Steps - PayPal Production

## ✅ Completed
- [x] PayPal Product created: `PROD-6SX01410U7418023B`
- [x] PayPal Plan created: `P-63978075C9884545MNF4GTVI`
- [x] Webhook created: `55T49098J9218290K`
- [x] Environment variables added to Vercel

---

## Step 1: Verify Database Migration ⏳

**IMPORTANT:** Make sure the PayPal subscription columns exist in your production Supabase database.

### Check if Migration is Applied:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `cercjilqldbulmlztojq`
3. Go to **SQL Editor**
4. Run this query:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
AND column_name IN ('paypal_subscription_id', 'paypal_customer_id');
```

**Expected Result:** You should see 2 rows:
- `paypal_subscription_id` | `text`
- `paypal_customer_id` | `text`

### If Columns Don't Exist:
Run this migration in Supabase SQL Editor:

```sql
-- Add PayPal subscription fields to subscriptions table
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS paypal_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS paypal_customer_id TEXT;

-- Add index for PayPal subscription lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_paypal_subscription_id ON subscriptions(paypal_subscription_id);

-- Update comment to reflect both Stripe and PayPal support
COMMENT ON TABLE subscriptions IS 'User subscriptions - supports both Stripe and PayPal';
```

---

## Step 2: Wait for Vercel Deployment ✅

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Check the **Deployments** tab
4. Wait for the latest deployment to show **"Ready"** status
   - This happens automatically after adding environment variables
   - Usually takes 1-3 minutes

---

## Step 3: Test Webhook (Optional but Recommended)

### Using PayPal Webhook Simulator:
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Make sure you're in **Sandbox** mode
3. Navigate to **Webhooks** → **Webhooks Simulator** (or find it in the left sidebar)
4. Select your webhook: `https://yumspot.co.za/api/paypal/webhook`
5. Select event type: `BILLING.SUBSCRIPTION.ACTIVATED`
6. Click **"Send Test"**
7. Check Vercel logs:
   - Go to Vercel Dashboard → Your Project → **Functions** tab
   - Click on `/api/paypal/webhook`
   - Check **Logs** tab
   - You should see: `🔔 PayPal Webhook Received: BILLING.SUBSCRIPTION.ACTIVATED`

---

## Step 4: Test Full Subscription Flow 🧪

### Test Steps:
1. **Wait for Vercel deployment to complete** (from Step 2)
2. Visit: `https://yumspot.co.za/pro`
3. **Log in** with a test account (or create one)
4. Click **"Subscribe with PayPal"** button
5. You should be redirected to PayPal sandbox checkout
6. **Complete the payment** using PayPal sandbox:
   - **Option A:** Use PayPal sandbox test account
   - **Option B:** Use test card: `4032033234232978`
     - Expiry: Any future date (e.g., 12/25)
     - CVC: Any 3 digits (e.g., 123)
7. After approval, you'll be redirected to: `/account?paypal=success`
8. **Verify**:
   - ✅ Success message appears on account page
   - ✅ Subscription status shows as "Active" or "Pro"
   - ✅ Check Vercel function logs for webhook events
   - ✅ Check Supabase `subscriptions` table:
     - `paypal_subscription_id` is populated
     - `status` = 'active'
     - `user_id` matches your test user

---

## Step 5: Monitor Production

### Check Vercel Logs:
1. Go to Vercel Dashboard → Your Project → **Functions** tab
2. Click on `/api/paypal/webhook` function
3. Check **Logs** tab for webhook events
4. You should see logs like:
   - `🔔 PayPal Webhook Received: BILLING.SUBSCRIPTION.CREATED`
   - `🔔 PayPal Webhook Received: BILLING.SUBSCRIPTION.ACTIVATED`

### Verify in Supabase:
1. Go to Supabase Dashboard → **Table Editor**
2. Open `subscriptions` table
3. Verify your test subscription was created with:
   - `paypal_subscription_id` populated (starts with `I-`)
   - `status` = 'active'
   - `user_id` matches your test user

---

## Troubleshooting

### "PayPal checkout is not configured"
- ✅ Verify all environment variables are set in Vercel
- ✅ Wait for Vercel redeployment to complete
- ✅ Check that `NEXT_PUBLIC_ENABLE_PAYPAL_CHECKOUT=true` is set

### "Unauthorized" error
- Make sure you're logged in before clicking subscribe
- Check that Supabase auth is working in production

### Webhook not receiving events
- Verify webhook URL is correct: `https://yumspot.co.za/api/paypal/webhook`
- Check that webhook is created in **Sandbox** mode (not Live)
- Verify `PAYPAL_WEBHOOK_ID=55T49098J9218290K` is set in Vercel
- Check Vercel function logs for errors

### Subscription not activating
- Check Vercel logs for webhook processing errors
- Verify database migration was run (Step 1)
- Check that user email matches between PayPal and Supabase

---

## Success Checklist

- [ ] Database migration verified/run in production Supabase
- [ ] Vercel deployment completed successfully
- [ ] Webhook test successful (optional)
- [ ] Test subscription completed successfully
- [ ] Webhook events appearing in Vercel logs
- [ ] Subscription appears in Supabase with `paypal_subscription_id`
- [ ] Account page shows subscription status as "Active"

---

**Ready to test?** Start with Step 1 (verify database migration), then proceed through the steps!
