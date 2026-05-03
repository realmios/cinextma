"use client";

import BackToTopButton from "@/components/ui/button/BackToTopButton";
import Loop from "@/components/ui/other/Loop";
import PosterCardSkeleton from "@/components/ui/other/PosterCardSkeleton";
import { createClient } from "@/utils/supabase/client";
import { tmdb } from "@/api/tmdb";
import { useQuery } from "@tanstack/react-query";
import { memo } from "react";
import MoviePosterCard from "../Movie/Cards/Poster";
import { Movie } from "tmdb-ts/dist/types";

function useStreamMovies() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["stream-movies"],
    queryFn: async () => {
  const { data, error } = await supabase
    .from("streams")
    .select("media_id")
    .eq("type", "movie");
  if (error) throw error;
  const ids = [...new Set(data?.map((s) => s.media_id) ?? [])] as number[];
  if (ids.length === 0) return [] as Movie[];
  const results = await Promise.allSettled(ids.map((id) => tmdb.movies.details(id)));
  const fulfilled = results.filter(
    (r): r is PromiseFulfilledResult<(typeof r extends PromiseFulfilledResult<infer T> ? T : never)> => r.status === "fulfilled"
  );
  return fulfilled.map((r) => ({
    ...r.value,
    genre_ids: r.value.genres?.map((g) => g.id) ?? [],
  })) as unknown as Movie[];
},
  });
}

const MovieDiscoverList = () => {
  const { data: movies, isPending, isError } = useStreamMovies();

  if (isPending) {
    return (
      <div className="movie-grid">
        <Loop count={20} prefix="SkeletonDiscoverPosterCard">
          <PosterCardSkeleton variant="bordered" />
        </Loop>
      </div>
    );
  }

  if (isError || !movies || movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-default-400">
        <p className="text-4xl mb-3">🎬</p>
        <p>Chưa có phim nào.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-10">
      <div className="movie-grid">
        {movies.map((movie) => (
          <MoviePosterCard key={movie.id} movie={movie} variant="bordered" />
        ))}
      </div>
      <BackToTopButton />
    </div>
  );
};

export default memo(MovieDiscoverList);