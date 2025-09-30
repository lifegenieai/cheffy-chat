import { Recipe } from "@/types/recipe";

interface RecipeNutritionProps {
  nutrition: Recipe['nutrition'];
  nutritionNotes?: string;
}

export const RecipeNutrition = ({ nutrition, nutritionNotes }: RecipeNutritionProps) => {
  const nutritionItems = [
    { label: 'Calories', value: nutrition.calories, unit: '' },
    { label: 'Total Fat', value: nutrition.totalFat, unit: 'g' },
    { label: 'Saturated Fat', value: nutrition.saturatedFat, unit: 'g' },
    { label: 'Cholesterol', value: nutrition.cholesterol, unit: 'mg' },
    { label: 'Sodium', value: nutrition.sodium, unit: 'mg' },
    { label: 'Total Carbohydrates', value: nutrition.totalCarbohydrates, unit: 'g' },
    { label: 'Dietary Fiber', value: nutrition.dietaryFiber, unit: 'g' },
    { label: 'Sugars', value: nutrition.sugars, unit: 'g' },
    { label: 'Protein', value: nutrition.protein, unit: 'g' },
  ];

  return (
    <div className="py-6 border-b border-border">
      <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
        Nutrition Information
      </h2>
      <p className="text-sm text-muted-foreground mb-4">Per serving</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {nutritionItems.map((item) => (
          <div key={item.label} className="bg-muted/30 rounded-lg px-4 py-3">
            <div className="text-sm text-muted-foreground mb-1">{item.label}</div>
            <div className="text-lg font-semibold text-foreground">
              {item.value === 'N/A' ? 'N/A' : `${item.value}${item.unit}`}
            </div>
          </div>
        ))}
      </div>
      {nutritionNotes && (
        <p className="text-sm text-muted-foreground mt-4 italic">
          {nutritionNotes}
        </p>
      )}
    </div>
  );
};
