import { supabase } from "@/integrations/supabase/client";

export interface RecipeImageResult {
  imageUrl: string | null;
  cached: boolean;
  error?: string;
}

// Track in-flight and completed requests to prevent duplicates
const requestCache = new Map<string, Promise<RecipeImageResult>>();

export async function generateRecipeImage(
  dishName: string,
  recipeId: string
): Promise<RecipeImageResult> {
  const cacheKey = dishName.toLowerCase().trim();
  
  // Check if request is already in progress
  if (requestCache.has(cacheKey)) {
    console.log('[ImageService] Reusing in-flight request for:', dishName);
    return requestCache.get(cacheKey)!;
  }
  
  // Create new request
  console.log('[ImageService] Starting new image request for:', dishName);
  const requestPromise = (async () => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-recipe-image", {
        body: { dishName, recipeId },
      });

      if (error) {
        console.error("Error generating recipe image:", error);
        requestCache.delete(cacheKey); // Remove from cache on error
        return { imageUrl: null, cached: false, error: error.message };
      }

      return {
        imageUrl: data?.imageUrl || null,
        cached: data?.cached || false,
      };
    } catch (error) {
      console.error("Failed to call image generation function:", error);
      requestCache.delete(cacheKey); // Remove from cache on error
      return { 
        imageUrl: null, 
        cached: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  })();
  
  // Cache the promise
  requestCache.set(cacheKey, requestPromise);
  
  // Return the result
  return requestPromise;
}
