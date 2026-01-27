# PayPal Production Deployment Checklist

## Step 1: Configure Vercel Environment Variables ✅

Go to [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables

Add these PayPal environment variables:

### Required PayPal Variables:
```
ENABLE_PAYPAL_CHECKOUT=true
NEXT_PUBLIC_ENABLE_PAYPAL_CHECKOUT=true
PAYPAL_CLIENT_ID=AWNsmDD6f5pjxe0SdTTEkQ40KvQrPVjQXzDh_7GDqwsErodZRma3FZ1zMlmHosGsRLsydeSYRLY3YCSN
PAYPAL_CLIENT_SECRET=ECc1O8XceGnuh2OdfsWFD2BX2_tbO3WmJoQP0pl52Wfb2C6bREWOfZTL8MG0IZoqsRkJ9_mDTJt9XIED
PAYPAL_MODE=sandbox
PAYPAL_PLAN_ID=P-44W73252A9791212HNF4HCTI
PAYPAL_PRODUCT_ID=PROD-0ED8639768660403F
PAYPAL_WEBHOOK_ID=55T49098J9218290K
```

### Verify These Are Already Set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL=https://yumspot.co.za`
- All other existing environment variables

**Important:** After adding variables, Vercel will automatically redeploy. Wait for deployment to complete before proceeding.

---

## Step 2: Set Up Production Webhook in PayPal

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Make sure you're in **Sandbox** mode (toggle at top right)
3. Navigate to **Apps & Credentials** in the left sidebar
4. Scroll down to **Webhooks** section (or click **"Webhooks events"** from dashboard)
5. Click **"Create Webhook"** or **"+ Add Webhook"**
6. Configure the webhook:
   - **Webhook URL**: `https://yumspot.co.za/api/paypal/webhook`
   - **Event Types** (select all):
     - ✅ `BILLING.SUBSCRIPTION.CREATED`
     - ✅ `BILLING.SUBSCRIPTION.ACTIVATED`
     - ✅ `BILLING.SUBSCRIPTION.CANCELLED`
     - ✅ `BILLING.SUBSCRIPTION.SUSPENDED`
     - ✅ `PAYMENT.SALE.COMPLETED`
7. Click **"Save"**
8. **Copy the Webhook ID** (starts with `WH-`)
9. Go back to Vercel → Environment Variables
10. Add `PAYPAL_WEBHOOK_ID` with the copied Webhook ID value
11. Vercel will redeploy automatically

---

## Step 3: Verify Database Migration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `cercjilqldbulmlztojq`
3. Go to **SQL Editor**
4. Run this query to verify the migration was applied:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
AND column_name IN ('paypal_subscription_id', 'paypal_customer_id');
```

**Expected Result:** You should see both columns listed.

If the columns don't exist, run the migration:

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

## Step 4: Test Production Flow

1. **Wait for Vercel deployment to complete** (check Vercel dashboard)
2. Visit: `https://yumspot.co.za/pro`
3. **Log in** with a test account (or create one)
4. Click **"Subscribe with PayPal"** button
5. You should be redirected to PayPal sandbox checkout
6. **Complete the payment** using PayPal sandbox test account:
   - Use the test card: `4032033234232978`
   - Expiry: Any future date
   - CVC: Any 3 digits
7. After approval, you'll be redirected to: `/account?paypal=success`
8. **Verify**:
   - Success message appears on account page
   - Subscription status shows as "Active" or "Pro"
   - Check Vercel function logs for webhook events

---

## Step 5: Monitor and Verify

### Check Vercel Logs:
1. Go to Vercel Dashboard → Your Project → **Functions** tab
2. Click on `/api/paypal/webhook` function
3. Check **Logs** tab for webhook events
4. You should see: `🔔 PayPal Webhook Received:` logs

### Verify in Supabase:
1. Go to Supabase Dashboard → **Table Editor**
2. Open `subscriptions` table
3. Verify your test subscription was created with:
   - `paypal_subscription_id` populated
   - `status` = 'active'
   - `user_id` matches your test user

### Test Webhook Manually (Optional):
1. Go to PayPal Dashboard → **Webhooks Simulator**
2. Use URL: `https://yumspot.co.za/api/paypal/webhook`
3. Select event: `BILLING.SUBSCRIPTION.ACTIVATED`
4. Click **"Send Test"**
5. Check Vercel logs to verify it was received

---

## Troubleshooting

### "PayPal checkout is not configured"
- Verify `ENABLE_PAYPAL_CHECKOUT=true` in Vercel
- Verify `NEXT_PUBLIC_ENABLE_PAYPAL_CHECKOUT=true` in Vercel
- Wait for Vercel redeployment after adding variables

### "Unauthorized" error
- Make sure you're logged in before clicking subscribe
- Check that Supabase auth is working in production

### Webhook not receiving events
- Verify webhook URL is correct: `https://yumspot.co.za/api/paypal/webhook`
- Check that webhook is created in **Sandbox** mode (not Live)
- Verify `PAYPAL_WEBHOOK_ID` is set in Vercel
- Check Vercel function logs for errors

### Subscription not activating
- Check Vercel logs for webhook processing errors
- Verify database migration was run
- Check that user email matches between PayPal and Supabase

---

## Going Live (Future)

When ready to accept real payments:

1. **Get Live PayPal Credentials:**
   - Switch PayPal Dashboard to **Live** mode
   - Create new app or use existing live app
   - Copy live Client ID and Secret

2. **Create Live Product and Plan:**
   - Create product in PayPal Dashboard
   - Create subscription plan ($3/month)
   - Copy Plan ID and Product ID

3. **Update Vercel Environment Variables:**
   - Change `PAYPAL_MODE=live`
   - Update `PAYPAL_CLIENT_ID` with live credentials
   - Update `PAYPAL_CLIENT_SECRET` with live credentials
   - Update `PAYPAL_PLAN_ID` with live plan ID
   - Update `PAYPAL_PRODUCT_ID` with live product ID

4. **Create Live Webhook:**
   - Create new webhook in **Live** mode
   - Use same URL: `https://yumspot.co.za/api/paypal/webhook`
   - Update `PAYPAL_WEBHOOK_ID` in Vercel

5. **Test with Small Amount First!**

---

## Success Checklist

- [ ] All environment variables added to Vercel
- [x] Production webhook created in PayPal ✅
- [ ] `PAYPAL_WEBHOOK_ID` added to Vercel
- [ ] Database migration verified/run
- [ ] Test subscription completed successfully
- [ ] Webhook events appearing in Vercel logs
- [ ] Subscription appears in Supabase
- [ ] Account page shows subscription status

---

**Last Updated:** After PayPal integration completion
**Status:** Ready for production deployment
