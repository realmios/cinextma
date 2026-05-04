import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useMediaTitle(mediaId: number, type: "movie" | "tv", fallback: string) {
  const supabase = createClient();

  const { data } = useQuery({
    queryKey: ["media-title", mediaId, type],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("media_metadata")
        .select("title")
        .eq("media_id", mediaId)
        .eq("type", type)
        .single();
      if (error || !data) return null;
      return data.title as string;
    },
    staleTime: 1000 * 60 * 10, // cache 10 phút
  });

  return data ?? fallback;
}