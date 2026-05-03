"use client";

import BackToTopButton from "@/components/ui/button/BackToTopButton";
import Loop from "@/components/ui/other/Loop";
import PosterCardSkeleton from "@/components/ui/other/PosterCardSkeleton";
import { createClient } from "@/utils/supabase/client";
import { tmdb } from "@/api/tmdb";
import { useQuery } from "@tanstack/react-query";
import TvShowPosterCard from "../TV/Cards/Poster";
import { TV } from "tmdb-ts/dist/types";

function useStreamTvShows() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["stream-tv-shows"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("streams")
        .select("media_id")
        .eq("type", "tv");
      if (error) throw error;
      const ids = [...new Set(data?.map((s) => s.media_id) ?? [])] as number[];
      if (ids.length === 0) return [] as TV[];
      const results = await Promise.allSettled(ids.map((id) => tmdb.tvShows.details(id)));
      const fulfilled = results.filter((r) => r.status === "fulfilled") as PromiseFulfilledResult<any>[];
      return fulfilled.map((r) => r.value) as TV[];
    },
  });
}

const TvShowDiscoverList = () => {
  const { data: tvShows, isPending, isError } = useStreamTvShows();

  if (isPending) {
    return (
      <div className="movie-grid">
        <Loop count={20} prefix="SkeletonDiscoverPosterCard">
          <PosterCardSkeleton variant="bordered" />
        </Loop>
      </div>
    );
  }

  if (isError || !tvShows || tvShows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-default-400">
        <p className="text-4xl mb-3">📺</p>
        <p>Chưa có TV show nào.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-10">
      <div className="movie-grid">
        {tvShows.map((tv) => (
          <TvShowPosterCard key={tv.id} tv={tv} variant="bordered" />
        ))}
      </div>
      <BackToTopButton />
    </div>
  );
};

export default TvShowDiscoverList;