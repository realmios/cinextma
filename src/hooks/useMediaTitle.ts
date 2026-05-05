import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";

// Lấy title tiếng Việt (dùng ở card)
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
    staleTime: 1000 * 60 * 10,
  });

  return data ?? fallback;
}

// Lấy cả title lẫn overview tiếng Việt (dùng ở detail page)
export function useMediaInfo(mediaId: number, type: "movie" | "tv") {
  const supabase = createClient();

  return useQuery({
    queryKey: ["media-info", mediaId, type],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("media_metadata")
        .select("title, overview")
        .eq("media_id", mediaId)
        .eq("type", type)
        .single();
      if (error || !data) return null;
      return data as { title: string; overview: string };
    },
    staleTime: 1000 * 60 * 10,
  });
}
export function useUploadedMediaIds(type: "movie" | "tv") {
  const supabase = createClient();

  return useQuery({
    queryKey: ["uploaded-media-ids", type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("streams")
        .select("media_id")
        .eq("type", type);
      if (error) throw error;
      return new Set(data?.map((s) => s.media_id) ?? []);
    },
    staleTime: 1000 * 60 * 10,
  });
}