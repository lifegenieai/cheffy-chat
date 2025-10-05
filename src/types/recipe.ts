export interface Recipe {
  // Core identifiers
  id: string;
  title: string;
  category: 'Appetizers' | 'Soups' | 'Salads' | 'Main Dishes' | 'Side Dishes' | 'Desserts' | 'Breads' | 'Pastry';
  
  // Recipe metadata
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  prepTime: string;
  cookTime: string;
  totalTime: string;
  
  // Content sections
  introduction: string;
  tips: string[];
  
  // Equipment and prep
  equipment: string[];
  advancedPreparation?: string[];
  
  // Ingredients
  ingredients: Array<{
    name: string;
    weightGrams?: number;
    weightOz?: number;
    volume?: string;
    notes?: string;
  }>;
  
  // Instructions
  instructions: Array<{
    stepNumber: number;
    description: string;
    timing?: string;
    temperature?: string;
  }>;
  
  // Nutritional information (per serving)
  nutrition: {
    calories: number | 'N/A';
    totalFat: number | 'N/A';
    saturatedFat: number | 'N/A';
    cholesterol: number | 'N/A';
    sodium: number | 'N/A';
    totalCarbohydrates: number | 'N/A';
    dietaryFiber: number | 'N/A';
    sugars: number | 'N/A';
    protein: number | 'N/A';
  };
  nutritionNotes?: string;
  
  // User metadata
  savedAt?: string;
  createdAt: string;
  modifiedAt?: string;
  
  // Image metadata
  imageUrl?: string;
}
