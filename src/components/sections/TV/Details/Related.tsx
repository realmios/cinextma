"use client";

import SectionTitle from "@/components/ui/other/SectionTitle";
import { isEmpty } from "@/utils/helpers";
import { Tab, Tabs } from "@heroui/react";
import { AppendToResponse, TV, TvShowDetails } from "tmdb-ts/dist/types";
import TvShowRelatedList from "./RelatedList";
import { useUploadedMediaIds } from "@/hooks/useMediaTitle";

interface TvShowRelatedSectionProps {
  tv: AppendToResponse<TvShowDetails, ("recommendations" | "similar")[], "tvShow">;
}

const TvShowRelatedSection: React.FC<TvShowRelatedSectionProps> = ({ tv }) => {
  const { data: uploadedIds } = useUploadedMediaIds("tv");

  // @ts-expect-error: wrong type.
  const recommendations = (tv.recommendations.results as TV[])
    .filter((t) => uploadedIds?.has(t.id));
  const similar = (tv.similar.results as TV[])
    .filter((t) => uploadedIds?.has(t.id));

  if (!uploadedIds) return null;

  return (
    <section id="related" className="z-3">
      <SectionTitle color="warning" className="mb-2 sm:mb-0 sm:translate-y-10">
        Có thể bạn thích
      </SectionTitle>
      <Tabs
        aria-label="Related Section"
        variant="underlined"
        className="sm:w-full sm:justify-end"
        classNames={{ cursor: "bg-warning h-1 rounded-full" }}
      >
        {!isEmpty(recommendations) && (
          <Tab key="recommendations" title="Đề xuất">
            <TvShowRelatedList tvs={recommendations} />
          </Tab>
        )}
        {!isEmpty(similar) && (
          <Tab key="similar" title="Tương tự">
            <TvShowRelatedList tvs={similar} />
          </Tab>
        )}
      </Tabs>
    </section>
  );
};

export default TvShowRelatedSection;