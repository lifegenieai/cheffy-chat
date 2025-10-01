import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfile } from "@/types/userProfile";

export function useUserProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        // If profile doesn't exist yet, return null (not an error)
        if (error.code === "PGRST116") {
          return null;
        }
        throw error;
      }

      return data as UserProfile;
    },
    enabled: !!user?.id,
  });
}
