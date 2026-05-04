export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          created_at?: string;
        };
      };
      watchlist: {
        Row: {
          user_id: string;
          id: number;
          type: "movie" | "tv";
          adult: boolean;
          backdrop_path: string | null;
          poster_path: string | null;
          release_date: string;
          title: string;
          vote_average: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          id: number;
          type: "movie" | "tv";
          adult: boolean;
          backdrop_path?: string | null;
          poster_path?: string | null;
          release_date: string;
          title: string;
          vote_average: number;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          id?: number;
          type?: "movie" | "tv";
          adult?: boolean;
          backdrop_path?: string | null;
          poster_path?: string | null;
          release_date?: string;
          title?: string;
          vote_average?: number;
          created_at?: string;
        };
      };
      histories: {
        Row: {
          id: number;
          user_id: string;
          media_id: number;
          type: "movie" | "tv";
          season: number;
          episode: number;
          duration: number;
          last_position: number;
          completed: boolean;
          adult: boolean;
          backdrop_path: string | null;
          poster_path: string | null;
          release_date: string;
          title: string;
          vote_average: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          media_id: number;
          type: "movie" | "tv";
          season?: number;
          episode?: number;
          duration?: number;
          last_position?: number;
          completed?: boolean;
          adult: boolean;
          backdrop_path?: string | null;
          poster_path?: string | null;
          release_date: string;
          title: string;
          vote_average: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          media_id?: number;
          type?: "movie" | "tv";
          season?: number;
          episode?: number;
          duration?: number;
          last_position?: number;
          completed?: boolean;
          adult?: boolean;
          backdrop_path?: string | null;
          poster_path?: string | null;
          release_date?: string;
          title?: string;
          vote_average?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      streams: {
        Row: {
          id: number;
          media_id: number;
          type: "movie" | "tv";
          season: number;
          episode: number;
          m3u8_url: string;
          label: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          media_id: number;
          type: "movie" | "tv";
          season?: number;
          episode?: number;
          m3u8_url: string;
          label?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          media_id?: number;
          type?: "movie" | "tv";
          season?: number;
          episode?: number;
          m3u8_url?: string;
          label?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      media_metadata: {
        Row: {
          id: number;
          media_id: number;
          type: "movie" | "tv";
          title: string | null;
          overview: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          media_id: number;
          type: "movie" | "tv";
          title?: string | null;
          overview?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          media_id?: number;
          type?: "movie" | "tv";
          title?: string | null;
          overview?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
