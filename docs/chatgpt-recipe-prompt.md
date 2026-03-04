# ChatGPT Recipe Format Prompt

Copy the prompt below and paste it into ChatGPT. Use it as a Custom Instruction, or paste it before asking for a recipe. ChatGPT will then output recipes in the exact format our Paste & Parse feature expects.

---

## The Prompt (copy everything below)

```
When you give me a recipe, format it EXACTLY like this template. Follow the structure precisely so I can paste it directly into my recipe app:

[Recipe Title]

[1-2 sentence description of the dish. Example: "Crispy mini pizzas with spiced chicken filling on a soft semolina base. Perfect for parties or a fun family dinner."]

Ingredients:

[ingredient 1 - include quantity and unit, e.g. "315 ml lukewarm milk"]
[ingredient 2]
[ingredient 3]
[one ingredient per line - bullets or numbers are fine]

Instructions:

[step 1 - full sentence]
[step 2]
[step 3]
[one step per line - numbered or bulleted is fine]

Prep: [X] min | Cook: [X] min
Serves: [number]
Difficulty: Easy
Tags: [tag1, tag2, tag3, tag4]

Nutrition (per serving):
Calories: [number]
Protein (g): [number]
Carbohydrates (g): [number]
Fat (g): [number]
Fiber (g): [number]
Sugar (g): [number]
Sodium (mg): [number]
Cholesterol (mg): [number]

RULES:
- Use "Ingredients:" and "Instructions:" as the exact section headers (with colon).
- One ingredient per line. One step per line.
- Include the description between title and Ingredients.
- Put Prep, Cook, Serves, Difficulty, and Tags on separate lines after Instructions.
- Use "Nutrition (per serving):" as the nutrition header.
- Difficulty must be exactly: Easy, Medium, or Hard.
- Include nutrition values when you can estimate them; use 0 if unknown.
- Use metric (g, ml) or imperial (cups, tbsp) - both work.
```

---

## How to Use

1. **As a one-time instruction:** Paste the prompt above, then add: "Now give me a [recipe name] recipe."
2. **As a Custom Instruction (ChatGPT Plus):** Add it to your ChatGPT Custom Instructions so all recipe requests use this format.
3. **To convert existing recipes:** Paste the prompt, then: "Convert this recipe to that format: [paste recipe]."

---

## Example Output

```
Creamy Spiced Chicken Semolina Mini Pizzas

Crispy mini pizzas with spiced chicken filling on a soft semolina base. Perfect for parties or a fun family dinner.

Ingredients:

315 ml lukewarm milk
2 tsp instant yeast
1 tbsp honey
150 g semolina (plus extra for dusting)
350 g all-purpose flour
...

Instructions:

Mix lukewarm milk, yeast, and honey in a bowl and let it rest for 5 minutes until slightly foamy.
Add semolina, flour, butter, and salt and knead the dough for about 10–12 minutes until smooth and elastic.
...

Prep: 30 min | Cook: 18 min
Serves: 9
Difficulty: Medium
Tags: chicken, pizza, semolina, mini pizzas, savory baking, comfort food

Nutrition (per serving):
Calories: 330
Protein (g): 18
Carbohydrates (g): 30
Fat (g): 15
Fiber (g): 2
Sugar (g): 4
Sodium (mg): 420
Cholesterol (mg): 55
```
