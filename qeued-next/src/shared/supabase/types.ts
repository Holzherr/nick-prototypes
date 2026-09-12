export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      actors: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          image_url: string | null
          name: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
        }
        Relationships: []
      }
      agent_activity: {
        Row: {
          created_at: string
          id: string
          profile_id: string | null
          summary: string | null
          tool: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id?: string | null
          summary?: string | null
          tool: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string | null
          summary?: string | null
          tool?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_activity_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_tokens: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          label: string | null
          last_used_at: string | null
          profile_id: string
          revoked_at: string | null
          scopes: string[]
          token_hash: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          label?: string | null
          last_used_at?: string | null
          profile_id: string
          revoked_at?: string | null
          scopes?: string[]
          token_hash: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          label?: string | null
          last_used_at?: string | null
          profile_id?: string
          revoked_at?: string | null
          scopes?: string[]
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_tokens_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_cache: {
        Row: {
          cache_key: string
          created_at: string
          expires_at: string
          id: string
          response_data: Json
        }
        Insert: {
          cache_key: string
          created_at?: string
          expires_at?: string
          id?: string
          response_data: Json
        }
        Update: {
          cache_key?: string
          created_at?: string
          expires_at?: string
          id?: string
          response_data?: Json
        }
        Relationships: []
      }
      connections: {
        Row: {
          created_at: string
          id: string
          invite_code: string | null
          status: Database["public"]["Enums"]["connection_status"]
          user_1: string
          user_2: string
        }
        Insert: {
          created_at?: string
          id?: string
          invite_code?: string | null
          status?: Database["public"]["Enums"]["connection_status"]
          user_1: string
          user_2: string
        }
        Update: {
          created_at?: string
          id?: string
          invite_code?: string | null
          status?: Database["public"]["Enums"]["connection_status"]
          user_1?: string
          user_2?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          created_at: string
          group_id: string
          id: string
          profile_id: string
          role: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          profile_id: string
          role?: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          profile_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          id: string
          invite_code: string
          name: string
          owner_user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invite_code?: string
          name: string
          owner_user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invite_code?: string
          name?: string
          owner_user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          claim_code: string | null
          colour: string | null
          created_at: string
          id: string
          is_public: boolean
          max_certification: string | null
          name: string | null
          owner_user_id: string | null
          provisioned_at: string | null
          provisioned_by: string | null
          updated_at: string
          user_id: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          claim_code?: string | null
          colour?: string | null
          created_at?: string
          id?: string
          is_public?: boolean
          max_certification?: string | null
          name?: string | null
          owner_user_id?: string | null
          provisioned_at?: string | null
          provisioned_by?: string | null
          updated_at?: string
          user_id?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          claim_code?: string | null
          colour?: string | null
          created_at?: string
          id?: string
          is_public?: boolean
          max_certification?: string | null
          name?: string | null
          owner_user_id?: string | null
          provisioned_at?: string | null
          provisioned_by?: string | null
          updated_at?: string
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      skipped_recommendations: {
        Row: {
          expires_at: string
          id: string
          skipped_at: string
          title_name: string
          user_id: string
        }
        Insert: {
          expires_at?: string
          id?: string
          skipped_at?: string
          title_name: string
          user_id: string
        }
        Update: {
          expires_at?: string
          id?: string
          skipped_at?: string
          title_name?: string
          user_id?: string
        }
        Relationships: []
      }
      title_actors: {
        Row: {
          actor_id: string
          character_name: string | null
          display_order: number
          id: string
          title_id: string
        }
        Insert: {
          actor_id: string
          character_name?: string | null
          display_order?: number
          id?: string
          title_id: string
        }
        Update: {
          actor_id?: string
          character_name?: string | null
          display_order?: number
          id?: string
          title_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "title_actors_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "actors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "title_actors_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "titles"
            referencedColumns: ["id"]
          },
        ]
      }
      title_availability: {
        Row: {
          checked_at: string
          expires_at: string
          id: string
          note: string | null
          offer_type: string
          provider: string
          region: string
          title_id: string
          url: string | null
        }
        Insert: {
          checked_at?: string
          expires_at?: string
          id?: string
          note?: string | null
          offer_type: string
          provider: string
          region?: string
          title_id: string
          url?: string | null
        }
        Update: {
          checked_at?: string
          expires_at?: string
          id?: string
          note?: string | null
          offer_type?: string
          provider?: string
          region?: string
          title_id?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "title_availability_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "titles"
            referencedColumns: ["id"]
          },
        ]
      }
      title_sources: {
        Row: {
          field: string
          id: string
          retrieved_at: string
          source_name: string | null
          source_url: string
          title_id: string
        }
        Insert: {
          field: string
          id?: string
          retrieved_at?: string
          source_name?: string | null
          source_url: string
          title_id: string
        }
        Update: {
          field?: string
          id?: string
          retrieved_at?: string
          source_name?: string | null
          source_url?: string
          title_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "title_sources_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "titles"
            referencedColumns: ["id"]
          },
        ]
      }
      titles: {
        Row: {
          cast_members: string[] | null
          catalogue_version: number
          catalogued_at: string | null
          certification: string | null
          countries: string[]
          created_at: string
          description: string | null
          director: string | null
          enriched: boolean
          episodes: number | null
          genres: string[]
          id: string
          image_attribution: string | null
          image_license: string | null
          image_source_url: string | null
          image_url: string | null
          imdb_rating: number | null
          imdb_url: string | null
          languages: string[]
          name: string
          production_status: string | null
          rt_rating: number | null
          rt_url: string | null
          runtime_minutes: number | null
          seasons: number | null
          slug: string | null
          synopsis: string | null
          tagline: string | null
          type: Database["public"]["Enums"]["title_type"]
          year: number | null
        }
        Insert: {
          cast_members?: string[] | null
          catalogue_version?: number
          catalogued_at?: string | null
          certification?: string | null
          countries?: string[]
          created_at?: string
          description?: string | null
          director?: string | null
          enriched?: boolean
          episodes?: number | null
          genres?: string[]
          id?: string
          image_attribution?: string | null
          image_license?: string | null
          image_source_url?: string | null
          image_url?: string | null
          imdb_rating?: number | null
          imdb_url?: string | null
          languages?: string[]
          name: string
          production_status?: string | null
          rt_rating?: number | null
          rt_url?: string | null
          runtime_minutes?: number | null
          seasons?: number | null
          slug?: string | null
          synopsis?: string | null
          tagline?: string | null
          type?: Database["public"]["Enums"]["title_type"]
          year?: number | null
        }
        Update: {
          cast_members?: string[] | null
          catalogue_version?: number
          catalogued_at?: string | null
          certification?: string | null
          countries?: string[]
          created_at?: string
          description?: string | null
          director?: string | null
          enriched?: boolean
          episodes?: number | null
          genres?: string[]
          id?: string
          image_attribution?: string | null
          image_license?: string | null
          image_source_url?: string | null
          image_url?: string | null
          imdb_rating?: number | null
          imdb_url?: string | null
          languages?: string[]
          name?: string
          production_status?: string | null
          rt_rating?: number | null
          rt_url?: string | null
          runtime_minutes?: number | null
          seasons?: number | null
          slug?: string | null
          synopsis?: string | null
          tagline?: string | null
          type?: Database["public"]["Enums"]["title_type"]
          year?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      watch_entries: {
        Row: {
          created_at: string
          desire_ranking: number | null
          id: string
          notes: string | null
          profile_id: string
          review: string | null
          status: Database["public"]["Enums"]["watch_status"]
          title_id: string
          updated_at: string
          user_id: string | null
          watched_date: string | null
          watched_rating: number | null
        }
        Insert: {
          created_at?: string
          desire_ranking?: number | null
          id?: string
          notes?: string | null
          profile_id: string
          review?: string | null
          status?: Database["public"]["Enums"]["watch_status"]
          title_id: string
          updated_at?: string
          user_id?: string | null
          watched_date?: string | null
          watched_rating?: number | null
        }
        Update: {
          created_at?: string
          desire_ranking?: number | null
          id?: string
          notes?: string | null
          profile_id?: string
          review?: string | null
          status?: Database["public"]["Enums"]["watch_status"]
          title_id?: string
          updated_at?: string
          user_id?: string | null
          watched_date?: string | null
          watched_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "watch_entries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watch_entries_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "titles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      account_in_group: {
        Args: { p_group_id: string; p_user_id: string }
        Returns: boolean
      }
      account_shares_group_with_profile: {
        Args: { p_profile_id: string; p_user_id: string }
        Returns: boolean
      }
      claim_profile: { Args: { p_claim_code: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      title_slug: { Args: { p_name: string; p_year: number }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      connection_status: "pending" | "accepted"
      title_type: "movie" | "series"
      watch_status: "watched" | "watching" | "want_to_watch" | "dropped"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      connection_status: ["pending", "accepted"],
      title_type: ["movie", "series"],
      watch_status: ["watched", "watching", "want_to_watch", "dropped"],
    },
  },
} as const
