import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "./ui/button";
import { ChefHat } from "lucide-react";
import { Recipe } from "@/types/recipe";
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
  const extractRecipe = (text: string): { recipe: Recipe | null; cleanText: string } => {
    // First, remove any recipe-json blocks (even incomplete ones during streaming)
    let cleanText = text.replace(/```recipe-json[\s\S]*?```/g, '').trim();
    // Also remove incomplete blocks that might be streaming
    cleanText = cleanText.replace(/```recipe-json[\s\S]*$/g, '').trim();
    
    // Try to parse complete recipe blocks
    const recipeMatch = text.match(/```recipe-json\n([\s\S]*?)\n```/);
    if (recipeMatch) {
      try {
        const recipe = JSON.parse(recipeMatch[1]) as Recipe;
        return { recipe, cleanText };
      } catch (e) {
        console.error('Failed to parse recipe:', e);
      }
    }
    return { recipe: null, cleanText };
  };

  const { recipe, cleanText } = extractRecipe(message);
  const displayMessage = cleanText || message;
  const [recipeImageUrl, setRecipeImageUrl] = useState<string | undefined>(
    () => recipe?.imageUrl
  );

  const hasRecipe = Boolean(recipe);
  const recipeId = recipe?.id;
  const recipeImage = recipe?.imageUrl;

  useEffect(() => {
    if (!hasRecipe) {
      setRecipeImageUrl(undefined);
      return;
    }

    setRecipeImageUrl(recipeImage);
  }, [hasRecipe, recipeId, recipeImage]);

  useEffect(() => {
    if (!recipe?.title) {
      return;
    }

    if (recipe.imageUrl || recipeImageUrl) {
      return;
    }

    let isCancelled = false;

    const fetchRecipeImage = async () => {
      try {
        const result = await generateRecipeImage(recipe.title, recipe.id);
        if (!isCancelled && result.imageUrl) {
          setRecipeImageUrl(result.imageUrl);
        }
      } catch (err) {
        console.error("Failed to generate recipe image:", err);
      }
    };

    fetchRecipeImage();

    return () => {
      isCancelled = true;
    };
  }, [recipe?.id, recipe?.title, recipe?.imageUrl, recipeImageUrl]);

  const recipeForView = recipe
    ? {
        ...recipe,
        imageUrl: recipeImageUrl ?? recipe.imageUrl,
      }
    : null;

  return (
    <div 
      className={cn(
        "flex flex-col animate-fade-in",
        isUser ? "items-end" : "items-start"
      )}
    >
      {recipeForView && onViewRecipe && (
        <Button
          onClick={() => onViewRecipe(recipeForView)}
          className="mb-3"
          size="sm"
        >
          <ChefHat className="w-4 h-4 mr-2" />
          View Recipe
        </Button>
      )}
      
      <div
        className={cn(
          "max-w-full rounded-2xl px-6 py-5 shadow-refined transition-standard md:max-w-[80%]",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground"
        )}
      >
        {isUser ? (
          <p className="text-base leading-relaxed whitespace-pre-wrap break-words sm:text-lg">
            {displayMessage}
          </p>
        ) : (
          <div className="culinary-markdown text-[1.05rem] leading-[1.7] tracking-[0.01em]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {displayMessage}
            </ReactMarkdown>
          </div>
        )}
      </div>
      
      {recipeForView && onViewRecipe && (
        <Button
          onClick={() => onViewRecipe(recipeForView)}
          className="mt-3"
          size="sm"
        >
          <ChefHat className="w-4 h-4 mr-2" />
          View Recipe
        </Button>
      )}
      
      <span className="mt-2 px-1 text-xs font-light text-muted-foreground/80">
        {formatTime(timestamp)}
      </span>
    </div>
  );
};

export default ChatBubble;
