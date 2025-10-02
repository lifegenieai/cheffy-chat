import { supabase } from "@/integrations/supabase/client";

export interface RecipeImageResult {
  imageUrl: string | null;
  cached: boolean;
  error?: string;
}

export async function generateRecipeImage(
  dishName: string,
  recipeId: string
): Promise<RecipeImageResult> {
  try {
    const { data, error } = await supabase.functions.invoke("generate-recipe-image", {
      body: { dishName, recipeId },
    });

    if (error) {
      console.error("Error generating recipe image:", error);
      return { imageUrl: null, cached: false, error: error.message };
    }

    return {
      imageUrl: data?.imageUrl || null,
      cached: data?.cached || false,
    };
  } catch (error) {
    console.error("Failed to call image generation function:", error);
    return { 
      imageUrl: null, 
      cached: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}
