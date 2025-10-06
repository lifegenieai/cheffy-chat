import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Recipe } from "@/types/recipe";
import { useAuth } from "@/contexts/AuthContext";

interface SavedRecipe {
  id: string;
  user_id: string;
  recipe_data: Recipe;
  created_at: string;
  updated_at: string;
}

export const useLibraryRecipes = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["library-recipes", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return [];
      }

      const { data, error } = await supabase
        .from("saved_recipes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Defensive: Filter out any recipes that don't match current user
      const recipes = (data?.map(item => ({
        ...item,
        recipe_data: item.recipe_data as unknown as Recipe
      })) as SavedRecipe[]) || [];
      
      return recipes.filter(recipe => recipe.user_id === user.id);
    },
    enabled: !!user?.id,
    // Prevent stale data across user sessions
    staleTime: 0,
    gcTime: 0,
    retry: 1,
    retryDelay: 1000,
    networkMode: 'online',
  });
};
