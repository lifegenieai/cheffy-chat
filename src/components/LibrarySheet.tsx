import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useLibraryRecipes } from "@/hooks/useLibraryRecipes";
import { Recipe } from "@/types/recipe";
import { Badge } from "@/components/ui/badge";
import { Clock, ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";

interface LibrarySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecipeSelect: (recipe: Recipe) => void;
}

const difficultyConfig = {
  easy: { label: 'Easy', className: 'bg-green-100 text-green-800 border-green-200' },
  medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  hard: { label: 'Advanced', className: 'bg-red-100 text-red-800 border-red-200' }
};

export const LibrarySheet = ({ open, onOpenChange, onRecipeSelect }: LibrarySheetProps) => {
  const { data: savedRecipes, isLoading } = useLibraryRecipes();

  const handleRecipeClick = (recipe: Recipe) => {
    onOpenChange(false);
    onRecipeSelect(recipe);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto p-8">
        <SheetHeader className="mb-6">
          <SheetTitle className="font-serif text-3xl text-foreground">
            My Recipe Library
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading your recipes...</p>
          </div>
        ) : savedRecipes && savedRecipes.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {savedRecipes.map((saved) => {
              const recipe = saved.recipe_data;
              const config = difficultyConfig[recipe.difficulty];
              
              return (
                <div
                  key={saved.id}
                  onClick={() => handleRecipeClick(recipe)}
                  className="border border-border rounded-lg p-6 hover:shadow-refined-md transition-all duration-200 cursor-pointer bg-background"
                >
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-3 line-clamp-2">
                    {recipe.title}
                  </h3>
                  
                  <div className="flex items-center gap-3 mb-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Prep: {recipe.prepTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ChefHat className="w-4 h-4" />
                      <span>Cook: {recipe.cookTime}</span>
                    </div>
                  </div>

                  <Badge variant="outline" className={cn("px-3 py-1", config.className)}>
                    {config.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ChefHat className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-lg text-foreground mb-2">No saved recipes yet</p>
            <p className="text-muted-foreground max-w-md">
              Generate a recipe in chat and save it to your library to access it anytime.
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
