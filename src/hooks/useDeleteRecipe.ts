import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useDeleteRecipe = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (recipeId: string) => {
      const { error } = await supabase
        .from("saved_recipes")
        .delete()
        .eq("id", recipeId);

      if (error) throw error;
    },
    onMutate: async (recipeId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["library-recipes"] });

      // Snapshot previous value
      const previousRecipes = queryClient.getQueryData(["library-recipes"]);

      // Optimistically update
      queryClient.setQueryData(["library-recipes"], (old: any) => {
        return old?.filter((recipe: any) => recipe.id !== recipeId) || [];
      });

      return { previousRecipes };
    },
    onError: (error, recipeId, context) => {
      // Rollback on error
      queryClient.setQueryData(["library-recipes"], context?.previousRecipes);
      toast({
        title: "Failed to delete recipe",
        description: "Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Recipe deleted",
        description: "The recipe has been removed from your library.",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["library-recipes"] });
    },
  });
};
