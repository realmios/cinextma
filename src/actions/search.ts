"use server";

import { tmdb } from "@/api/tmdb";
import { ActionResponse } from "@/types";
import { isEmpty } from "@/utils/helpers";
import { createClient } from "@/utils/supabase/server";

export type SearchSuggestion = {
  id: number;
  title: string;
  type: "movie" | "tv";
  poster_path: string | null;
};

export const getSearchSuggestions = async (
  query: string,
  limit: number = 10,
): Promise<ActionResponse<SearchSuggestion[] | null>> => {
  try {
    if (isEmpty(query)) {
      return { success: true, message: "No search suggestions", data: null };
    }

    const supabase = await createClient();

    const { data: metaRows, error } = await (supabase as any)
      .from("media_metadata")
      .select("media_id, type, title")
      .ilike("title", `%${query}%`)
      .limit(limit);

    if (error) throw error;
    if (!metaRows || metaRows.length === 0) {
      return { success: true, message: "No search suggestions", data: null };
    }

    const results = await Promise.allSettled(
      metaRows.map(async (row: any) => {
        try {
          const detail = row.type === "movie"
            ? await tmdb.movies.details(row.media_id)
            : await tmdb.tvShows.details(row.media_id);
          return {
            id: row.media_id,
            title: row.title,
            type: row.type,
            poster_path: detail.poster_path ?? null,
          } as SearchSuggestion;
        } catch {
          return {
            id: row.media_id,
            title: row.title,
            type: row.type,
            poster_path: null,
          } as SearchSuggestion;
        }
      })
    );

    const suggestions = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => (r as PromiseFulfilledResult<SearchSuggestion>).value);

    return { success: true, message: "Search suggestions fetched", data: suggestions };
  } catch (error) {
    return { success: false, message: "Error fetching search suggestions", data: null };
  }
};