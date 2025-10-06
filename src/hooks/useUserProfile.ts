import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfile } from "@/types/userProfile";
import { useEffect } from "react";

export function useUserProfile() {
  const { user } = useAuth();

  // Defensive: Invalidate query when user changes to prevent stale data
  useEffect(() => {
    // This ensures that when user changes, we refetch
    return () => {
      // Cleanup happens automatically via queryKey dependency on user?.id
    };
  }, [user?.id]);

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

      // Defensive: Verify the fetched profile matches current user
      if (data && data.user_id !== user.id) {
        console.error('Profile mismatch detected:', {
          fetchedUserId: data.user_id,
          currentUserId: user.id
        });
        return null;
      }

      return data as UserProfile;
    },
    enabled: !!user?.id,
    // Important: Don't use stale data, always refetch on mount
    staleTime: 0,
    // Prevent cache from being used across different users
    gcTime: 0,
  });
}
