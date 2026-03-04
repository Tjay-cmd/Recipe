/**
 * Rule-based recipe parser - extracts structured data from pasted recipe text.
 * Handles common formats: "Ingredients:", "Instructions:", etc.
 */

export interface ParsedRecipe {
  title: string
  description: string
  ingredients: string[]
  steps: string[]
  prep_minutes: number
  cook_minutes: number
  servings: number
  difficulty: 'Easy' | 'Medium' | 'Hard' | ''
  tags: string
  calories: string
  protein_g: string
  carbs_g: string
  fat_g: string
  fiber_g: string
  sugar_g: string
  sodium_mg: string
  cholesterol_mg: string
}

// Section headers - order matters for matching
const INGREDIENT_HEADERS = [
  /^ingredients?\s*:?\s*$/i,
  /^what you(?:'ll)? need\s*:?\s*$/i,
  /^you(?:'ll)? need\s*:?\s*$/i,
  /^for the [\w\s]+:\s*$/i, // "For the sauce:"
]

const STEP_HEADERS = [
  /^instructions?\s*:?\s*$/i,
  /^directions?\s*:?\s*$/i,
  /^steps?\s*:?\s*$/i,
  /^method\s*:?\s*$/i,
  /^how to make\s*:?\s*$/i,
  /^preparation\s*:?\s*$/i,
  /^procedure\s*:?\s*$/i,
]

const NUTRITION_HEADERS = [
  /^nutrition(?:al)?\s*(?:info(?:rmation)?)?\s*:?\s*$/i,
  /^nutrition\s*\([^)]*\)\s*:?\s*$/i, // "Nutrition (per serving):"
  /^per serving\s*:?\s*$/i,
]

function cleanLine(line: string): string {
  return line
    .replace(/^[•\-\*]\s*/, '')
    .replace(/^\d+[\.)]\s*/, '')
    .replace(/^[a-z]\)\s*/i, '')
    .trim()
}

function isSectionHeader(line: string, patterns: RegExp[]): boolean {
  const trimmed = line.trim()
  return patterns.some((p) => p.test(trimmed))
}

function parseListBlock(text: string): string[] {
  return text
    .split('\n')
    .map((line) => cleanLine(line))
    .filter((line) => line.length > 0)
}

// Metadata lines that appear after steps - exclude from steps list
const METADATA_PATTERNS = [
  /^prep(?:aration)?\s*(?:time)?\s*:/i,
  /^cook(?:ing)?\s*(?:time)?\s*:/i,
  /^serves?\s*:/i,
  /^yield\s*:/i,
  /^makes?\s*:/i,
  /^difficulty\s*:/i,
  /^tags?\s*:/i,
  /^nutrition/i,
  /^per serving\s*:/i,
]

function isMetadataLine(line: string): boolean {
  return METADATA_PATTERNS.some((p) => p.test(line.trim()))
}

function parseStepsBlock(text: string): string[] {
  const lines = text
    .split('\n')
    .map((line) => cleanLine(line))
    .filter((line) => line.length > 0)
    .filter((line) => !isMetadataLine(line))
  return lines
}

function parseNutritionBlock(text: string): Partial<ParsedRecipe> {
  const result: Partial<ParsedRecipe> = {}
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)

  lines.forEach((line) => {
    const match = line.match(/^(.+?)[:\-\=]\s*(.+)$/i)
    if (!match) return

    const fieldName = match[1].trim().toLowerCase()
    const value = match[2].trim()
    const numMatch = value.match(/[\d.]+/)
    if (!numMatch) return

    const numValue = numMatch[0]
    if (fieldName.includes('calorie')) result.calories = numValue
    else if (fieldName.includes('protein')) result.protein_g = numValue
    else if (fieldName.includes('carbohydrate') || fieldName.includes('carb'))
      result.carbs_g = numValue
    else if (fieldName.includes('fat') && !fieldName.includes('saturated'))
      result.fat_g = numValue
    else if (fieldName.includes('fiber')) result.fiber_g = numValue
    else if (fieldName.includes('sugar')) result.sugar_g = numValue
    else if (fieldName.includes('sodium')) result.sodium_mg = numValue
    else if (fieldName.includes('cholesterol')) result.cholesterol_mg = numValue
  })

  return result
}

