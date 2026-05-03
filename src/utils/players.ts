import { PlayersProps } from "@/types";

export const getMoviePlayers = (id: string | number, startAt?: number, streamUrl?: string | null): PlayersProps[] => {
  if (!streamUrl) return [];

  return [
    {
      title: "🎬 Stream",
      source: streamUrl as `https://${string}`,
      recommended: true,
      fast: true,
      ads: false,
      resumable: true,
    },
  ];
};

export const getTvShowPlayers = (id: string | number, season: number, episode: number, startAt?: number, streamUrl?: string | null): PlayersProps[] => {
  if (!streamUrl) return [];

  return [
    {
      title: "🎬 Stream",
      source: streamUrl as `https://${string}`,
      recommended: true,
      fast: true,
      ads: false,
      resumable: true,
    },
  ];
};