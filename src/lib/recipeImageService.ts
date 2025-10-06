import { supabase } from "@/integrations/supabase/client";

export interface RecipeImageResult {
  imageUrl: string | null;
  thumbnailUrl?: string | null;
  cached: boolean;
  generating?: boolean;
  error?: string;
}

// Track in-flight and completed requests to prevent duplicates
const requestCache = new Map<string, Promise<RecipeImageResult>>();

export async function generateRecipeImage(
  dishName: string,
  recipeId: string,
  async: boolean = true
): Promise<RecipeImageResult> {
  const cacheKey = dishName.toLowerCase().trim();
  
  // Check if request is already in progress
  if (requestCache.has(cacheKey)) {
    console.log('[ImageService] Reusing in-flight request for:', dishName);
    return requestCache.get(cacheKey)!;
  }
  
  // Create new request
  console.log('[ImageService] Starting new image request for:', dishName, 'async:', async);
  const requestPromise = (async () => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-recipe-image", {
        body: { dishName, recipeId, async },
      });

      if (error) {
        console.error("Error generating recipe image:", error);
        requestCache.delete(cacheKey);
        return { imageUrl: null, thumbnailUrl: null, cached: false, error: error.message };
      }

      return {
        imageUrl: data?.imageUrl || null,
        thumbnailUrl: data?.thumbnailUrl || null,
        cached: data?.cached || false,
        generating: data?.generating || false,
      };
    } catch (error) {
      console.error("Failed to call image generation function:", error);
      requestCache.delete(cacheKey);
      return { 
        imageUrl: null,
        thumbnailUrl: null,
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

// Poll for image completion
export async function pollForImage(
  dishName: string,
  maxAttempts: number = 15,
  intervalMs: number = 2000
): Promise<RecipeImageResult> {
  const cacheKey = dishName.toLowerCase().trim();
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    console.log(`[ImageService] Polling attempt ${attempt + 1}/${maxAttempts} for: ${dishName}`);
    
    // Query the database directly for the image
    const { data, error } = await supabase
      .from('recipe_images')
      .select('image_url, thumbnail_url')
      .eq('dish_name', cacheKey)
      .maybeSingle();
    
    if (error) {
      console.error('[ImageService] Database query error:', error);
    } else if (data?.image_url) {
      console.log('[ImageService] Image found in database:', data.image_url);
      return {
        imageUrl: data.image_url,
        thumbnailUrl: data.thumbnail_url,
        cached: true
      };
    }
    
    if (attempt < maxAttempts - 1) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }
  
  console.warn('[ImageService] Polling timed out for:', dishName);
  return {
    imageUrl: null,
    thumbnailUrl: null,
    cached: false,
    error: "Image generation timed out"
  };
}
