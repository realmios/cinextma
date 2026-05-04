"use client";

import { createClient } from "@/utils/supabase/client";
import { tmdb } from "@/api/tmdb";
import TvShowHomeCard from "@/components/sections/TV/Cards/Poster";
import MoviePosterCard from "../Movie/Cards/Poster";
import BackToTopButton from "@/components/ui/button/BackToTopButton";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import { isEmpty } from "@/utils/helpers";
import { Spinner } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Movie, TV } from "tmdb-ts/dist/types";
import SearchFilter from "./Filter";

const SearchList = () => {
  const { content } = useDiscoverFilters();
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState("");
  const triggered = !isEmpty(submittedSearchQuery);
  const supabase = createClient();

  const { data, isPending } = useQuery({
    enabled: triggered,
    queryKey: ["search-list", content, submittedSearchQuery],
    queryFn: async () => {
      // Tìm media_id từ media_metadata theo tên
      const { data: metaRows, error } = await (supabase as any)
        .from("media_metadata")
        .select("media_id, type, title")
        .eq("type", content)
        .ilike("title", `%${submittedSearchQuery}%`);

      if (error) throw error;
      if (!metaRows || metaRows.length === 0) return [];

      // Lấy thêm thông tin từ TMDB
      const results = await Promise.allSettled(
        metaRows.map((row: any) =>
          content === "movie"
            ? tmdb.movies.details(row.media_id)
            : tmdb.tvShows.details(row.media_id)
        )
      );

      return results
        .filter((r) => r.status === "fulfilled")
        .map((r) => (r as PromiseFulfilledResult<any>).value);
    },
  });

  return (
    <div className="flex flex-col items-center gap-8">
      <SearchFilter
        isLoading={isPending && triggered}
        onSearchSubmit={(value) => setSubmittedSearchQuery(value.trim())}
      />

      {triggered && (
        <div className="relative flex flex-col items-center gap-8 w-full">
          {isPending ? (
            <Spinner
              size="lg"
              className="mt-56"
              color={content === "movie" ? "primary" : "warning"}
              variant="simple"
            />
          ) : !data || data.length === 0 ? (
            <h5 className="mt-56 text-center text-xl">
              Không tìm thấy {content === "movie" ? "phim" : "TV series"} với từ khóa{" "}
              <span className="text-warning font-semibold">"{submittedSearchQuery}"</span>
            </h5>
          ) : (
            <>
              <h5 className="text-center text-xl">
                <span className="motion-preset-focus">
                  Tìm thấy{" "}
                  <span className="text-success font-semibold">{data.length}</span>{" "}
                  {content === "movie" ? "phim" : "TV series"} với từ khóa{" "}
                  <span className="text-warning font-semibold">"{submittedSearchQuery}"</span>
                </span>
              </h5>
              <div className="movie-grid">
                {content === "movie"
                  ? data.map((movie: Movie) => (
                      <MoviePosterCard key={movie.id} movie={movie} variant="bordered" />
                    ))
                  : data.map((tv: TV) => (
                      <TvShowHomeCard key={tv.id} tv={tv} variant="bordered" />
                    ))}
              </div>
            </>
          )}
        </div>
      )}

      <BackToTopButton />
    </div>
  );
};

export default SearchList;