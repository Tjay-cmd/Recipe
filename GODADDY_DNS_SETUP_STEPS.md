# 🔧 Adding DNS Records in GoDaddy for yumspot.co.za

## Step-by-Step Instructions

### Step 1: Log into GoDaddy

1. Go to [GoDaddy.com](https://www.godaddy.com)
2. Click **"Sign In"** (top right)
3. Enter your credentials

---

### Step 2: Navigate to DNS Management

1. Go to **"My Products"** (click your name/avatar → My Products)
2. Find **"Domains"** section
3. Click on **`yumspot.co.za`** (your domain)
4. Click **"DNS"** button (or "Manage DNS")

---

### Step 3: Add A Record for Root Domain

**This is for `yumspot.co.za` (without www):**

1. Scroll down to **"Records"** section
2. Find existing **A record** with Name `@` (if it exists)
   - **DELETE it** (click trash icon) or edit it
3. Click **"Add"** button (or "Add Record")
4. Select **Type: `A`**
5. Fill in:
   - **Name:** `@` (or leave blank - same thing)
   - **Value:** `216.198.79.1` (copy from Vercel)
   - **TTL:** `600` (or default)
6. Click **"Save"** (or "Add Record")

**✅ Record Added:**
```
Type: A
Name: @
Value: 216.198.79.1
```

---

### Step 4: Add CNAME Record for WWW

**This is for `www.yumspot.co.za`:**

1. Still in **"Records"** section
2. Find existing **CNAME record** with Name `www` (if it exists)
   - **DELETE it** (click trash icon) or edit it
3. Click **"Add"** button
4. Select **Type: `CNAME`**
5. Fill in:
   - **Name:** `www`
   - **Value:** `c18b684255a9b598.vercel-dns-017.com.` (copy from Vercel - **include the dot at the end!**)
   - **TTL:** `600` (or default)
6. Click **"Save"** (or "Add Record")

**✅ Record Added:**
```
Type: CNAME
Name: www
Value: c18b684255a9b598.vercel-dns-017.com.
```

---

### Step 5: Verify Your Records

After adding, your DNS records should look like:

```
A Record:
  Name: @
  Value: 216.198.79.1
  
CNAME Record:
  Name: www
  Value: c18b684255a9b598.vercel-dns-017.com.
```

**Make sure:**
- ✅ A record has Name `@` and Value `216.198.79.1`
- ✅ CNAME record has Name `www` and Value `c18b684255a9b598.vercel-dns-017.com.` (with dot!)
- ✅ No conflicting records exist

---

### Step 6: Wait for DNS Propagation

1. **Go back to Vercel** → Settings → Domains
2. Click **"Refresh"** button next to your domain
3. **Wait 10-30 minutes** (can take up to 24-48 hours)
4. Status should change from **"Invalid Configuration"** → **"Valid"** ✅

---

### Step 7: Verify It's Working

**After 10-30 minutes:**

1. **Check Vercel Dashboard:**
   - Settings → Domains
   - Both domains should show **"Valid"** (green checkmark)

2. **Test in Browser:**
   - Visit `https://yumspot.co.za`
   - Visit `https://www.yumspot.co.za`
   - Both should load your site

3. **Check SSL:**
   - Vercel → Domains → Should show **"Issued"** for SSL certificate

---

## Common Issues & Fixes

### ❌ Still showing "Invalid Configuration" after 30 minutes?

1. **Double-check records in GoDaddy:**
   - A record: Name `@`, Value `216.198.79.1`
   - CNAME: Name `www`, Value `c18b684255a9b598.vercel-dns-017.com.` (with dot!)

2. **Delete old records:**
   - Remove any old A/CNAME records pointing to different values

3. **Wait longer:**
   - DNS can take 24-48 hours to fully propagate
   - Use [whatsmydns.net](https://www.whatsmydns.net) to check propagation status

### ❌ CNAME value has extra characters?

- Make sure it's exactly: `c18b684255a9b598.vercel-dns-017.com.`
- **Include the trailing dot** (`.`)

### ❌ A record not saving?

- Try leaving Name blank instead of `@` (some GoDaddy interfaces prefer blank)
- Make sure Value is exactly: `216.198.79.1`

### ❌ Can't find DNS section in GoDaddy?

- Look for **"DNS"** tab or button
- Might be under **"Manage"** → **"DNS"**
- Or **"Advanced DNS"**

---

## Quick Checklist

- [ ] Logged into GoDaddy
- [ ] Navigated to DNS management for `yumspot.co.za`
- [ ] Added A record: Name `@`, Value `216.198.79.1`
- [ ] Added CNAME record: Name `www`, Value `c18b684255a9b598.vercel-dns-017.com.`
- [ ] Deleted any old conflicting records
- [ ] Saved all changes
- [ ] Waited 10-30 minutes
- [ ] Clicked "Refresh" in Vercel
- [ ] Status changed to "Valid" ✅

---

## What Happens Next?

✅ **Within 30 minutes:** Domain should show "Valid" in Vercel  
✅ **Within 24 hours:** SSL certificate will be issued  
✅ **Your site will be live at:** `https://yumspot.co.za`

After domain is valid, remember to update `NEXT_PUBLIC_APP_URL` in Vercel environment variables to `https://yumspot.co.za`!
