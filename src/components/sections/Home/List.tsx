"use client";

import MoviePosterCard from "@/components/sections/Movie/Cards/Poster";
import TvShowPosterCard from "@/components/sections/TV/Cards/Poster";
import SectionTitle from "@/components/ui/other/SectionTitle";
import Carousel from "@/components/ui/wrapper/Carousel";
import ContentTypeSelection from "@/components/ui/other/ContentTypeSelection";
import { useStreamIds } from "@/hooks/useStream";
import { siteConfig } from "@/config/site";
import { Link, Skeleton } from "@heroui/react";
import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { kebabCase } from "string-ts";
import { Movie } from "tmdb-ts/dist/types";
import { TV } from "tmdb-ts/dist/types";
import { Suspense } from "react";

// --- Movie Section ---
function MovieHomeSection({
  query,
  name,
  param,
  streamIds,
}: {
  query: () => Promise<any>;
  name: string;
  param: string;
  streamIds: Set<number> | undefined;
}) {
  const key = kebabCase(name) + "-list";
  const { ref, inViewport } = useInViewport();
  const { data, isPending } = useQuery({
    queryFn: query,
    queryKey: [key],
    enabled: inViewport,
  });

  const filtered = data?.results.filter((m: Movie) => streamIds?.has(m.id)) ?? [];

  if (!isPending && filtered.length === 0) return null;

  return (
    <section id={key} className="min-h-[250px] md:min-h-[300px]" ref={ref}>
      {isPending ? (
        <div className="flex w-full flex-col gap-5">
          <div className="flex grow items-center justify-between">
            <Skeleton className="h-7 w-40 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-[250px] rounded-lg md:h-[300px]" />
        </div>
      ) : (
        <div className="z-3 flex flex-col gap-2">
          <div className="flex grow items-center justify-between">
            <SectionTitle>{name}</SectionTitle>
            <Link size="sm" href={`/discover?type=${param}`} isBlock color="foreground" className="rounded-full">
              Xem tất cả &gt;
            </Link>
          </div>
          <Carousel>
            {filtered.map((movie: Movie) => (
              <div key={movie.id} className="embla__slide flex min-h-fit max-w-fit items-center px-1 py-2">
                <MoviePosterCard movie={movie} />
              </div>
            ))}
          </Carousel>
        </div>
      )}
    </section>
  );
}

// --- TV Section ---
function TvHomeSection({
  query,
  name,
  param,
  streamIds,
}: {
  query: () => Promise<any>;
  name: string;
  param: string;
  streamIds: Set<number> | undefined;
}) {
  const key = kebabCase(name) + "-list";
  const { ref, inViewport } = useInViewport();
  const { data, isPending } = useQuery({
    queryFn: query,
    queryKey: [key],
    enabled: inViewport,
  });

  const filtered = data?.results.filter((tv: TV) => streamIds?.has(tv.id)) ?? [];

  if (!isPending && filtered.length === 0) return null;

  return (
    <section id={key} className="min-h-[250px] md:min-h-[300px]" ref={ref}>
      {isPending ? (
        <div className="flex w-full flex-col gap-5">
          <div className="flex grow items-center justify-between">
            <Skeleton className="h-7 w-40 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-[250px] rounded-lg md:h-[300px]" />
        </div>
      ) : (
        <div className="z-3 flex flex-col gap-2">
          <div className="flex grow items-center justify-between">
            <SectionTitle color="warning">{name}</SectionTitle>
            <Link size="sm" href={`/discover?type=${param}&content=tv`} isBlock color="foreground" className="rounded-full">
              Xem tất cả &gt;
            </Link>
          </div>
          <Carousel>
            {filtered.map((tv: TV) => (
              <div key={tv.id} className="embla__slide flex min-h-fit max-w-fit items-center px-1 py-2">
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
  const { movies, tvShows } = siteConfig.queryLists;
  const [content] = useQueryState(
    "content",
    parseAsStringLiteral(["movie", "tv"]).withDefault("movie"),
  );

  const { data: movieStreamIds } = useStreamIds("movie");
  const { data: tvStreamIds } = useStreamIds("tv");

  return (
    <div className="flex flex-col gap-12">
      <ContentTypeSelection className="justify-center" />
      <div className="relative flex min-h-32 flex-col gap-12">
        {content === "movie" &&
          movies.map((movie) => (
            <MovieHomeSection
              key={movie.name}
              {...movie}
              streamIds={movieStreamIds}
            />
          ))}
        {content === "tv" &&
          tvShows.map((tv) => (
            <TvHomeSection
              key={tv.name}
              {...tv}
              streamIds={tvStreamIds}
            />
          ))}
      </div>
    </div>
  );
};

export default HomePageList;