function extractTimeMinutes(text: string): number {
  // "15 min", "15 mins", "15 minutes", "1 hour", "1 hr", "1h 30m"
  const lower = text.toLowerCase()
  let total = 0

  const hourMatch = lower.match(/(\d+)\s*(?:hour|hr|h)(?:\s|$)/)
  if (hourMatch) total += parseInt(hourMatch[1], 10) * 60

  const minMatch = lower.match(/(\d+)\s*(?:minute|min|mins|m)(?:\s|$)/)
  if (minMatch) total += parseInt(minMatch[1], 10)

  return total
}

function extractPrepCookTime(fullText: string): { prep: number; cook: number } {
  let prep = 0
  let cook = 0

  const prepMatch = fullText.match(
    /prep(?:aration)?\s*(?:time)?\s*:?\s*([\d\s\w]+?)(?:\s*[|\-]|cook|$)/gim
  )
  if (prepMatch) {
    prep = Math.max(...prepMatch.map((m) => extractTimeMinutes(m)))
  }

  const cookMatch = fullText.match(
    /cook(?:ing)?\s*(?:time)?\s*:?\s*([\d\s\w]+?)(?:\s*[|\-]|total|$)/gim
  )
  if (cookMatch) {
    cook = Math.max(...cookMatch.map((m) => extractTimeMinutes(m)))
  }

  // Fallback: "Prep: 15 min | Cook: 30 min" on same line
  if (cook === 0) {
    const cookInline = fullText.match(/cook\s*:?\s*(\d+)\s*(?:min|minute|mins?)\b/i)
    if (cookInline) cook = parseInt(cookInline[1], 10)
  }
  if (prep === 0 && cook === 0) {
    const combined = fullText.match(/(\d+)\s*(?:min|minute)[^.]*?(\d+)\s*(?:min|minute)/i)
    if (combined) {
      prep = parseInt(combined[1], 10)
      cook = parseInt(combined[2], 10)
    }
  }

  return { prep, cook }
}

function extractServings(text: string): number {
  // "Serves 4", "4 servings", "Yield: 4", "Makes 4"
  const serveMatch = text.match(/(?:serves?|yield|makes?)\s*:?\s*(\d+)/i)
  if (serveMatch) return parseInt(serveMatch[1], 10)

  const numMatch = text.match(/(\d+)\s*servings?/i)
  if (numMatch) return parseInt(numMatch[1], 10)

  return 1
}

function extractDifficulty(text: string): 'Easy' | 'Medium' | 'Hard' | '' {
  const lower = text.toLowerCase()
  if (/\beasy\b/.test(lower)) return 'Easy'
  if (/\bmedium\b/.test(lower) || /\bmoderate\b/.test(lower)) return 'Medium'
  if (/\bhard\b/.test(lower) || /\bdifficult\b/.test(lower)) return 'Hard'
  return ''
}

function extractTags(text: string): string {
  // Look for common tag patterns: "Tags: Airfryer, High Protein" or keywords
  const tagMatch = text.match(/(?:tags?|keywords?|categories?)\s*:?\s*([^\n]+)/i)
  if (tagMatch) {
    return tagMatch[1]
      .split(/[,;|]/)
      .map((t) => t.trim())
      .filter(Boolean)
      .join(', ')
  }
  return ''
}

