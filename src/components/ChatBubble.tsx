import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "./ui/button";
import { ChefHat } from "lucide-react";
import { Recipe } from "@/types/recipe";
import { useState, useEffect } from "react";
import { generateRecipeImage } from "@/lib/recipeImageService";

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
  const extractRecipe = (text: string): { recipe: Recipe | null; cleanText: string; parseStatus: string } => {
    console.log('[ChatBubble] Extracting recipe from message, length:', text.length);
    
    // Try multiple regex patterns for resilience
    const patterns = [
      /```recipe-json\s*\n([\s\S]*?)\n```/,  // Standard format
      /```recipe-json\s*([\s\S]*?)```/,       // No newlines
      /```recipe-json([\s\S]*?)```/,          // Minimal whitespace
    ];
    
    let recipe: Recipe | null = null;
    let parseStatus = 'no-recipe-block';
    let recipeMatch = null;
    
    for (const pattern of patterns) {
      recipeMatch = text.match(pattern);
      if (recipeMatch) {
        parseStatus = 'recipe-block-found';
        break;
      }
    }
    
    if (recipeMatch) {
      const jsonText = recipeMatch[1].trim();
      console.log('[ChatBubble] Found recipe-json block, length:', jsonText.length);
      console.log('[ChatBubble] JSON preview:', jsonText.substring(0, 200));
      
      try {
        recipe = JSON.parse(jsonText) as Recipe;
        console.log('[ChatBubble] Successfully parsed recipe:', recipe.title);
        parseStatus = 'success';
        
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
        console.error('[ChatBubble] JSON parse failed:', e);
        console.error('[ChatBubble] JSON text was:', jsonText.substring(0, 500));
        parseStatus = 'parse-error';
        
        // Try to extract partial data for debugging
        try {
          const partial = jsonText.match(/"title":\s*"([^"]+)"/);
          if (partial) {
            console.log('[ChatBubble] Found partial title:', partial[1]);
          }
        } catch {}
      }
    } else {
      // Check if recipe block is being streamed (incomplete)
      if (text.includes('```recipe-json')) {
        console.log('[ChatBubble] Recipe block detected but incomplete (still streaming)');
        parseStatus = 'streaming';
      } else {
        console.log('[ChatBubble] No recipe-json block found in message');
      }
    }
    
    // Remove recipe-json blocks from display text
    let cleanText = text.replace(/```recipe-json[\s\S]*?```/g, '').trim();
    // Also remove incomplete blocks that might be streaming
    cleanText = cleanText.replace(/```recipe-json[\s\S]*$/g, '').trim();
    
    return { recipe, cleanText, parseStatus };
  };

  const { recipe, cleanText, parseStatus } = extractRecipe(message);
  const displayMessage = cleanText || message;
  const [imageRequested, setImageRequested] = useState(false);

  // Trigger background image generation only once per unique recipe
  useEffect(() => {
    if (recipe && recipe.title && onViewRecipe && !imageRequested && !recipe.imageUrl) {
      console.log('[ChatBubble] Requesting image generation for:', recipe.title);
      setImageRequested(true);
      
      generateRecipeImage(recipe.title, recipe.id)
        .then(result => {
          if (result.imageUrl && recipe) {
            recipe.imageUrl = result.imageUrl;
            console.log('[ChatBubble] Image URL received:', result.imageUrl);
          }
        })
        .catch(err => {
          console.error("Failed to generate recipe image:", err);
          setImageRequested(false); // Allow retry on error
        });
    }
  }, [recipe?.id, recipe?.title, onViewRecipe, imageRequested]);

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
          "transition-standard",
          isUser
            ? "max-w-[85%] rounded-xl px-5 py-4 shadow-refined bg-primary text-primary-foreground"
            : "w-full max-w-2xl px-0 py-0 bg-transparent text-foreground"
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
      
      {parseStatus === 'parse-error' && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          Recipe data was malformed. This may be temporary. Try asking again or rephrase your request.
        </div>
      )}
      
      {parseStatus === 'streaming' && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          Recipe is being generated... (recipe data is still loading)
        </div>
      )}
      
      <span className="text-xs text-muted-foreground mt-1.5 px-1 opacity-60">
        {formatTime(timestamp)}
      </span>
    </div>
  );
};

export default ChatBubble;
