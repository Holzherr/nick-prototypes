// Written by hand to match supabase/migrations/. Once the project is linked, regenerate:
// npx supabase gen types typescript --linked > src/shared/supabase/types.ts
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      children: {
        Row: { id: string; parent_id: string; name: string; birthdate: string | null; avatar: string; created_at: string };
        Insert: { id?: string; parent_id?: string; name: string; birthdate?: string | null; avatar?: string; created_at?: string };
        Update: { id?: string; parent_id?: string; name?: string; birthdate?: string | null; avatar?: string; created_at?: string };
        Relationships: [];
      };
      maths_rounds: {
        Row: {
          id: string;
          child_id: string;
          game: string;
          level: number;
          score: number;
          total: number;
          answers: Json;
          played_at: string;
          completed: boolean;
          level_max: number | null;
        };
        Insert: {
          id?: string;
          child_id: string;
          game: string;
          level: number;
          score: number;
          total: number;
          answers?: Json;
          played_at?: string;
          completed?: boolean;
          level_max?: number | null;
        };
        Update: {
          id?: string;
          child_id?: string;
          game?: string;
          level?: number;
          score?: number;
          total?: number;
          answers?: Json;
          played_at?: string;
          completed?: boolean;
          level_max?: number | null;
        };
        Relationships: [];
      };
      maths_levels: {
        Row: { child_id: string; game: string; level: number; updated_at: string };
        Insert: { child_id: string; game: string; level?: number; updated_at?: string };
        Update: { child_id?: string; game?: string; level?: number; updated_at?: string };
        Relationships: [];
      };
      maths_level_events: {
        Row: { id: string; child_id: string; game: string; from_level: number; to_level: number; reason: string; at: string };
        Insert: { id?: string; child_id: string; game: string; from_level: number; to_level: number; reason?: string; at?: string };
        Update: { id?: string; child_id?: string; game?: string; from_level?: number; to_level?: number; reason?: string; at?: string };
        Relationships: [];
      };
      maths_checkins: {
        Row: { id: string; child_id: string; probe: string; score: number; max: number | null; note: string | null; taken_on: string; created_at: string };
        Insert: { id?: string; child_id: string; probe: string; score: number; max?: number | null; note?: string | null; taken_on?: string; created_at?: string };
        Update: { id?: string; child_id?: string; probe?: string; score?: number; max?: number | null; note?: string | null; taken_on?: string; created_at?: string };
        Relationships: [];
      };
      maths_stickers: {
        Row: { id: string; child_id: string; sticker: string; shiny: boolean; round_id: string | null; earned_at: string };
        Insert: { id?: string; child_id: string; sticker: string; shiny?: boolean; round_id?: string | null; earned_at?: string };
        Update: { id?: string; child_id?: string; sticker?: string; shiny?: boolean; round_id?: string | null; earned_at?: string };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      is_my_child: { Args: { c: string }; Returns: boolean };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
