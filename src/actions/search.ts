"use server";

import { tmdb } from "@/api/tmdb";
import { ActionResponse } from "@/types";
import { isEmpty } from "@/utils/helpers";
import { createClient } from "@/utils/supabase/server";

export type SearchSuggestion = {
  id: number;
  title: string;
  type: "movie" | "tv";
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

    // Lấy tất cả media đã upload có metadata
    const { data, error } = await (supabase as any)
      .from("media_metadata")
      .select("media_id, type, title")
      .ilike("title", `%${query}%`)
      .limit(limit);

    if (error) throw error;

    if (!data || data.length === 0) {
      return { success: true, message: "No search suggestions", data: null };
    }

    const suggestions: SearchSuggestion[] = data.map((item: any) => ({
      id: item.media_id,
      title: item.title,
      type: item.type,
    }));

    return {
      success: true,
      message: "Search suggestions fetched",
      data: suggestions,
    };
  } catch (error) {
    console.error("Search suggestions error:", error);
    return {
      success: false,
      message: "Error fetching search suggestions",
      data: null,
    };
  }
};