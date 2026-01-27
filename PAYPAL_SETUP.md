# PayPal Integration Setup Guide

## Overview
This guide will help you set up PayPal subscriptions for YumSpot Pro.

## Step 1: Get PayPal API Credentials

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Log in with your PayPal business account
3. Navigate to **Dashboard** → **My Apps & Credentials**
4. Create a new app (or use existing):
   - **App Name**: YumSpot Pro
   - **Merchant**: Your business account
5. Copy your **Client ID** and **Secret** (for Sandbox or Live)

## Step 2: Create a Subscription Plan in PayPal

### Option A: Using PayPal Dashboard (Recommended)
1. Go to PayPal Dashboard → **Products** → **Subscriptions**
2. Click **Create Plan**
3. Fill in:
   - **Plan Name**: YumSpot Pro Monthly
   - **Description**: Monthly Pro subscription for YumSpot
   - **Billing Cycle**: Monthly
   - **Price**: $3.00 USD
   - **Setup Fee**: $0.00
4. Save and copy the **Plan ID** (starts with `P-`)

### Option B: Using API (Advanced)
You can create a plan programmatically using PayPal API, but dashboard is easier.

## Step 3: Set Up Webhook (For Production)

1. Go to PayPal Dashboard → **My Apps & Credentials**
2. Click on your app
3. Scroll to **Webhooks** section
4. Click **Add Webhook**
5. **Webhook URL**: `https://yourdomain.com/api/paypal/webhook`
6. Select events to listen for:
   - `BILLING.SUBSCRIPTION.CREATED`
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.SUSPENDED`
   - `PAYMENT.SALE.COMPLETED`
7. Copy the **Webhook ID**

## Step 4: Add Environment Variables

Add these to your `.env.local` file:

```env
# PayPal Configuration
ENABLE_PAYPAL_CHECKOUT=true
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_SECRET=your_client_secret_here
PAYPAL_MODE=sandbox
PAYPAL_PLAN_ID=P-XXXXXXXXXXXXX
PAYPAL_WEBHOOK_ID=your_webhook_id_here
```

**Important**: 
- Use `sandbox` for testing, `live` for production
- Never commit `.env.local` to git (it's already in .gitignore)

## Step 5: Run Database Migration

Run the migration to add PayPal fields to subscriptions table:

```sql
-- Go to Supabase Dashboard → SQL Editor
-- Copy and paste contents of: supabase/migrations/006_add_paypal_subscription.sql
-- Execute
```

## Step 6: Test the Integration

1. Start your dev server: `npm run dev`
2. Go to `/pro` page
3. Click "Subscribe with PayPal"
4. You'll be redirected to PayPal sandbox
5. Use PayPal sandbox test account to complete payment
6. After approval, you'll be redirected back to `/account`
7. Check that subscription status shows "pro"

## PayPal Sandbox Test Accounts

You can create test accounts in PayPal Developer Dashboard:
- Go to **Accounts** → **Sandbox** → **Create Account**
- Use these for testing payments

## Troubleshooting

### "PayPal plan ID is not configured"
- Make sure `PAYPAL_PLAN_ID` is set in `.env.local`
- Restart your dev server after adding env variables

### "PayPal checkout is not configured"
- Check that `ENABLE_PAYPAL_CHECKOUT=true`
- Verify `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` are set

### Subscription not activating after payment
- Check webhook is configured correctly
- Verify webhook URL is accessible (use ngrok for local testing)
- Check Supabase logs for webhook errors

### For Local Testing with Webhooks
Use [ngrok](https://ngrok.com/) to expose your local server:
```bash
ngrok http 3000
# Use the ngrok URL for webhook: https://your-ngrok-url.ngrok.io/api/paypal/webhook
```

## Going Live

1. Switch `PAYPAL_MODE=live` in production environment variables
2. Use live PayPal credentials (not sandbox)
3. Update webhook URL to production domain
4. Test with real PayPal account (small amount first!)

## Support

- [PayPal Developer Docs](https://developer.paypal.com/docs/)
- [PayPal Subscriptions API](https://developer.paypal.com/docs/subscriptions/)
