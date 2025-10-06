import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Recipe } from "@/types/recipe";

interface SavedRecipe {
  id: string;
  user_id: string;
  recipe_data: Recipe;
  created_at: string;
  updated_at: string;
}

export const useLibraryRecipes = () => {
  return useQuery({
    queryKey: ["library-recipes"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("saved_recipes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      return (data?.map(item => ({
        ...item,
        recipe_data: item.recipe_data as unknown as Recipe
      })) as SavedRecipe[]) || [];
    },
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: false, // Changed to false to prevent refetch loops on mobile
    retry: 1, // Reduced from 2 to 1 for faster failure on mobile
    retryDelay: 1000, // 1 second between retries
    networkMode: 'online', // Only run query when online
  });
};
