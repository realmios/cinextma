"use client";

import MoviePosterCard from "@/components/sections/Movie/Cards/Poster";
import TvShowPosterCard from "@/components/sections/TV/Cards/Poster";
import SectionTitle from "@/components/ui/other/SectionTitle";
import Carousel from "@/components/ui/wrapper/Carousel";
import ContentTypeSelection from "@/components/ui/other/ContentTypeSelection";
import { createClient } from "@/utils/supabase/client";
import { tmdb } from "@/api/tmdb";
import { Skeleton, Spinner } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { Movie } from "tmdb-ts/dist/types";
import { TV } from "tmdb-ts/dist/types";

// Lấy danh sách media_id unique từ bảng streams
function useStreamMediaIds(type: "movie" | "tv") {
  const supabase = createClient();
  return useQuery({
    queryKey: ["stream-media-ids", type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("streams")
        .select("media_id")
        .eq("type", type);
      if (error) throw error;
      // Unique ids
      return [...new Set(data?.map((s) => s.media_id) ?? [])] as number[];
    },
  });
}

// Fetch movie metadata từ TMDB theo danh sách ids
function useMoviesByIds(ids: number[]) {
  return useQuery({
    queryKey: ["movies-by-ids", ids],
    queryFn: async () => {
      const results = await Promise.all(ids.map((id) => tmdb.movies.details(id)));
      return results as unknown as Movie[];
    },
    enabled: ids.length > 0,
  });
}

// Fetch TV metadata từ TMDB theo danh sách ids
function useTvByIds(ids: number[]) {
  return useQuery({
    queryKey: ["tv-by-ids", ids],
    queryFn: async () => {
      const results = await Promise.all(ids.map((id) => tmdb.tvShows.details(id)));
      return results as unknown as TV[];
    },
    enabled: ids.length > 0,
  });
}

// --- Movie List ---
function MovieStreamList() {
  const { data: ids, isPending: isIdsPending } = useStreamMediaIds("movie");
  const { data: movies, isPending: isMoviesPending } = useMoviesByIds(ids ?? []);

  const isPending = isIdsPending || isMoviesPending;

  if (!isPending && (!movies || movies.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-default-400">
        <p className="text-4xl mb-3">🎬</p>
        <p>Chưa có phim nào. Vào <strong>/admin/streams</strong> để thêm!</p>
      </div>
    );
  }

  return (
    <section className="min-h-[250px] md:min-h-[300px]">
      {isPending ? (
        <div className="flex w-full flex-col gap-5">
          <Skeleton className="h-7 w-40 rounded-full" />
          <Skeleton className="h-[250px] rounded-lg md:h-[300px]" />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <SectionTitle>Phim có sẵn</SectionTitle>
          <Carousel>
            {movies!.map((movie) => (
              <div
                key={movie.id}
                className="embla__slide flex min-h-fit max-w-fit items-center px-1 py-2"
              >
                <MoviePosterCard movie={movie} />
              </div>
            ))}
          </Carousel>
        </div>
      )}
    </section>
  );
}

// --- TV List ---
function TvStreamList() {
  const { data: ids, isPending: isIdsPending } = useStreamMediaIds("tv");
  const { data: tvShows, isPending: isTvPending } = useTvByIds(ids ?? []);

  const isPending = isIdsPending || isTvPending;

  if (!isPending && (!tvShows || tvShows.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-default-400">
        <p className="text-4xl mb-3">📺</p>
        <p>Chưa có TV show nào.</p>
      </div>
    );
  }

  return (
    <section className="min-h-[250px] md:min-h-[300px]">
      {isPending ? (
        <div className="flex w-full flex-col gap-5">
          <Skeleton className="h-7 w-40 rounded-full" />
          <Skeleton className="h-[250px] rounded-lg md:h-[300px]" />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <SectionTitle color="warning">TV Show có sẵn</SectionTitle>
          <Carousel>
            {tvShows!.map((tv) => (
              <div
                key={tv.id}
                className="embla__slide flex min-h-fit max-w-fit items-center px-1 py-2"
              >
                <TvShowPosterCard tv={tv} />
              </div>
            ))}
          </Carousel>
        </div>
      )}
    </section>
  );
}

// --- Main ---
const HomePageList: React.FC = () => {
  const [content] = useQueryState(
    "content",
    parseAsStringLiteral(["movie", "tv"]).withDefault("movie"),
  );

  return (
    <div className="flex flex-col gap-12">
      <ContentTypeSelection className="justify-center" />
      <div className="relative flex min-h-32 flex-col gap-12">
        {content === "movie" && <MovieStreamList />}
        {content === "tv" && <TvStreamList />}
      </div>
    </div>
  );
};

export default HomePageList;