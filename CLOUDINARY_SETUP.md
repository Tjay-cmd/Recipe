# 📸 Cloudinary Image Upload Setup

Your recipe site now has **drag-and-drop image upload**! No more copying URLs from ImgBB. 🎉

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Free Cloudinary Account

1. Go to: https://cloudinary.com/users/register/free
2. Sign up (it's free - 25GB storage, 25GB bandwidth/month)
3. Verify your email
4. You'll be taken to your dashboard

### Step 2: Get Your Cloud Name

On your Cloudinary dashboard, you'll see:
```
Cloud name: your-cloud-name
```
Copy this! You'll need it.

### Step 3: Create Upload Preset

1. In Cloudinary dashboard, click **Settings** (gear icon)
2. Click **Upload** tab
3. Scroll down to **Upload presets**
4. Click **Add upload preset**
5. Configure:
   - **Preset name:** `recipes` (or whatever you want)
   - **Signing Mode:** Select **"Unsigned"** ⚠️ (Important!)
   - **Folder:** `recipe-images` (optional, keeps things organized)
   - Click **Save**

### Step 4: Add to Environment Variables

Add these to your `.env.local` file:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name-here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=recipes
```

**Example:**
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dj3k5l9m2
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=recipes
```

### Step 5: Restart Dev Server

```bash
# Stop the server (Ctrl+C)
# Start it again
npm run dev
```

---

## ✅ Test It!

1. Go to your admin panel: http://localhost:3000/admin
2. Click **"Add New Recipe"**
3. Under **Cover Image**, you'll see:
   - 📸 **Click to upload image** button
   - Drag and drop area
4. Click or drag an image
5. Watch it upload! ⚡
6. Image appears instantly

---

## 🎯 How It Works

### Before (Old Way):
```
1. Find image
2. Upload to ImgBB
3. Copy URL
4. Paste URL
5. Hope it works
```

### After (New Way):
```
1. Click upload button
2. Select image
3. Done! ✨
```

---

## 📋 Features

✅ **Drag & Drop** - Just drag images onto the upload area
✅ **Click to Upload** - Or click to browse files
✅ **Instant Preview** - See your image immediately
✅ **Remove & Replace** - Easy to change images
✅ **Fallback URL** - Can still paste URLs if needed
✅ **Validation** - Only accepts images, max 5MB
✅ **Free** - 25GB storage on free tier

---

## 🔧 Advanced Configuration (Optional)

### Image Transformations

Cloudinary can automatically optimize images! Add to your upload preset:

1. Go to your upload preset settings
2. Under **Incoming Transformation**:
   - **Width:** 1200
   - **Height:** 1200
   - **Crop:** Limit
   - **Quality:** Auto
   - **Format:** Auto

This will:
- Resize large images automatically
- Convert to WebP for faster loading
- Compress without quality loss
- Save bandwidth

### Folder Organization

In your upload preset, set:
- **Folder:** `recipe-images/{date}`

This organizes images by date automatically!

---

## 💰 Pricing (Free Tier)

Cloudinary Free Plan includes:
- ✅ 25 GB storage
- ✅ 25 GB bandwidth/month
- ✅ 25,000 transformations/month
- ✅ Unlimited images

**For a recipe site:** This is enough for:
- ~5,000 recipe images
- ~100,000 page views/month
- Plenty for MVP and beyond!

---

## 🆘 Troubleshooting

### "Upload failed" error

**Check:**
1. Cloud name is correct in `.env.local`
2. Upload preset name matches
3. Upload preset is set to **"Unsigned"** (not "Signed")
4. Restarted dev server after adding env variables

### Image doesn't appear

**Check:**
1. Image is under 5MB
2. File is actually an image (JPG, PNG, WEBP)
3. Browser console for errors

### "Unsigned upload preset not found"

**Fix:**
1. Go to Cloudinary dashboard
2. Settings → Upload → Upload presets
3. Make sure preset exists
4. Make sure **Signing Mode** is "Unsigned"
5. Copy the exact preset name to `.env.local`

---

## 🎨 Image Best Practices

For best Pinterest & SEO results:

**Dimensions:**
- Minimum: 600 x 900px (Pinterest-friendly)
- Recommended: 1000 x 1500px (tall/vertical)
- Maximum: 2000 x 3000px (Cloudinary will optimize)

**File Size:**
- Under 2MB is ideal
- Cloudinary will compress automatically

**Format:**
- JPG for photos
- PNG for graphics with text
- Cloudinary converts to WebP automatically!

---

## ✨ You're Done!

Your recipe site now has **professional image upload**! 

**Benefits:**
- ⚡ Faster workflow
- 🎨 Better UX
- 📸 Automatic optimization
- 🌍 Global CDN (images load fast everywhere)
- 💾 Automatic backups

**Next:** Create some recipes with beautiful photos! 📷✨
