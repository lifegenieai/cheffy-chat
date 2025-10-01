import { Recipe } from "@/types/recipe";
import { RecipeHeader } from "./recipe/RecipeHeader";
import { RecipeMetadata } from "./recipe/RecipeMetadata";
import { RecipeIngredients } from "./recipe/RecipeIngredients";
import { RecipeInstructions } from "./recipe/RecipeInstructions";
import { RecipeNutrition } from "./recipe/RecipeNutrition";
import { Button } from "./ui/button";
import { Bookmark, Edit3, Check, Play } from "lucide-react";

interface RecipeCardProps {
  recipe: Recipe;
  onSave?: () => void;
  onModify?: () => void;
  isSaved?: boolean;
  isFromLibrary?: boolean;
  onOpenLibrary?: () => void;
}

export const RecipeCard = ({ recipe, onSave, onModify, isSaved = false, isFromLibrary = false, onOpenLibrary }: RecipeCardProps) => {
  const renderActionButtons = () => (
    <div className="flex gap-4 flex-wrap">
      {isFromLibrary ? (
        <Button 
          className="flex-1 min-w-[200px] h-12"
        >
          <Play className="w-4 h-4 mr-2" />
          Start Cooking
        </Button>
      ) : (
        <Button 
          onClick={isSaved ? onOpenLibrary : onSave}
          className="flex-1 min-w-[200px] h-12"
        >
          {isSaved ? (
            <>
              <Bookmark className="w-4 h-4 mr-2" />
              View in Library
            </>
          ) : (
            <>
              <Bookmark className="w-4 h-4 mr-2" />
              Save to Library
            </>
          )}
        </Button>
      )}
      <Button 
        onClick={onModify}
        variant="outline"
        className="flex-1 min-w-[200px] h-12"
      >
        <Edit3 className="w-4 h-4 mr-2" />
        Modify Recipe
      </Button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <RecipeHeader 
        title={recipe.title}
        difficulty={recipe.difficulty}
        servings={recipe.servings}
      />
      
      <div className="py-6 border-b border-border">
        {renderActionButtons()}
      </div>
      
      <RecipeMetadata 
        prepTime={recipe.prepTime}
        cookTime={recipe.cookTime}
        totalTime={recipe.totalTime}
      />
      
      {recipe.introduction && (
        <div className="py-6 border-b border-border">
          <p className="text-base text-foreground leading-relaxed">
            {recipe.introduction}
          </p>
          {recipe.historicalContext && (
            <p className="text-base text-muted-foreground leading-relaxed mt-4 italic">
              {recipe.historicalContext}
            </p>
          )}
        </div>
      )}
      
      {recipe.equipment.length > 0 && (
        <div className="py-6 border-b border-border">
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
            Equipment Needed
          </h2>
          <ul className="space-y-2">
            {recipe.equipment.map((item, index) => (
              <li key={index} className="text-base text-foreground flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {recipe.advancedPreparation && recipe.advancedPreparation.length > 0 && (
        <div className="py-6 border-b border-border">
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
            Advanced Preparation
          </h2>
          <ul className="space-y-2">
            {recipe.advancedPreparation.map((item, index) => (
              <li key={index} className="text-base text-foreground flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <RecipeIngredients ingredients={recipe.ingredients} />
      
      <RecipeInstructions instructions={recipe.instructions} />
      
      {recipe.tips.length > 0 && (
        <div className="py-6 border-b border-border">
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
            Professional Tips
          </h2>
          <ul className="space-y-3">
            {recipe.tips.map((tip, index) => (
              <li key={index} className="text-base text-foreground flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <RecipeNutrition 
        nutrition={recipe.nutrition}
        nutritionNotes={recipe.nutritionNotes}
      />
      
      <div className="py-6">
        {renderActionButtons()}
      </div>
    </div>
  );
};
