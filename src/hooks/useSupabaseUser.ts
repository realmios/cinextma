"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { queryClient } from "@/app/providers";
import { addToast } from "@heroui/react";

type AuthUserData = User & {
  username: string;
};

const fetchUser = async (): Promise<AuthUserData | null> => {
  let AuthUser: AuthUserData | null = null;

  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const { data: username } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (username) {
    AuthUser = {
      ...user,
      username: username.username,
    };
  }

  return AuthUser;
};

const useSupabaseUser = () => {
  const supabase = createClient();

  const query = useQuery({
    queryKey: ["supabase-user"],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async () => {
      queryClient.invalidateQueries({ queryKey: ["supabase-user"] });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, queryClient]);

  return query;
};

export default useSupabaseUser;