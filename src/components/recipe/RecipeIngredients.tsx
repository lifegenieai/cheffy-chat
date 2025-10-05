import { Recipe } from "@/types/recipe";
import { useIsMobile } from "@/hooks/use-mobile";

interface RecipeIngredientsProps {
  ingredients: Recipe['ingredients'];
}

export const RecipeIngredients = ({ ingredients }: RecipeIngredientsProps) => {
  const isMobile = useIsMobile();

  // Mobile: Card-based layout
  if (isMobile) {
    return (
      <div className="py-6 border-b border-border">
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
          Ingredients
        </h2>
        <div className="space-y-3">
          {ingredients.map((ingredient, index) => (
            <div
              key={index}
              className="bg-muted/30 rounded-lg p-4 shadow-sm border border-border"
            >
              <div className="font-medium text-base text-foreground mb-3">
                {ingredient.name}
              </div>
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Weight
                  </div>
                  <div className="text-sm text-foreground">
                    {ingredient.weight ?? '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Volume
                  </div>
                  <div className="text-sm text-foreground">
                    {ingredient.volume ?? '—'}
                  </div>
                </div>
              </div>
              {ingredient.notes && (
                <div className="text-sm text-muted-foreground pt-2 border-t border-border/50 mt-2">
                  {ingredient.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Tablet/Desktop: Traditional table with responsive padding
  return (
    <div className="py-6 border-b border-border">
      <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
        Ingredients
      </h2>
      <div className="overflow-hidden rounded-lg border-2 border-border">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b-2 border-border">
              <th className="text-left px-3 md:px-4 lg:px-6 py-3 md:py-4 font-semibold text-foreground text-sm">
                Ingredient
              </th>
              <th className="text-left px-3 md:px-4 lg:px-6 py-3 md:py-4 font-semibold text-foreground text-sm">
                Weight
              </th>
              <th className="text-left px-3 md:px-4 lg:px-6 py-3 md:py-4 font-semibold text-foreground text-sm">
                Volume
              </th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ingredient, index) => (
              <tr key={index} className="border-b border-border last:border-b-0">
                <td className="px-3 md:px-4 lg:px-6 py-3 md:py-4 text-base text-foreground">
                  {ingredient.name}
                  {ingredient.notes && (
                    <span className="block text-sm text-muted-foreground mt-1">
                      {ingredient.notes}
                    </span>
                  )}
                </td>
                <td className="px-3 md:px-4 lg:px-6 py-3 md:py-4 text-base text-foreground">
                  {ingredient.weight ?? '—'}
                </td>
                <td className="px-3 md:px-4 lg:px-6 py-3 md:py-4 text-base text-foreground">
                  {ingredient.volume ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
