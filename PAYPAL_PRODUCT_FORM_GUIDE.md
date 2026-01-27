# PayPal Product Form - Fill Out Guide

## Form Fields to Fill:

### 1. **Product name**
```
YumSpot Pro
```
or
```
YumSpot Pro Subscription
```

### 2. **Product description** (256 characters max)
```
Unlock premium recipe features including meal planning, smart shopping lists, and exclusive recipes. Get access to all Pro features on YumSpot.co.za.
```

### 3. **Product ID**
```
PROD-8SD09385P88669403
```
*(This is the Product ID you already created - use this if you're editing an existing product, or leave blank if creating new)*

**Note:** If this is a NEW product (not editing existing), leave this field **BLANK** and PayPal will generate one for you.

### 4. **Product type** (dropdown)
Select: **`SERVICE`** or **`DIGITAL_GOODS`**

**Recommendation:** Choose **`SERVICE`** since you're providing a subscription service (access to features, not a physical product).

### 5. **Industry category** (dropdown)
Select: **`Food & Beverage`** or **`Digital Content`**

**Recommendation:** Choose **`Food & Beverage`** since it's a recipe website.

### 6. **Product page URL**
```
https://yumspot.co.za/pro
```
*(This is your Pro subscription page where users can learn about and subscribe)*

### 7. **Product image URL** (optional)
You can leave this blank, or use:
- Your website logo URL
- A screenshot of your Pro features page
- Any image that represents your subscription service

**Example format:** `https://yumspot.co.za/logo.png` (if you have one)

---

## Quick Copy-Paste Values:

**Product Name:**
```
YumSpot Pro
```

**Product Description:**
```
Unlock premium recipe features including meal planning, smart shopping lists, and exclusive recipes. Get access to all Pro features on YumSpot.co.za.
```

**Product Page URL:**
```
https://yumspot.co.za/pro
```

**Product ID:** (Only if editing existing product)
```
PROD-8SD09385P88669403
```

---

## After Filling:

1. Click **"Next"** button at the bottom right
2. You'll proceed to the "Create Plan" step where you'll set:
   - Billing cycle (Monthly)
   - Price ($3.00 USD)
   - Other plan details

---

**Important:** If you're creating a NEW product (not editing the existing one), leave the Product ID field blank. PayPal will auto-generate a new Product ID for you, and you'll need to update `PAYPAL_PRODUCT_ID` in your Vercel environment variables with the new ID.
