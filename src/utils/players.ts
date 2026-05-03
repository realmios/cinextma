import { PlayersProps } from "@/types";
import { Stream } from "@/hooks/useStream";

export const getMoviePlayers = (id: string | number, startAt?: number, streams?: Stream[]): PlayersProps[] => {
  if (!streams || streams.length === 0) return [];

  return streams.map((s) => ({
    title: s.label ?? "🎬 Stream",
    source: s.m3u8_url as `https://${string}`,
    recommended: true,
    fast: true,
    ads: false,
    resumable: true,
  }));
};

export const getTvShowPlayers = (id: string | number, season: number, episode: number, startAt?: number, streams?: Stream[]): PlayersProps[] => {
  if (!streams || streams.length === 0) return [];

  return streams.map((s) => ({
    title: s.label ?? "🎬 Stream",
    source: s.m3u8_url as `https://${string}`,
    recommended: true,
    fast: true,
    ads: false,
    resumable: true,
  }));
};