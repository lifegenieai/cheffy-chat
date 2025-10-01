import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Recipe } from "@/types/recipe";
import { useToast } from "@/hooks/use-toast";

export const useSaveRecipe = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (recipe: Recipe) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("saved_recipes")
        .insert({
          user_id: user.id,
          recipe_data: recipe as any
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library-recipes"] });
      toast({
        title: "Recipe saved",
        description: "Recipe has been added to your library.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to save recipe",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
