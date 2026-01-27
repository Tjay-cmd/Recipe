# PayPal Webhook Setup - Step by Step

## Current Status
✅ Product created: PROD-6SX01410U7418023B  
✅ Plan created and active: P-63978075C9884545MNF4GTVI  
✅ Plan status: ON  
⏳ Webhook setup: Ready to create

---

## Step-by-Step Webhook Creation

### Step 1: Navigate to Webhooks
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. **Make sure you're in Sandbox mode** (toggle at top right should say "Sandbox")
3. In the left sidebar, click **"Apps & Credentials"**
4. Scroll down to find the **"Webhooks"** section
   - OR click **"Webhooks events"** from the main dashboard

### Step 2: Create New Webhook
1. Click **"Create Webhook"** or **"+ Add Webhook"** button
2. You'll see a form with:
   - **Webhook URL** field
   - **Event Types** selection

### Step 3: Configure Webhook URL
In the **"Webhook URL"** field, enter:
```
https://yumspot.co.za/api/paypal/webhook
```

**Important:** Make sure:
- It starts with `https://` (not `http://`)
- It's exactly: `https://yumspot.co.za/api/paypal/webhook`
- No trailing slash at the end

### Step 4: Select Event Types
Select ALL of these event types (check the boxes):
- ✅ `BILLING.SUBSCRIPTION.CREATED`
- ✅ `BILLING.SUBSCRIPTION.ACTIVATED`
- ✅ `BILLING.SUBSCRIPTION.CANCELLED`
- ✅ `BILLING.SUBSCRIPTION.SUSPENDED`
- ✅ `PAYMENT.SALE.COMPLETED`

**Tip:** Some PayPal dashboards have a "Select All" option - use that if available.

### Step 5: Save the Webhook
1. Click **"Save"** or **"Create Webhook"** button
2. PayPal will validate the URL (make sure your domain is accessible)
3. If successful, you'll see a success message

### Step 6: Copy the Webhook ID
After saving, you'll see:
- The webhook listed in your webhooks table
- A **Webhook ID** (starts with `WH-`)
- Example: `WH-XXXXXXXXXXXXX`

**Copy this Webhook ID** - you'll need it for Vercel!

---

## After Webhook Creation

### Update Vercel Environment Variables
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add or update:
   ```
   PAYPAL_WEBHOOK_ID=WH-XXXXXXXXXXXXX
   ```
   (Replace with your actual Webhook ID)
5. Vercel will automatically redeploy

### Test the Webhook
1. Go back to PayPal Dashboard → **Webhooks Simulator**
2. Use URL: `https://yumspot.co.za/api/paypal/webhook`
3. Select event: `BILLING.SUBSCRIPTION.ACTIVATED`
4. Click **"Send Test"**
5. Check Vercel logs to verify it was received

---

## Troubleshooting

### "Invalid URL" or "URL not accessible"
- Make sure `yumspot.co.za` is properly connected to Vercel
- Verify the domain has SSL (HTTPS) enabled
- Check that Vercel deployment is live

### Webhook created but not receiving events
- Verify webhook is in **Sandbox** mode (not Live)
- Check that `PAYPAL_WEBHOOK_ID` is set in Vercel
- Verify all event types are selected
- Check Vercel function logs for errors

### Webhook ID not showing
- Refresh the PayPal dashboard page
- Check the webhooks list table
- The ID should be visible in the webhook details

---

## Quick Checklist

- [ ] Navigate to PayPal Dashboard → Apps & Credentials → Webhooks
- [ ] Click "Create Webhook"
- [ ] Enter URL: `https://yumspot.co.za/api/paypal/webhook`
- [ ] Select all 5 event types
- [ ] Click "Save"
- [ ] Copy Webhook ID (starts with `WH-`)
- [ ] Add `PAYPAL_WEBHOOK_ID` to Vercel environment variables
- [ ] Test webhook using PayPal Webhooks Simulator

---

**Ready?** Follow the steps above and let me know when you have the Webhook ID!
