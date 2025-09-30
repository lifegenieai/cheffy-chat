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
    const recipeMatch = text.match(/```recipe-json\n([\s\S]*?)\n```/);
    if (recipeMatch) {
      try {
        const recipe = JSON.parse(recipeMatch[1]) as Recipe;
        const cleanText = text.replace(/```recipe-json\n[\s\S]*?\n```/, '').trim();
        return { recipe, cleanText };
      } catch (e) {
        console.error('Failed to parse recipe:', e);
      }
    }
    return { recipe: null, cleanText: text };
  };

  const { recipe, cleanText } = extractRecipe(message);
  const displayMessage = cleanText || message;

  return (
    <div 
      className={cn(
        "flex flex-col animate-fade-in",
        isUser ? "items-end" : "items-start"
      )}
    >
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
          className="mt-3 ml-auto"
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
