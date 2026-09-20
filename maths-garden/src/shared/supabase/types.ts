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
      // Anonymous counting. Insert-only by policy: there is no select policy, so these rows are reachable
      // only to the project owner in SQL.
      maths_events: {
        Row: { id: string; name: string; path: string | null; ref: string | null; session: string | null; at: string };
        Insert: { id?: string; name: string; path?: string | null; ref?: string | null; session?: string | null; at?: string };
        Update: { id?: string; name?: string; path?: string | null; ref?: string | null; session?: string | null; at?: string };
        Relationships: [];
      };
      // What people write in the feedback box. Insert-only by policy for the same reason as the events
      // above, and more sharply: an open select would hand every visitor everyone else's messages and
      // their contact addresses.
      // `reporter` and `kind` arrive with migration 0007 and are nullable: a message with neither still lands.
      maths_feedback: {
        Row: {
          id: string;
          message: string;
          contact: string | null;
          path: string | null;
          locale: string | null;
          session: string | null;
          reporter: string | null;
          kind: string | null;
          at: string;
        };
        Insert: {
          id?: string;
          message: string;
          contact?: string | null;
          path?: string | null;
          locale?: string | null;
          session?: string | null;
          reporter?: string | null;
          kind?: string | null;
          at?: string;
        };
        Update: {
          id?: string;
          message?: string;
          contact?: string | null;
          path?: string | null;
          locale?: string | null;
          session?: string | null;
          reporter?: string | null;
          kind?: string | null;
          at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      is_my_child: { Args: { c: string }; Returns: boolean };
      delete_my_account: { Args: Record<string, never>; Returns: undefined };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
