"use client";

import TvShowHomeCard from "@/components/sections/TV/Cards/Poster";
import SectionTitle from "@/components/ui/other/SectionTitle";
import Carousel from "@/components/ui/wrapper/Carousel";
import { useStreamIds } from "@/hooks/useStream";
import { QueryList } from "@/types";
import { Link, Skeleton } from "@heroui/react";
import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { kebabCase } from "string-ts";
import { TV } from "tmdb-ts/dist/types";

const TvShowHomeList: React.FC<QueryList<TV>> = ({ query, name, param }) => {
  const key = kebabCase(name) + "-list";
  const { ref, inViewport } = useInViewport();

  const { data, isPending } = useQuery({
    queryFn: query,
    queryKey: [key],
    enabled: inViewport,
  });

  const { data: streamIds, isPending: isStreamIdsPending } = useStreamIds("tv");

  // Filter chỉ giữ TV show có stream
  const filtered = data?.results.filter((tv) => streamIds?.has(tv.id)) ?? [];

  // Ẩn section nếu đã load xong mà không có TV nào
  if (!isPending && !isStreamIdsPending && filtered.length === 0) return null;

  return (
    <section id={key} className="min-h-[250px] md:min-h-[300px]" ref={ref}>
      {isPending || isStreamIdsPending ? (
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
            <Link
              size="sm"
              href={`/discover?type=${param}&content=tv`}
              isBlock
              color="foreground"
              className="rounded-full"
            >
              See All &gt;
            </Link>
          </div>
          <Carousel>
            {filtered.map((tv) => (
              <div
                key={tv.id}
                className="embla__slide flex min-h-fit max-w-fit items-center px-1 py-2"
              >
                <TvShowHomeCard tv={tv} />
              </div>
            ))}
          </Carousel>
        </div>
      )}
    </section>
  );
};

export default TvShowHomeList;