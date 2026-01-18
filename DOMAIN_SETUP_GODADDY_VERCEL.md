# 🚀 Connecting GoDaddy Domain to Vercel - Step by Step Guide

## Step 1: Buy Domain on GoDaddy (if you haven't)

1. Go to [GoDaddy.com](https://www.godaddy.com)
2. Search for your domain: `yumspot.com` (or whatever you want)
3. Add to cart and checkout
4. Complete purchase

**Recommended:** 
- `yumspot.com` (matches your Pinterest)
- `www.yumspot.com` (included automatically)
- Yearly price: ~$12-15/year

---

## Step 2: Add Domain in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain: `yumspot.com`
4. Click **"Add"**
5. Vercel will show you DNS configuration options

**Vercel will show two options:**
- **Option A:** Configure DNS in GoDaddy (recommended if you want to keep GoDaddy DNS)
- **Option B:** Use Vercel nameservers (easier, Vercel manages everything)

---

## Step 3: Configure DNS (Choose ONE method)

### ✅ Method A: Use Vercel Nameservers (EASIEST - Recommended)

1. In Vercel → Domains → Your domain → You'll see **4 nameservers** like:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```

2. **In GoDaddy:**
   - Go to **GoDaddy.com** → **My Products** → **Domains** → Click your domain
   - Click **"DNS"** or **"Manage DNS"**
   - Scroll down to **"Nameservers"** section
   - Click **"Change"** or **"Edit"**
   - Select **"Custom"** (instead of "Default")
   - Delete existing nameservers
   - Add Vercel's 4 nameservers:
     - `ns1.vercel-dns.com`
     - `ns2.vercel-dns.com`
     - `ns3.vercel-dns.com`
     - `ns4.vercel-dns.com`
   - Click **"Save"**

3. **Wait 24-48 hours** for DNS to propagate
4. Vercel will automatically detect and configure SSL (HTTPS)

---

### Method B: Use DNS Records in GoDaddy (Keep GoDaddy DNS)

1. **In Vercel** → Domains → Your domain → You'll see DNS records to add:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

2. **In GoDaddy:**
   - Go to **GoDaddy.com** → **My Products** → **Domains** → Click your domain
   - Click **"DNS"** or **"Manage DNS"**
   - Scroll to **"Records"** section
   - **Delete existing A record** for `@` (if exists)
   - **Add new A record:**
     - Type: `A`
     - Name: `@` (or leave blank)
     - Value: `76.76.21.21` (or value Vercel shows)
     - TTL: `600` (or default)
   - **Add CNAME record:**
     - Type: `CNAME`
     - Name: `www`
     - Value: `cname.vercel-dns.com` (or value Vercel shows)
     - TTL: `600` (or default)
   - Click **"Save"**

3. **Wait 24-48 hours** for DNS to propagate

---

## Step 4: Update Environment Variable in Vercel

After domain is connected (24-48 hours later):

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Find `NEXT_PUBLIC_APP_URL`
3. Update value to: `https://yumspot.com` (or `https://www.yumspot.com`)
4. Click **"Save"**
5. **Redeploy** your project (or it auto-updates)

---

## Step 5: Verify Domain is Working

1. **Check Vercel Dashboard:**
   - Go to Settings → Domains
   - Your domain should show **"Valid"** with green checkmark
   - SSL should show **"Issued"**

2. **Test in Browser:**
   - Visit `https://yumspot.com`
   - Should load your site
   - Should show padlock (HTTPS)

3. **Test WWW:**
   - Visit `https://www.yumspot.com`
   - Should redirect to `https://yumspot.com` (or vice versa, depending on your settings)

---

## Troubleshooting

### Domain not working after 24 hours?
- **Check DNS propagation:** Use [whatsmydns.net](https://www.whatsmydns.net)
- **Check nameservers:** Make sure GoDaddy shows Vercel nameservers
- **Check Vercel:** Make sure domain shows "Valid" in Vercel dashboard

### SSL not working?
- **Wait longer:** SSL can take up to 24 hours after DNS propagates
- **Check Vercel:** Settings → Domains → Should show "Issued" for SSL

### WWW not redirecting?
- **In Vercel:** Settings → Domains → Click your domain
- Enable **"Redirect www to apex"** or **"Redirect apex to www"**

### Getting 404 errors?
- **Update `NEXT_PUBLIC_APP_URL`** in Vercel environment variables
- **Redeploy** your project

---

## Next Steps After Domain is Live

1. ✅ **Update Pinterest:** Verify domain in Pinterest (uses your new domain)
2. ✅ **Update AdSense:** Add your domain to AdSense (if not already approved)
3. ✅ **Submit to Google Search Console:** Add your domain
4. ✅ **Update Social Links:** Use `yumspot.com` in all your social profiles

---

## Quick Checklist

- [ ] Domain purchased on GoDaddy
- [ ] Domain added in Vercel
- [ ] Nameservers updated in GoDaddy (or DNS records added)
- [ ] Waited 24-48 hours for DNS propagation
- [ ] Domain shows "Valid" in Vercel
- [ ] SSL certificate issued
- [ ] `NEXT_PUBLIC_APP_URL` updated in Vercel
- [ ] Site loads on `https://yumspot.com`
- [ ] WWW redirects correctly

---

## Need Help?

- **Vercel Support:** [vercel.com/support](https://vercel.com/support)
- **GoDaddy Support:** [godaddy.com/help](https://www.godaddy.com/help)
- **DNS Checker:** [whatsmydns.net](https://www.whatsmydns.net)

---

**Time:** 24-48 hours for DNS propagation  
**Cost:** $12-15/year for domain (one-time per year)  
**SSL:** Free (automatically provided by Vercel)
