# Consolidated Shopping List - Smart Merging Update

## What Changed 🚀

### Before (Old Way):
```
Crispy Chicken Parmesan:
□ 6 large chicken breasts
□ Salt and black pepper (×3)
□ ½ cup all-purpose flour (×3)

Juicy Pulled Chicken Tacos:
□ 500 g chicken breasts or thighs
□ 1 tbsp olive oil
□ Salt and black pepper
```
❌ **Problems:**
- Duplicates across recipes
- Hard to know total amounts
- Must mentally add up chicken, salt, etc.

---

### After (New Way):
```
□ 3.50 kg chicken breasts
□ 1.50 cups flour
□ 4 tbsp olive oil
□ Salt and black pepper
```
✅ **Benefits:**
- **One consolidated list** (no recipe grouping)
- **Merged duplicates** (all chicken breast = one line)
- **Summed quantities** (500g + 3kg = 3.5kg)
- **Smart units** (1500ml → 1.5 L, 1500g → 1.5 kg)
- **Alphabetically sorted** for easy shopping
- **Clean and practical** for actual grocery shopping

---

## Smart Features Implemented 🧠

### 1. Ingredient Parsing
Recognizes patterns like:
- `2 cups flour`
- `500 g chicken`
- `1.5 kg beef`
- `2-3 onions` (takes first number)
- `2 whole chickens`

### 2. Unit Normalization
Converts variations to standard units:
- `cup`, `cups` → `cups`
- `g`, `gram`, `grams` → `g`
- `kg`, `kilogram` → `kg`
- `lb`, `lbs`, `pound`, `pounds` → `lbs`
- `ml`, `milliliter` → `ml`
- `L`, `liter`, `litre` → `L`
- `tbsp`, `tablespoon` → `tbsp`
- `tsp`, `teaspoon` → `tsp`

### 3. Smart Merging
- Groups by ingredient NAME + UNIT
- Example: "chicken breast (g)" vs "chicken breast (lbs)" stay separate
- Sums all quantities for matching items

### 4. Auto Unit Conversion
- 1500g → 1.5 kg
- 2000ml → 2 L
- 32 oz → 2 lbs
- Keeps smaller units when appropriate (500g stays 500g)

### 5. Clean Display
- Rounded decimals (3.5 kg, not 3.499999)
- Alphabetically sorted
- No recipe names cluttering the list

---

## Example Scenarios

### Scenario 1: Same Ingredient Different Meals
**Input:**
- Monday: Pasta (500g chicken breast)
- Wednesday: Stir-fry (1kg chicken breast)
- Friday: Salad (750g chicken breast)

**Output:**
```
□ 2.25 kg chicken breast
```

### Scenario 2: Unit Conversions
**Input:**
- Recipe 1: 1500ml milk
- Recipe 2: 750ml milk

**Output:**
```
□ 2.25 L milk
```

### Scenario 3: Mixed Units Stay Separate
**Input:**
- Recipe 1: 2 cups flour
- Recipe 2: 500g flour

**Output:**
```
□ 2 cups flour
□ 500 g flour
```
*(Different units = different items, as they shouldn't be merged)*

---

## Technical Implementation

### Key Functions:

1. **`parseIngredient()`**
   - Uses regex to extract quantity, unit, name
   - Handles ranges (2-3 → takes 2)
   - Fallback: treats as 1 whole item

2. **`normalizeUnit()`**
   - Maps all variations to standard form
   - Case-insensitive

3. **`convertToLargerUnit()`**
   - Auto-converts when makes sense
   - 1000g → 1kg, 1000ml → 1L

4. **Consolidation Logic**
   ```typescript
   const key = `${name.toLowerCase()}|${unit.toLowerCase()}`
   // Groups: "chicken breast|g", "onion|whole"
   consolidated[key].quantity += quantity
   ```

---

## Files Modified:
- ✅ `components/MealPlanner.tsx` - New parsing & merging logic
- ✅ `components/ShoppingList.tsx` - Supports both grouped & simple lists

---

## User Experience Flow:

1. **Plan meals** for the week (saved recipes only)
2. **Click "Generate Shopping List"**
3. **System:**
   - Parses all ingredients
   - Normalizes units
   - Merges duplicates
   - Sums quantities
   - Converts to larger units
   - Sorts alphabetically
4. **Result:** One clean, consolidated shopping list! 🛒

---

## Status:
- ✅ Implemented
- ✅ No linter errors
- ⏳ Ready to test
- ⏳ Not committed yet

## Next Test:
1. Plan multiple meals with overlapping ingredients
2. Click "Generate Shopping List"
3. Check Shopping Lists tab
4. Verify: **One clean list with merged quantities!** 🎉
