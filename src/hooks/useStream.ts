import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";

export type Stream = {
  id: number;
  media_id: number;
  type: "movie" | "tv";
  season: number;
  episode: number;
  m3u8_url: string;
  label: string | null;
  created_at: string;
  updated_at: string;
};

type UseStreamOptions = {
  mediaId: number;
  type: "movie" | "tv";
  season?: number;
  episode?: number;
};

// Hook dùng ở player page để lấy m3u8 URL
export function useStream({ mediaId, type, season = 0, episode = 0 }: UseStreamOptions) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["stream", mediaId, type, season, episode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("streams")
        .select("*")
        .eq("media_id", mediaId)
        .eq("type", type)
        .eq("season", season)
        .eq("episode", episode)
        .maybeSingle();

      if (error) throw error;
      return data as Stream | null;
    },
  });
}

// Hook lấy tất cả media_id có stream theo type — dùng để filter trang chủ
export function useStreamIds(type: "movie" | "tv") {
  const supabase = createClient();

  return useQuery({
    queryKey: ["stream-ids", type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("streams")
        .select("media_id")
        .eq("type", type);

      if (error) throw error;
      return new Set(data?.map((s) => s.media_id) ?? []);
    },
  });
}

// Hook dùng ở admin page để lấy tất cả streams
export function useAllStreams() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["streams-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("streams")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as Stream[];
    },
  });
}