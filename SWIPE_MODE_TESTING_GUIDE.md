# Swipe Mode Testing & QA Guide

This document provides comprehensive testing procedures for the new swipe-based recipe discovery mode.

## 🗂️ Pre-Testing Setup

### 1. Database Migration
Ensure the migration has been applied to your Supabase project:
```bash
# Apply migration 008_swipe_preferences.sql via Supabase dashboard or CLI
```

Verify the `recipe_swipes` table exists with:
- Correct columns: `id`, `user_id`, `recipe_id`, `preference`, `created_at`, `updated_at`
- Unique constraint on `(user_id, recipe_id)`
- RLS policies for authenticated users

### 2. Test Data Requirements
- At least 20+ recipes in the database with:
  - `views` > 10 (to meet "viral" threshold)
  - Mix of Pro and free recipes
  - Recipes with complete nutrition data
  - Recipes with various tags and difficulty levels
- Test user account (authenticated)
- Optional: Test Pro user account with active subscription

---

## 🧪 API Endpoint Testing

### API 1: `/api/swipe/candidates` (GET)

**Purpose**: Fetch viral recipes for swiping

#### Test Cases:

1. **Authenticated User - Success**
   - Login as a regular user
   - GET `/api/swipe/candidates`
   - Expected: 200 status, array of candidate recipes
   - Verify: All recipes have `views >= 10`
   - Verify: Non-Pro users only see `is_pro = false` recipes

2. **Pro User - Access to Pro Recipes**
   - Login as Pro user (active subscription)
   - GET `/api/swipe/candidates`
   - Expected: Response includes both free and Pro recipes (`is_pro = true`)

3. **Unauthenticated User**
   - Logout or use incognito
   - GET `/api/swipe/candidates`
   - Expected: 401 Unauthorized

4. **Already Swiped Recipes Excluded**
   - Swipe through some recipes
   - GET `/api/swipe/candidates` again
   - Expected: Previously swiped recipes NOT in the new batch

5. **Empty State**
   - Swipe through ALL available recipes
   - GET `/api/swipe/candidates`
   - Expected: Empty array `{ candidates: [] }`

---

### API 2: `/api/swipe/record` (POST)

**Purpose**: Record user swipe preference

#### Test Cases:

1. **Record Like**
   ```json
   POST /api/swipe/record
   Body: { "recipeId": "<uuid>", "preference": "like" }
   ```
   - Expected: 200 status, `{ success: true, added_to_favorites: true, total_swipes: N }`
   - Verify: Recipe appears in user's favorites (check `/account` or favorites API)
   - Verify: Entry exists in `recipe_swipes` table with `preference = 1`

2. **Record Dislike**
   ```json
   POST /api/swipe/record
   Body: { "recipeId": "<uuid>", "preference": "dislike" }
   ```
   - Expected: 200 status, `added_to_favorites: false`
   - Verify: Entry in `recipe_swipes` with `preference = -1`
   - Verify: Recipe NOT in favorites

3. **Record Skip**
   ```json
   POST /api/swipe/record
   Body: { "recipeId": "<uuid>", "preference": "skip" }
   ```
   - Expected: 200 status, `added_to_favorites: false`
   - Verify: Entry in `recipe_swipes` with `preference = 0`

4. **Update Existing Swipe**
   - Swipe "like" on a recipe (in DB now)
   - Manually call API with same recipe ID but "dislike"
   - Expected: Upsert works, `preference` updated to `-1`
   - Verify: Only ONE row per `(user_id, recipe_id)` in table

5. **Invalid Recipe ID**
   ```json
   POST /api/swipe/record
   Body: { "recipeId": "invalid-uuid", "preference": "like" }
   ```
   - Expected: 400 Bad Request (Zod validation error)

6. **Invalid Preference Value**
   ```json
   POST /api/swipe/record
   Body: { "recipeId": "<uuid>", "preference": "maybe" }
   ```
   - Expected: 400 Bad Request

7. **Unauthenticated User**
   - Logout
   - POST `/api/swipe/record`
   - Expected: 401 Unauthorized

---

### API 3: `/api/swipe/recommendations` (GET)

**Purpose**: Get personalized recipe recommendations

#### Test Cases:

1. **User with No Likes**
   - Fresh user with no swipe history
   - GET `/api/swipe/recommendations`
   - Expected: 200 status, popular recipes returned (fallback)
   - Verify: `personalization_data.top_tags` is empty

