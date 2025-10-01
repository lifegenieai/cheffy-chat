import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfile } from "@/types/userProfile";
import { toast } from "@/hooks/use-toast";

export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: Partial<UserProfile>) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data: existingProfile } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      // Prepare data for Supabase (cast equipment to Json type)
      const dbProfile = {
        servings: profile.servings,
        equipment: profile.equipment as any,
        cuisines: profile.cuisines,
        flavors: profile.flavors,
        comfort_foods: profile.comfort_foods,
        dislikes: profile.dislikes,
        dietary_filter: profile.dietary_filter,
      };

      if (existingProfile) {
        // Update existing profile
        const { data, error } = await supabase
          .from("user_profiles")
          .update(dbProfile)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new profile
        const { data, error } = await supabase
          .from("user_profiles")
          .insert({ ...dbProfile, user_id: user.id })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", user?.id] });
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      console.error("Profile update error:", error);
    },
  });
}
