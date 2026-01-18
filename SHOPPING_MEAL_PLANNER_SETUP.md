# Shopping List & Meal Planner Setup

## Database Migration

You need to run the new migration in Supabase to create the `shopping_lists` and `meal_plans` tables.

### Steps:

1. **Go to your Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and paste the migration SQL**
   - Open `supabase/migrations/002_shopping_and_meal_plans.sql`
   - Copy ALL the contents
   - Paste into the Supabase SQL Editor

4. **Run the migration**
   - Click "Run" (or press Ctrl+Enter / Cmd+Enter)
   - You should see: "Success. No rows returned"

5. **Verify tables were created**
   - Go to "Table Editor" in the left sidebar
   - You should now see:
     - `shopping_lists`
     - `meal_plans`

---

## Testing Checklist

### Basic Shopping List Tests:
- [ ] Visit `/shopping-list` as a logged-out user → Should show sign-in prompt
- [ ] Visit `/shopping-list` as a free user → Should show Pro upgrade prompt
- [ ] (For testing) Temporarily create a Pro subscription in Supabase:
  ```sql
  -- Run this in Supabase SQL Editor (replace YOUR_USER_ID)
  INSERT INTO subscriptions (user_id, status, current_period_end)
  VALUES ('YOUR_USER_ID', 'active', NOW() + INTERVAL '30 days');
  ```
- [ ] Visit `/shopping-list` as a Pro user → Should see Shopping Lists tab
- [ ] Create a new shopping list
- [ ] Add custom items to the list
- [ ] Check off items
- [ ] Clear checked items
- [ ] Delete a list

### Recipe Integration Tests:
- [ ] Go to any recipe detail page
- [ ] Click "Add to Shopping List" button
- [ ] Add ingredients to existing list
- [ ] Create new list from recipe
- [ ] Verify ingredients appear in shopping list with recipe name
- [ ] Click "View Recipe" link from shopping list

### Meal Planner Tests:
- [ ] Switch to "Meal Planner" tab
- [ ] Navigate between weeks (Previous/Next/Today)
- [ ] Add a recipe to a specific day/meal type
- [ ] Click recipe title → Should open recipe page
- [ ] Remove a meal from the calendar
- [ ] Add multiple meals to the same day

---

## Features Implemented ✅

### Shopping Lists:
- ✅ Multiple shopping lists per user
- ✅ Add/remove/check items
- ✅ Add custom items manually
- ✅ Add recipe ingredients with one click
- ✅ Grouped by recipe
- ✅ Link back to recipes
- ✅ Clear checked items
- ✅ Pro-only feature with upgrade prompt

### Meal Planner:
- ✅ Weekly calendar view
- ✅ Plan breakfast, lunch, dinner, snack
- ✅ Add/remove meals
- ✅ Navigate between weeks
- ✅ See current date highlighted
- ✅ Click through to recipes
- ✅ Pro-only feature

### UI/UX:
- ✅ Responsive design
- ✅ Clean Pro upgrade screen
- ✅ Tab navigation between features
- ✅ Loading states
- ✅ Confirmation dialogs
- ✅ Dropdown menus
- ✅ Modal forms

---

## Next Steps After Testing

Once you've tested everything:
1. Commit and push your changes to GitHub
2. Deploy to Vercel (should auto-deploy from main branch)
3. The new features will be live!

**Note:** Make sure to remove any test Pro subscriptions after testing:
```sql
-- Clean up test subscriptions
DELETE FROM subscriptions WHERE user_id = 'YOUR_USER_ID';
```