2. **User with Some Likes**
   - Like 5+ recipes with common tags (e.g., "Chicken", "Quick")
   - GET `/api/swipe/recommendations?limit=10`
   - Expected: Recommendations share tags with liked recipes
   - Verify: `personalization_data.top_tags` includes common tags
   - Verify: Recipes are scored and sorted by relevance

3. **Exclude Already Swiped**
   - GET `/api/swipe/recommendations`
   - Expected: None of the recommended recipes have been swiped already

4. **Pro vs Free User**
   - Non-Pro user: recommendations should exclude Pro recipes
   - Pro user: recommendations can include Pro recipes

5. **Custom Limit**
   - GET `/api/swipe/recommendations?limit=5`
   - Expected: Exactly 5 recommendations (or fewer if not enough data)

6. **Unauthenticated User**
   - Logout
   - GET `/api/swipe/recommendations`
   - Expected: 401 Unauthorized

---

## 🎨 UI/UX Testing

### Page: `/swipe`

#### Initial Load

1. **Unauthenticated Access**
   - Navigate to `/swipe` while logged out
   - Expected: Redirect to `/login?redirectTo=/swipe`
   - After login, should return to `/swipe`

2. **Authenticated Access - Success**
   - Login and navigate to `/swipe`
   - Expected: Loading spinner → Deck of recipe cards appears
   - Verify: First card is visible, second card slightly visible behind (preview)
   - Verify: Action buttons (X, skip, heart) are visible and styled

3. **Empty State**
   - User who has swiped all recipes
   - Expected: "You've swiped through all available recipes!" message
   - "Start New Session" button visible

---

#### Card Display & Interaction

1. **Card Front Face**
   - Verify displays:
     - Recipe image (or placeholder)
     - Recipe title
     - Total time (prep + cook)
     - Number of servings
     - Difficulty badge (if present)
     - Pro badge (if `is_pro = true`)
     - Top 3 tags
     - Info button (if nutrition data exists)

2. **Card Flip to Nutrition**
   - Click the info button (ℹ️) on a recipe with nutrition data
   - Expected: Card flips with smooth 3D animation
   - Back shows: Nutrition facts (calories, protein, carbs, etc.)
   - Click info button again → flips back to front

3. **Card with No Nutrition**
   - Recipe without nutrition data
   - Expected: No info button visible, OR button is disabled/grayed out

---

#### Swipe Gestures (Mobile & Desktop)

1. **Swipe Right (Like)**
   - On mobile: Touch and drag card to the right
   - On desktop: Click and drag card to the right
   - Expected:
     - Card follows finger/mouse
     - "LIKE" indicator appears in green
     - Card flies off screen to the right
     - Next card becomes current
     - Recipe added to favorites

2. **Swipe Left (Dislike)**
   - Drag card to the left
   - Expected:
     - "NOPE" indicator appears in red
     - Card flies off to the left
     - Next card appears

3. **Swipe Up (Skip)**
   - Drag card upward
   - Expected:
     - Card flies upward
     - Next card appears
     - Recipe recorded as "skip"

4. **Small Drag (Return to Center)**
   - Drag card slightly but release before threshold
   - Expected: Card snaps back to center (no swipe recorded)

5. **Button Clicks**
   - Click X button → same as swipe left
   - Click heart button → same as swipe right
   - Click skip button → same as swipe up

6. **Keyboard Support (Desktop)**
   - Press Left Arrow → dislike
   - Press Right Arrow → like
   - Press Up Arrow → skip
   - Expected: Same behavior as swiping/clicking

---

#### Session Flow

1. **Swipe Counter**
   - Start swiping
   - Verify: "N swipes • M recipes left" counter updates after each swipe

2. **Summary Trigger (15 swipes)**
   - Swipe through 15 recipes
   - Expected: Summary screen appears automatically
   - Shows: "Your Perfect Matches!" heading
   - Loading spinner → recommendations grid

3. **Summary Trigger (Deck Exhausted)**
   - Swipe through all remaining recipes (even if < 15)
   - Expected: Summary screen appears

4. **Recommendations Display**
   - Summary screen shows up to 10 recommended recipes
   - Each card displays: image, title, time, servings
   - Click a recipe → navigates to `/recipes/{slug}`

