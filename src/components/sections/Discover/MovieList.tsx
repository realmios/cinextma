"use client";

import BackToTopButton from "@/components/ui/button/BackToTopButton";
import Loop from "@/components/ui/other/Loop";
import PosterCardSkeleton from "@/components/ui/other/PosterCardSkeleton";
import MoviePosterCard from "../Movie/Cards/Poster";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import { useStreamIds } from "@/hooks/useStream";
import { tmdb } from "@/api/tmdb";
import { useQuery } from "@tanstack/react-query";
import { memo } from "react";
import { Movie } from "tmdb-ts/dist/types";

const MovieDiscoverList = () => {
  const { queryType, genresString } = useDiscoverFilters();
  const { data: streamIds, isPending: isStreamPending } = useStreamIds("movie");

  const { data, isPending, isError } = useQuery({
    queryKey: ["discover-movies", queryType, genresString],
    queryFn: async () => {
      if (queryType === "discover") {
        const res = await tmdb.discover.movie({ with_genres: genresString || undefined }) as { results: Movie[] };
return res.results;
      }
      const { movies, } = (await import("@/config/site")).siteConfig.queryLists;
      const found = movies.find((m) => m.param === queryType);
      if (!found) return [] as Movie[];
      const res = await found.query();
      return (res as any).results as Movie[];
    },
  });

  // Filter chỉ giữ phim có stream
  const filtered = data?.filter((m) => streamIds?.has(m.id)) ?? [];

  const loading = isPending || isStreamPending;

  if (loading) {
    return (
      <div className="movie-grid">
        <Loop count={20} prefix="SkeletonDiscoverPosterCard">
          <PosterCardSkeleton variant="bordered" />
        </Loop>
      </div>
    );
  }

  if (isError || filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-default-400">
        <p className="text-4xl mb-3">🎬</p>
        <p>Không có phim nào trong mục này.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-10">
      <div className="movie-grid">
        {filtered.map((movie) => (
          <MoviePosterCard key={movie.id} movie={movie} variant="bordered" />
        ))}
      </div>
      <BackToTopButton />
    </div>
  );
};

export default memo(MovieDiscoverList);