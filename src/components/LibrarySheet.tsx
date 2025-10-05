import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useLibraryRecipes } from "@/hooks/useLibraryRecipes";
import { useDeleteRecipe } from "@/hooks/useDeleteRecipe";
import { Recipe } from "@/types/recipe";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ChefHat, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

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

const ALL_CATEGORIES = [
  'Appetizers',
  'Soups',
  'Salads',
  'Main Dishes',
  'Side Dishes',
  'Desserts',
  'Breads',
  'Pastry'
] as const;

export const LibrarySheet = ({ open, onOpenChange, onRecipeSelect }: LibrarySheetProps) => {
  const { data: savedRecipes, isLoading } = useLibraryRecipes();
  const deleteRecipe = useDeleteRecipe();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [recipeToDelete, setRecipeToDelete] = useState<{ id: string; title: string } | null>(null);

  const handleRecipeClick = (recipe: Recipe) => {
    onOpenChange(false);
    onRecipeSelect(recipe);
  };

  const handleDeleteClick = (e: React.MouseEvent, recipeId: string, recipeTitle: string) => {
    e.stopPropagation();
    setRecipeToDelete({ id: recipeId, title: recipeTitle });
  };

  const confirmDelete = () => {
    if (recipeToDelete) {
      deleteRecipe.mutate(recipeToDelete.id);
      setRecipeToDelete(null);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Filter recipes based on selected categories
  const filteredRecipes = savedRecipes?.filter(saved => {
    if (selectedCategories.length === 0) return true;
    return selectedCategories.includes(saved.recipe_data.category);
  }) || [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto p-8">
        <SheetHeader className="mb-4">
          <SheetTitle className="font-serif text-3xl text-foreground">
            My Recipe Library
          </SheetTitle>
        </SheetHeader>

        {/* Category Filter Pills */}
        <div className="mb-6 flex flex-wrap gap-2">
          {ALL_CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                selectedCategories.includes(category)
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading your recipes...</p>
          </div>
        ) : savedRecipes && savedRecipes.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredRecipes.length > 0 ? (
              filteredRecipes.map((saved) => {
                const recipe = saved.recipe_data;
                const config = difficultyConfig[recipe.difficulty];
                
                return (
                  <div
                    key={saved.id}
                    onClick={() => handleRecipeClick(recipe)}
                    className={cn(
                      "relative rounded-lg overflow-hidden shadow-refined transition-all duration-300 cursor-pointer group h-[300px]",
                      "lg:hover:shadow-refined-lg lg:hover:-translate-y-1",
                      !recipe.imageUrl && "bg-gradient-to-br from-secondary to-muted border border-border"
                    )}
                  >
                    {/* Image layer with scale effect - desktop only */}
                    {recipe.imageUrl && (
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-out lg:group-hover:scale-105"
                        style={{
                          backgroundImage: `url(${recipe.imageUrl})`
                        }}
                      />
                    )}
                    {/* Full-card darkening scrim - reduces on hover to reveal more image */}
                    {recipe.imageUrl && (
                      <div 
                        className="absolute inset-0 pointer-events-none transition-opacity duration-300 ease-out lg:group-hover:opacity-40"
                        style={{
                          background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.50) 100%)'
                        }}
                      />
                    )}
                    
                    {/* Content protection panel - only if image exists */}
                    {recipe.imageUrl && (
                      <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: 'linear-gradient(to top, rgba(44,44,44,0.85) 0%, rgba(44,44,44,0.65) 60%, transparent 100%)'
                        }}
                      />
                    )}

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteClick(e, saved.id, recipe.title)}
                      className={cn(
                        "absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity z-10",
                        recipe.imageUrl
                          ? "text-white/90 hover:text-white hover:bg-red-500/90 bg-black/30 backdrop-blur-sm"
                          : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      )}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    {/* Content container */}
                    <div className="relative h-full flex flex-col justify-end p-6 z-[1]">
                      <h3 className={cn(
                        "font-serif text-xl font-semibold mb-3 line-clamp-2 pr-8",
                        recipe.imageUrl 
                          ? "text-white drop-shadow-md" 
                          : "text-foreground"
                      )}>
                        {recipe.title}
                      </h3>
                      
                      {/* Category and Difficulty */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "px-3 py-1 text-xs",
                            recipe.imageUrl && "bg-white/20 text-white border-white/40 backdrop-blur-sm hover:bg-white/30"
                          )}
                        >
                          {recipe.category}
                        </Badge>
                        <span className={recipe.imageUrl ? "text-white/70" : "text-muted-foreground"}>•</span>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "px-3 py-1 text-xs",
                            recipe.imageUrl 
                              ? "bg-white/20 text-white border-white/40 backdrop-blur-sm hover:bg-white/30"
                              : config.className
                          )}
                        >
                          {config.label}
                        </Badge>
                      </div>

                      <div className={cn(
                        "flex items-center gap-3 text-sm",
                        recipe.imageUrl ? "text-white/90" : "text-muted-foreground"
                      )}>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Prep: {recipe.prepTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ChefHat className="w-4 h-4" />
                          <span>Cook: {recipe.cookTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center">
                <ChefHat className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-lg text-foreground mb-2">No {selectedCategories.join(', ')} recipes</p>
                <p className="text-muted-foreground max-w-md">
                  Try selecting different categories or clear your filters.
                </p>
              </div>
            )}
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!recipeToDelete} onOpenChange={() => setRecipeToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Recipe?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete '{recipeToDelete?.title}'? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  );
};
