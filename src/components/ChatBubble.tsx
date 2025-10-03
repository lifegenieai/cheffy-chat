import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "./ui/button";
import { ChefHat } from "lucide-react";
import { Recipe } from "@/types/recipe";

interface ChatBubbleProps {
  message: string;
  role: "user" | "assistant";
  timestamp: Date;
  onViewRecipe?: (recipe: Recipe) => void;
}

const ChatBubble = ({ message, role, timestamp, onViewRecipe }: ChatBubbleProps) => {
  const isUser = role === "user";
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Extract recipe JSON if present (wrapped in ```recipe-json ... ```)
  const extractRecipe = (text: string): { recipe: Recipe | null; cleanText: string } => {
    console.log('[ChatBubble] Extracting recipe from message, length:', text.length);
    
    // Try to find complete recipe-json block first
    const recipeMatch = text.match(/```recipe-json\s*\n([\s\S]*?)\n```/);
    
    let recipe: Recipe | null = null;
    if (recipeMatch) {
      const jsonText = recipeMatch[1].trim();
      console.log('[ChatBubble] Found recipe-json block, attempting to parse...');
      
      try {
        recipe = JSON.parse(jsonText) as Recipe;
        console.log('[ChatBubble] Successfully parsed recipe:', recipe.title);
        
        // Validate required fields and provide defaults
        if (!recipe.id) recipe.id = `recipe-${Date.now()}`;
        if (!recipe.title) recipe.title = "Untitled Recipe";
        if (!recipe.category) recipe.category = "Main Dishes";
        if (!recipe.servings) recipe.servings = 4;
        if (!recipe.difficulty) recipe.difficulty = "medium";
        if (!recipe.ingredients) recipe.ingredients = [];
        if (!recipe.instructions) recipe.instructions = [];
        if (!recipe.tips) recipe.tips = [];
        if (!recipe.equipment) recipe.equipment = [];
        if (!recipe.createdAt) recipe.createdAt = new Date().toISOString();
        
        // Ensure nutrition object exists with proper types
        if (!recipe.nutrition) {
          recipe.nutrition = {
            calories: "N/A" as any,
            totalFat: "N/A" as any,
            saturatedFat: "N/A" as any,
            cholesterol: "N/A" as any,
            sodium: "N/A" as any,
            totalCarbohydrates: "N/A" as any,
            dietaryFiber: "N/A" as any,
            sugars: "N/A" as any,
            protein: "N/A" as any,
          };
        }
      } catch (e) {
        console.error('[ChatBubble] Failed to parse recipe JSON:', e);
        console.error('[ChatBubble] JSON text was:', jsonText.substring(0, 200));
        // Return null recipe but keep the text for display
      }
    } else {
      console.log('[ChatBubble] No complete recipe-json block found');
    }
    
    // Remove recipe-json blocks from display text
    let cleanText = text.replace(/```recipe-json[\s\S]*?```/g, '').trim();
    // Also remove incomplete blocks that might be streaming
    cleanText = cleanText.replace(/```recipe-json[\s\S]*$/g, '').trim();
    
    return { recipe, cleanText };
  };

  const { recipe, cleanText } = extractRecipe(message);
  const displayMessage = cleanText || message;

  // Trigger image generation in background when recipe is extracted
  if (recipe && recipe.title && onViewRecipe) {
    import("@/lib/recipeImageService").then(({ generateRecipeImage }) => {
      generateRecipeImage(recipe.title, recipe.id)
        .then(result => {
          if (result.imageUrl && recipe) {
            // Update recipe with image URL
            recipe.imageUrl = result.imageUrl;
          }
        })
        .catch(err => console.error("Failed to generate recipe image:", err));
    });
  }

  return (
    <div 
      className={cn(
        "flex flex-col animate-fade-in",
        isUser ? "items-end" : "items-start"
      )}
    >
      {recipe && onViewRecipe && (
        <Button
          onClick={() => onViewRecipe(recipe)}
          className="mb-3"
          size="sm"
        >
          <ChefHat className="w-4 h-4 mr-2" />
          View Recipe
        </Button>
      )}
      
      <div
        className={cn(
          "max-w-[85%] rounded-xl px-5 py-4 shadow-refined transition-standard",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-secondary text-secondary-foreground"
        )}
      >
        {isUser ? (
          <p className="text-base leading-relaxed whitespace-pre-wrap break-words">
            {displayMessage}
          </p>
        ) : (
          <div className="culinary-markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {displayMessage}
            </ReactMarkdown>
          </div>
        )}
      </div>
      
      {recipe && onViewRecipe && (
        <Button
          onClick={() => onViewRecipe(recipe)}
          className="mt-3"
          size="sm"
        >
          <ChefHat className="w-4 h-4 mr-2" />
          View Recipe
        </Button>
      )}
      
      <span className="text-xs text-muted-foreground mt-1.5 px-1 opacity-60">
        {formatTime(timestamp)}
      </span>
    </div>
  );
};

export default ChatBubble;
