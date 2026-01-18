# Google AdSense Setup Guide

## Quick Start

### 1. Apply for Google AdSense

1. Go to [Google AdSense](https://www.google.com/adsense)
2. Sign in with your Google account
3. Click "Get Started"
4. Enter your website URL
5. Select your country
6. Complete the application

**Note:** Approval can take 1-2 weeks. Your site must have:
- Original content (recipes)
- Privacy policy
- Contact page
- No policy violations

### 2. Get Your AdSense Code

Once approved:

1. Go to AdSense Dashboard → **Ads** → **By ad unit**
2. Click **Create ad unit**
3. Choose ad format:
   - **Display ads** (recommended for recipes)
   - **In-feed ads** (for recipe lists)
   - **In-article ads** (for recipe content)
4. Set ad size: **Responsive** (recommended)
5. Name your ad unit (e.g., "Recipe Page Top", "Recipe Page Bottom")
6. Copy your **Publisher ID** (starts with `ca-pub-`)
7. Copy your **Ad Unit ID** (the number, e.g., `1234567890`)

### 3. Add to Environment Variables

Add these to your `.env.local` file:

```env
# Google AdSense Configuration
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-XXXXXXXXXXXXXXXX
NEXT_PUBLIC_ADSENSE_SLOT_1=1234567890
NEXT_PUBLIC_ADSENSE_SLOT_2=0987654321
```

**For Production (Vercel):**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add the same variables
3. Redeploy

### 4. Create Ad Units in AdSense

Create at least 2 ad units:

1. **Ad Unit 1** (`NEXT_PUBLIC_ADSENSE_SLOT_1`):
   - Name: "Recipe Page - Between Ingredients/Steps"
   - Type: Display ads
   - Size: Responsive
   - Placement: Between ingredients and instructions

2. **Ad Unit 2** (`NEXT_PUBLIC_ADSENSE_SLOT_2`):
   - Name: "Recipe Page - After Steps"
   - Type: Display ads
   - Size: Responsive
   - Placement: After recipe steps

### 5. Test Ads

1. Start your dev server: `npm run dev`
2. Visit a recipe page
3. **If not Pro user:** You should see ads (or placeholders if not approved yet)
4. **If Pro user:** No ads should appear

---

## Ad Placement Strategy

### Current Ad Locations

1. **Between Ingredients and Steps** (High engagement)
   - Users are committed to the recipe
   - Good viewability
   - Lower bounce risk

2. **After Steps** (Completion)
   - Users finished reading
   - High engagement
   - Good time for ads

### Best Practices

- ✅ **Do:**
  - Use responsive ads (auto-size for mobile/desktop)
  - Place ads where users naturally pause (between sections)
  - Test different placements
  - Monitor RPM and adjust

- ❌ **Don't:**
  - Put ads before recipe starts (increases bounce)
  - Use too many ads (hurts UX and RPM)
  - Block content with pop-ups
  - Violate AdSense policies

---

## Pro Members = No Ads

**How it works:**
- The `AdSense` component checks if user is Pro
- If Pro: Ads don't render
- If Free: Ads show normally

**This makes Pro more valuable!**
- Free users: See ads
- Pro users: Ad-free + all Pro features

---

## Revenue Optimization

### Month 1-2: AdSense Setup
- **RPM:** $10-15 (starting)
- **Goal:** Get approved, learn what works

### Month 3-4: Optimization
- **RPM:** $15-20 (optimized)
- **Goal:** Test placements, improve viewability

### Month 6+: Premium Networks
- **Mediavine:** Requires 50k sessions/month, RPM $25-40
- **AdThrive:** Requires 100k sessions/month, RPM $30-50

---

## Troubleshooting

### Ads not showing?
1. **Check environment variables** are set correctly
2. **Verify AdSense approval** (takes 1-2 weeks)
3. **Check browser console** for errors
4. **Test as non-Pro user** (Pro users won't see ads)

### Placeholder showing?
- This is normal if AdSense not configured or not approved yet
- Placeholders show where ads will appear
- Once approved, real ads will replace placeholders

### Ads showing for Pro users?
- Check subscription status in database
- Verify `subscriptions` table has active status
- Check `NEXT_PUBLIC_ADMIN_EMAILS` is correct for admins

---

## AdSense Policies

**Important rules:**
- ✅ Original content only
- ✅ No click encouragement ("Click here!")
- ✅ No invalid clicks
- ✅ Privacy policy required
- ✅ Clear navigation
- ✅ Mobile-friendly

**Violations = Account banned!**

---

## Next Steps

1. ✅ Apply for AdSense
2. ✅ Wait for approval (1-2 weeks)
3. ✅ Get Publisher ID and Ad Unit IDs
4. ✅ Add to environment variables
5. ✅ Test on your site
6. ✅ Monitor performance in AdSense dashboard
7. ✅ Optimize placements based on RPM

---

## Support

- [AdSense Help Center](https://support.google.com/adsense)
- [AdSense Policies](https://support.google.com/adsense/answer/48182)
- [Ad Placement Best Practices](https://support.google.com/adsense/topic/1319757)
