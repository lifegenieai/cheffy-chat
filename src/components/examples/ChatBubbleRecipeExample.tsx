import { useState } from "react";
import ChatBubble from "../ChatBubble";
import type { Recipe } from "@/types/recipe";

const buildRecipeMessage = (fence: "recipe-json" | "json", recipe: Recipe) => {
  const json = JSON.stringify(recipe, null, 2);
  return [
    "Here is a delicious idea for you!",
    "",
    `\u0060\u0060\u0060${fence}`,
    json,
    "```",
  ].join("\n");
};

const exampleRecipe: Recipe = {
  id: "example-recipe",
  title: "Golden Saffron Risotto",
  category: "Main Dishes",
  servings: 4,
  difficulty: "medium",
  prepTime: "15 minutes",
  cookTime: "30 minutes",
  totalTime: "45 minutes",
  introduction:
    "A silky risotto infused with saffron and finished with parmesan for an elegant supper.",
  tips: ["Warm your stock before adding it to the rice.", "Stir frequently for the creamiest texture."],
  equipment: ["Heavy-bottomed saucepan", "Wooden spoon", "Ladle"],
  ingredients: [
    { name: "Arborio rice", weightGrams: 320 },
    { name: "Vegetable stock", volume: "1.5 L", notes: "kept warm" },
    { name: "Saffron threads", notes: "soaked in warm stock" },
    { name: "Parmesan cheese", weightGrams: 60 },
    { name: "Unsalted butter", weightGrams: 50 },
    { name: "Dry white wine", volume: "120 ml" },
    { name: "Shallots", weightGrams: 80 },
  ],
  instructions: [
    {
      stepNumber: 1,
      description: "Sweat the shallots in butter until translucent, then stir in the rice until glossy.",
    },
    {
      stepNumber: 2,
      description: "Deglaze with wine, then add stock a ladle at a time, stirring until absorbed.",
    },
    {
      stepNumber: 3,
      description: "Infuse with saffron, finish with parmesan and remaining butter, and serve immediately.",
    },
  ],
  nutrition: {
    calories: 420,
    totalFat: 14,
    saturatedFat: 8,
    cholesterol: 30,
    sodium: 420,
    totalCarbohydrates: 58,
    dietaryFiber: 2,
    sugars: 3,
    protein: 12,
  },
  createdAt: "2024-01-01T12:00:00Z",
  advancedPreparation: ["Bloom the saffron in warm stock for 10 minutes."],
  nutritionNotes: "Nutrition values are approximate and per serving.",
  imageUrl: "https://images.example.com/risotto.jpg",
};

export const ChatBubbleRecipeExample = () => {
  const [lastRecipe, setLastRecipe] = useState<Recipe | null>(null);
  const timestamp = new Date();
  const recipeJsonMessage = buildRecipeMessage("json", exampleRecipe);
  const recipeFenceMessage = buildRecipeMessage("recipe-json", exampleRecipe);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        This example renders assistant chat bubbles with both <code>```recipe-json</code> and
        <code>```json</code> fences. The “View Recipe” button should appear for each block.
      </p>

      <ChatBubble
        message={recipeFenceMessage}
        role="assistant"
        timestamp={timestamp}
        onViewRecipe={setLastRecipe}
      />

      <ChatBubble
        message={recipeJsonMessage}
        role="assistant"
        timestamp={timestamp}
        onViewRecipe={setLastRecipe}
      />

      {lastRecipe && (
        <div className="rounded-lg border border-dashed bg-muted/40 p-4 text-sm">
          <h3 className="mb-2 font-semibold">Last recipe clicked</h3>
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap text-xs">
            {JSON.stringify(lastRecipe, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ChatBubbleRecipeExample;