5. **Summary Actions**
   - "Swipe More Recipes" button → resets session, fetches new candidates
   - "View Saved Recipes" button → navigates to `/account`

---

## 📱 Cross-Device & Browser Testing

### Mobile Devices

- [ ] **iOS Safari** (iPhone)
  - Touch gestures smooth and responsive
  - Card animations perform well (no lag)
  - Flip animation works correctly
  - Text and images scale properly

- [ ] **Android Chrome**
  - All swipe gestures functional
  - No visual glitches on card transitions

- [ ] **Mobile Landscape Orientation**
  - Layout remains usable
  - Cards don't overflow

### Desktop Browsers

- [ ] **Chrome** (Windows/Mac)
  - Mouse drag works
  - Keyboard arrows functional
  - Animations smooth

- [ ] **Firefox**
  - No layout issues
  - 3D flip animation renders correctly

- [ ] **Safari** (Mac)
  - All interactions work
  - Gradient backgrounds render

- [ ] **Edge**
  - Full functionality

### Tablet

- [ ] **iPad** (Safari)
  - Touch and swipe work
  - Layout adapts (not squished)

---

## 🐛 Edge Cases & Error Handling

1. **Network Failure During Load**
   - Disconnect internet, navigate to `/swipe`
   - Expected: Error message, "Try Again" button

2. **Network Failure During Swipe**
   - Start swiping, disconnect internet mid-session
   - Expected: Swipes still animate (optimistic), but preference may not save
   - Verify: No crashes or freezes

3. **Very Fast Swiping**
   - Swipe rapidly (multiple swipes per second)
   - Expected: No duplicates recorded, no UI glitches

4. **Multiple Browser Tabs**
   - Open `/swipe` in two tabs
   - Swipe in tab 1, then switch to tab 2
   - Expected: Tab 2 may show stale candidates (acceptable), but no crashes

5. **Session Timeout**
   - Stay on `/swipe` for a long time (simulate session expiry)
   - Try to swipe
   - Expected: 401 error handled gracefully (redirect to login or show message)

6. **Pro Recipe for Non-Pro User**
   - Ensure a Pro recipe does NOT appear in candidates for free users
   - (Already tested in API, but verify in UI too)

---

## ✅ Acceptance Criteria Checklist

- [ ] Database migration applied successfully
- [ ] All three API endpoints return correct responses
- [ ] Unauthenticated users redirected to login
- [ ] Cards display all required information (image, title, time, servings)
- [ ] Card flip animation works for nutrition info
- [ ] Swipe gestures (left, right, up) work on mobile and desktop
- [ ] Button clicks (X, heart, skip) work correctly
- [ ] Keyboard shortcuts (arrows) work on desktop
- [ ] Liked recipes automatically added to favorites
- [ ] Already-swiped recipes excluded from future candidates
- [ ] Summary screen appears after 15 swipes or deck exhausted
- [ ] Recommendations are personalized based on likes
- [ ] Navigation links work (header, homepage CTA)
- [ ] No console errors or warnings
- [ ] Smooth animations and transitions
- [ ] Responsive on mobile, tablet, and desktop
- [ ] Works across major browsers (Chrome, Safari, Firefox, Edge)

---

## 🚀 Post-Launch Monitoring

After deployment, monitor:
1. **Analytics**: Track swipe session completion rate
2. **User Feedback**: Monitor for UX issues or confusion
3. **Performance**: Check API response times for candidates/recommendations
4. **Database**: Ensure no duplicate swipes due to race conditions
5. **Error Logs**: Watch for 500 errors in swipe APIs

---

## 📝 Known Limitations (V1)

- Recommendations algorithm is basic (tag-based). Future versions can use ML.
- No undo/rewind feature (users can't go back to previous card).
- Session size is fixed at 15 swipes (could be made configurable).
- No filtering options in swipe mode (e.g., "only vegetarian").

---

## 🔧 Troubleshooting

**Issue**: Cards not appearing
- Check: Migration applied? Recipes have `views >= 10`?

**Issue**: Swipe not recording
- Check: User authenticated? Network tab shows 401?

**Issue**: No recommendations
- Check: Has user liked at least one recipe?

**Issue**: Flip animation not working
- Check: Browser supports CSS 3D transforms? (Safari/Chrome should)

---

**Testing completed by**: _______________  
**Date**: _______________  
**Build/Version**: _______________
