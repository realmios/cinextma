"use client";

import BackToTopButton from "@/components/ui/button/BackToTopButton";
import Loop from "@/components/ui/other/Loop";
import PosterCardSkeleton from "@/components/ui/other/PosterCardSkeleton";
import TvShowPosterCard from "../TV/Cards/Poster";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import { useStreamIds } from "@/hooks/useStream";
import { tmdb } from "@/api/tmdb";
import { useQuery } from "@tanstack/react-query";
import { memo } from "react";
import { TV } from "tmdb-ts/dist/types";

const TvShowDiscoverList = () => {
  const { queryType, genresString } = useDiscoverFilters();
  const { data: streamIds, isPending: isStreamPending } = useStreamIds("tv");

  const { data, isPending, isError } = useQuery({
    queryKey: ["discover-tv-shows", queryType, genresString],
    queryFn: async () => {
      if (queryType === "discover") {
        // @ts-expect-error
        const res = await tmdb.discover.tvShow({ with_genres: genresString || undefined });
        return res.results as TV[];
      }
      const { tvShows } = (await import("@/config/site")).siteConfig.queryLists;
      const found = tvShows.find((t) => t.param === queryType);
      if (!found) return [] as TV[];
      const res = await found.query();
      return (res as any).results as TV[];
    },
  });

  // Filter chỉ giữ TV show có stream
  const filtered = data?.filter((tv) => streamIds?.has(tv.id)) ?? [];

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
        <p className="text-4xl mb-3">📺</p>
        <p>Không có TV show nào trong mục này.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-10">
      <div className="movie-grid">
        {filtered.map((tv) => (
          <TvShowPosterCard key={tv.id} tv={tv} variant="bordered" />
        ))}
      </div>
      <BackToTopButton />
    </div>
  );
};

export default memo(TvShowDiscoverList);