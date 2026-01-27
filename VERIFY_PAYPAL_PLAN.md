# Verify PayPal Plan ID - Troubleshooting RESOURCE_NOT_FOUND

## Error You're Getting
```
RESOURCE_NOT_FOUND: The specified resource does not exist
INVALID_RESOURCE_ID: Requested resource ID was not found
```

## Root Cause
The Plan ID `P-63978075C9884545MNF4GTVI` can't be found by PayPal's API. This happens when:
1. The Plan doesn't belong to the app/credentials being used
2. The Plan is in a different mode (Live when expecting Sandbox, or vice versa)
3. The Plan wasn't properly saved/created

---

## Step 1: Verify Plan Exists in PayPal Dashboard

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Make sure you're in **Sandbox** mode (toggle at top right)
3. Go to **Apps & Credentials** in left sidebar
4. Click on your app (the one with Client ID: `AWNsmDD6f5pjxe0SdTTEkQ40KvQrPVjQXzDh_7GDqwsErodZRma3FZ1zMlmHosGsRLsydeSYRLY3YCSN`)
5. Look for a **"Plans"** or **"Billing Plans"** section
6. Check if Plan ID `P-63978075C9884545MNF4GTVI` is listed there

**If you don't see the plan:** The plan might not be associated with this app.

---

## Step 2: Check Which App the Plan Belongs To

### Option A: View All Plans
1. In PayPal Dashboard, go to **Billing** or **Subscriptions** in the left sidebar
2. Look for **"Plans"** section
3. Find the plan with ID `P-63978075C9884545MNF4GTVI`
4. Check which app it's associated with

### Option B: List Plans via API
We can create a quick test to list all plans for your app credentials.

---

## Step 3: Verify App Credentials Match

The issue might be that:
- You created the plan while logged into a different PayPal account
- The plan was created with different API credentials
- The plan exists but your current app doesn't have access to it

### To Fix This:
You need to create a new plan using the EXACT app credentials you're using in Vercel:

**App Client ID (from Vercel):**
```
AWNsmDD6f5pjxe0SdTTEkQ40KvQrPVjQXzDh_7GDqwsErodZRma3FZ1zMlmHosGsRLsydeSYRLY3YCSN
```

---

## Quick Fix: Create Plan Using Script

Let's use the `create-paypal-plan.js` script to create a plan using your EXACT Vercel credentials:

1. Make sure your `.env.local` has the correct credentials
2. Run: `node scripts/create-paypal-plan.js`
3. Copy the new Plan ID
4. Update Vercel environment variable `PAYPAL_PLAN_ID` with the new ID
5. Wait for Vercel to redeploy

---

## Alternative: Verify Plan ID in PayPal Dashboard

### Steps to Find the Correct Plan ID:
1. Go to PayPal Dashboard (Sandbox mode)
2. Navigate to **Catalog** → **Products**
3. Find your product: "YumSpot Pro Subscription"
4. Click on it
5. Look for the **Plans** section
6. Copy the correct Plan ID
7. Update Vercel environment variables
8. Redeploy

---

## Next Steps

**Tell me:**
1. Can you see the Plan ID `P-63978075C9884545MNF4GTVI` in your PayPal Dashboard?
2. Which section did you find it in?
3. Does it show the correct app name?

If you can't find it, we'll create a new plan with the correct credentials.
