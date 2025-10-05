import { Recipe } from "@/types/recipe";

interface RecipeIngredientsProps {
  ingredients: Recipe['ingredients'];
}

export const RecipeIngredients = ({ ingredients }: RecipeIngredientsProps) => {
  return (
    <div className="py-6 border-b border-border">
      <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
        Ingredients
      </h2>
      <div className="overflow-hidden rounded-lg border-2 border-border">
        <table className="w-full">
      <thead>
        <tr className="bg-muted/50 border-b-2 border-border">
          <th className="text-left px-6 py-4 font-semibold text-foreground text-sm">
            Ingredient
          </th>
          <th className="text-left px-6 py-4 font-semibold text-foreground text-sm">
            Weight
          </th>
          <th className="text-left px-6 py-4 font-semibold text-foreground text-sm">
            Volume
          </th>
        </tr>
      </thead>
      <tbody>
        {ingredients.map((ingredient, index) => (
          <tr key={index} className="border-b border-border last:border-b-0">
            <td className="px-6 py-4 text-base text-foreground">
              {ingredient.name}
              {ingredient.notes && (
                <span className="block text-sm text-muted-foreground mt-1">
                  {ingredient.notes}
                </span>
              )}
            </td>
            <td className="px-6 py-4 text-base text-foreground">
              {ingredient.weight ?? '—'}
            </td>
            <td className="px-6 py-4 text-base text-foreground">
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