export function parseRecipeText(raw: string): ParsedRecipe {
  const normalized = raw.replace(/\r\n/g, '\n').trim()
  const lines = normalized.split('\n')

  const result: ParsedRecipe = {
    title: '',
    description: '',
    ingredients: [],
    steps: [],
    prep_minutes: 0,
    cook_minutes: 0,
    servings: 1,
    difficulty: '',
    tags: '',
    calories: '',
    protein_g: '',
    carbs_g: '',
    fat_g: '',
    fiber_g: '',
    sugar_g: '',
    sodium_mg: '',
    cholesterol_mg: '',
  }

  // Find section indices
  let ingredientsStart = -1
  let stepsStart = -1
  let nutritionStart = -1

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (isSectionHeader(line, INGREDIENT_HEADERS)) ingredientsStart = i
    else if (isSectionHeader(line, STEP_HEADERS)) stepsStart = i
    else if (isSectionHeader(line, NUTRITION_HEADERS)) nutritionStart = i
  }

  // Extract title (first non-empty line that isn't a section header)
  const titleEnd = ingredientsStart >= 0 ? ingredientsStart : stepsStart >= 0 ? stepsStart : lines.length
  const headerLines = lines.slice(0, titleEnd)
  for (const line of headerLines) {
    const trimmed = line.trim()
    if (trimmed.length > 0 && !isSectionHeader(line, INGREDIENT_HEADERS) && !isSectionHeader(line, STEP_HEADERS)) {
      result.title = trimmed
      break
    }
  }
  if (!result.title) result.title = 'Untitled Recipe'

  // Description: lines between title and ingredients (skip title line)
  const titleLineIdx = headerLines.findIndex(
    (l) => l.trim() === result.title || (l.trim().length > 0 && !isSectionHeader(l, INGREDIENT_HEADERS))
  )
  if (ingredientsStart > 0 && titleLineIdx >= 0 && ingredientsStart > titleLineIdx + 1) {
    result.description = lines
      .slice(titleLineIdx + 1, ingredientsStart)
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !isSectionHeader(l, INGREDIENT_HEADERS))
      .join('\n\n')
  }

  // Ingredients
  const ingredientsEnd = stepsStart >= 0 ? stepsStart : nutritionStart >= 0 ? nutritionStart : lines.length
  if (ingredientsStart >= 0) {
    const block = lines.slice(ingredientsStart + 1, ingredientsEnd).join('\n')
    result.ingredients = parseListBlock(block)
  } else if (stepsStart < 0) {
    // No clear sections - try to split: first half as ingredients, second half as steps
    const mid = Math.floor(lines.length / 2)
    result.ingredients = parseListBlock(lines.slice(0, mid).join('\n'))
    result.steps = parseListBlock(lines.slice(mid).join('\n'))
  }

  // Steps (use parseStepsBlock to exclude metadata lines like Prep:, Serves:, etc.)
  const stepsEnd = nutritionStart >= 0 ? nutritionStart : lines.length
  if (stepsStart >= 0) {
    const block = lines.slice(stepsStart + 1, stepsEnd).join('\n')
    result.steps = parseStepsBlock(block)
  } else if (ingredientsStart >= 0) {
    // Ingredients found but no steps header - steps are after ingredients
    result.steps = parseStepsBlock(lines.slice(ingredientsEnd).join('\n'))
  }

  // If we still have no steps, use remaining lines after ingredients
  if (result.steps.length === 0 && result.ingredients.length > 0) {
    const afterIng = ingredientsStart >= 0 ? ingredientsStart + 1 : 0
    result.steps = parseStepsBlock(lines.slice(afterIng).join('\n'))
  }

  // Nutrition
  if (nutritionStart >= 0) {
    const nutritionBlock = lines.slice(nutritionStart + 1).join('\n')
    Object.assign(result, parseNutritionBlock(nutritionBlock))
  }

  // Metadata from full text
  const { prep, cook } = extractPrepCookTime(normalized)
  if (prep > 0) result.prep_minutes = prep
  if (cook > 0) result.cook_minutes = cook

  const servings = extractServings(normalized)
  if (servings > 1) result.servings = servings

  const difficulty = extractDifficulty(normalized)
  if (difficulty) result.difficulty = difficulty

  const tags = extractTags(normalized)
  if (tags) result.tags = tags

  // Description fallback: if no description, use first step (truncated)
  if (!result.description && result.steps.length > 0) {
    const firstStep = result.steps[0]
    result.description = firstStep.length > 250 ? firstStep.slice(0, 247) + '...' : firstStep
  }

  return result
}
