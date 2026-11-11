export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      addons: {
        Row: {
          amount: number | null;
          created_at: string;
          description: string;
          duration_min: number;
          id: string;
          is_demo: boolean;
          is_published: boolean;
          name: string;
          pet_scope: Database["public"]["Enums"]["pet_scope"];
          price_type: Database["public"]["Enums"]["price_type"];
          sort_order: number;
          updated_at: string;
          updated_by: string | null;
        };
        ComputedFields: never;
        Insert: {
          amount?: number | null;
          created_at?: string;
          description?: string;
          duration_min?: number;
          id?: string;
          is_demo?: boolean;
          is_published?: boolean;
          name: string;
          pet_scope: Database["public"]["Enums"]["pet_scope"];
          price_type: Database["public"]["Enums"]["price_type"];
          sort_order?: number;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          amount?: number | null;
          created_at?: string;
          description?: string;
          duration_min?: number;
          id?: string;
          is_demo?: boolean;
          is_published?: boolean;
          name?: string;
          pet_scope?: Database["public"]["Enums"]["pet_scope"];
          price_type?: Database["public"]["Enums"]["price_type"];
          sort_order?: number;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      business_profile: {
        Row: {
          address: string;
          business_name: string;
          created_at: string;
          email: string | null;
          id: boolean;
          instagram_url: string | null;
          map_embed_url: string | null;
          maps_url: string | null;
          phone_e164: string | null;
          slogan: string | null;
          updated_at: string;
          updated_by: string | null;
          whatsapp_e164: string | null;
        };
        ComputedFields: never;
        Insert: {
          address: string;
          business_name: string;
          created_at?: string;
          email?: string | null;
          id?: boolean;
          instagram_url?: string | null;
          map_embed_url?: string | null;
          maps_url?: string | null;
          phone_e164?: string | null;
          slogan?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          whatsapp_e164?: string | null;
        };
        Update: {
          address?: string;
          business_name?: string;
          created_at?: string;
          email?: string | null;
          id?: boolean;
          instagram_url?: string | null;
          map_embed_url?: string | null;
          maps_url?: string | null;
          phone_e164?: string | null;
          slogan?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          whatsapp_e164?: string | null;
        };
        Relationships: [];
      };
      closures: {
        Row: {
          created_at: string;
          ends_at: string;
          id: string;
          internal_note: string | null;
          public_note: string | null;
          starts_at: string;
          updated_at: string;
          updated_by: string | null;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          ends_at: string;
          id?: string;
          internal_note?: string | null;
          public_note?: string | null;
          starts_at: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          created_at?: string;
          ends_at?: string;
          id?: string;
          internal_note?: string | null;
          public_note?: string | null;
          starts_at?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      faq_items: {
        Row: {
          answer: string;
          created_at: string;
          id: string;
          is_demo: boolean;
          is_published: boolean;
          question: string;
          sort_order: number;
          updated_at: string;
          updated_by: string | null;
        };
        ComputedFields: never;
        Insert: {
          answer: string;
          created_at?: string;
          id?: string;
          is_demo?: boolean;
          is_published?: boolean;
          question: string;
          sort_order?: number;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          answer?: string;
          created_at?: string;
          id?: string;
          is_demo?: boolean;
          is_published?: boolean;
          question?: string;
          sort_order?: number;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      media: {
        Row: {
          alt_text: string;
          caption: string | null;
          category: Database["public"]["Enums"]["pet_type"] | null;
          created_at: string;
          credit: string | null;
          file_ext: string;
          height: number;
          id: string;
          is_demo: boolean;
          is_published: boolean;
          kind: Database["public"]["Enums"]["media_kind"];
          sort_order: number;
          storage_prefix: string;
          updated_at: string;
          updated_by: string | null;
          width: number;
          widths: number[];
        };
        ComputedFields: never;
        Insert: {
          alt_text: string;
          caption?: string | null;
          category?: Database["public"]["Enums"]["pet_type"] | null;
          created_at?: string;
          credit?: string | null;
          file_ext: string;
          height: number;
          id?: string;
          is_demo?: boolean;
          is_published?: boolean;
          kind: Database["public"]["Enums"]["media_kind"];
          sort_order?: number;
          storage_prefix: string;
          updated_at?: string;
          updated_by?: string | null;
          width: number;
          widths: number[];
        };
        Update: {
          alt_text?: string;
          caption?: string | null;
          category?: Database["public"]["Enums"]["pet_type"] | null;
          created_at?: string;
          credit?: string | null;
          file_ext?: string;
          height?: number;
          id?: string;
          is_demo?: boolean;
          is_published?: boolean;
          kind?: Database["public"]["Enums"]["media_kind"];
          sort_order?: number;
          storage_prefix?: string;
          updated_at?: string;
          updated_by?: string | null;
          width?: number;
          widths?: number[];
        };
        Relationships: [];
      };
      opening_hours: {
        Row: {
          closes_at: string;
          created_at: string;
          id: string;
          opens_at: string;
          updated_at: string;
          updated_by: string | null;
          weekday: number;
        };
        ComputedFields: never;
        Insert: {
          closes_at: string;
          created_at?: string;
          id?: string;
          opens_at: string;
          updated_at?: string;
          updated_by?: string | null;
          weekday: number;
        };
        Update: {
          closes_at?: string;
          created_at?: string;
          id?: string;
          opens_at?: string;
          updated_at?: string;
          updated_by?: string | null;
          weekday?: number;
        };
        Relationships: [];
      };
      service_prices: {
        Row: {
          amount: number | null;
          created_at: string;
          duration_min: number | null;
          id: string;
          is_demo: boolean;
          price_type: Database["public"]["Enums"]["price_type"];
          service_id: string;
          tier: Database["public"]["Enums"]["price_tier"];
          updated_at: string;
          updated_by: string | null;
        };
        ComputedFields: never;
        Insert: {
          amount?: number | null;
          created_at?: string;
          duration_min?: number | null;
          id?: string;
          is_demo?: boolean;
          price_type: Database["public"]["Enums"]["price_type"];
          service_id: string;
          tier: Database["public"]["Enums"]["price_tier"];
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          amount?: number | null;
          created_at?: string;
          duration_min?: number | null;
          id?: string;
          is_demo?: boolean;
          price_type?: Database["public"]["Enums"]["price_type"];
          service_id?: string;
          tier?: Database["public"]["Enums"]["price_tier"];
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "service_prices_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };
      services: {
        Row: {
          category: Database["public"]["Enums"]["service_category"];
          created_at: string;
          description: string;
          id: string;
          image_id: string | null;
          is_demo: boolean;
          is_published: boolean;
          name: string;
          pet_scope: Database["public"]["Enums"]["pet_scope"];
          sort_order: number;
          updated_at: string;
          updated_by: string | null;
        };
        ComputedFields: never;
        Insert: {
          category: Database["public"]["Enums"]["service_category"];
          created_at?: string;
          description?: string;
          id?: string;
          image_id?: string | null;
          is_demo?: boolean;
          is_published?: boolean;
          name: string;
          pet_scope: Database["public"]["Enums"]["pet_scope"];
          sort_order?: number;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          category?: Database["public"]["Enums"]["service_category"];
          created_at?: string;
          description?: string;
          id?: string;
          image_id?: string | null;
          is_demo?: boolean;
          is_published?: boolean;
          name?: string;
          pet_scope?: Database["public"]["Enums"]["pet_scope"];
          sort_order?: number;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "services_image_id_fkey";
            columns: ["image_id"];
            isOneToOne: false;
            referencedRelation: "media";
            referencedColumns: ["id"];
          },
        ];
      };
      site_texts: {
        Row: {
          about_markdown: string;
          created_at: string;
          hero_subtitle: string;
          hero_text: string;
          hero_title: string;
          id: boolean;
          updated_at: string;
          updated_by: string | null;
          welcome_text: string;
        };
        ComputedFields: never;
        Insert: {
          about_markdown: string;
          created_at?: string;
          hero_subtitle: string;
          hero_text: string;
          hero_title: string;
          id?: boolean;
          updated_at?: string;
          updated_by?: string | null;
          welcome_text: string;
        };
        Update: {
          about_markdown?: string;
          created_at?: string;
          hero_subtitle?: string;
          hero_text?: string;
          hero_title?: string;
          id?: boolean;
          updated_at?: string;
          updated_by?: string | null;
          welcome_text?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      health_check: { Args: Record<PropertyKey, never>; Returns: boolean };
    };
    Enums: {
      media_kind: "hero" | "gallery" | "instagram" | "about" | "service";
      pet_scope: "cat" | "dog" | "both";
      pet_type: "cat" | "dog";
      price_tier: "cat" | "dog_small" | "dog_medium" | "dog_large";
      price_type: "fixed" | "starting_from" | "contact";
      service_category: "cat_care" | "dog_care" | "general";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      media_kind: ["hero", "gallery", "instagram", "about", "service"],
      pet_scope: ["cat", "dog", "both"],
      pet_type: ["cat", "dog"],
      price_tier: ["cat", "dog_small", "dog_medium", "dog_large"],
      price_type: ["fixed", "starting_from", "contact"],
      service_category: ["cat_care", "dog_care", "general"],
    },
  },
} as const;
