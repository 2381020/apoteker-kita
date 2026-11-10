export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      chat_messages: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          content: string;
          intent: string | null;
          source: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: string;
          content: string;
          intent?: string | null;
          source?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: string;
          content?: string;
          intent?: string | null;
          source?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          date_of_birth: string | null;
          gender: string | null;
          role: Database["public"]["Enums"]["app_role"];
          avatar_url: string | null;
          notification_preferences: Json;
          medication_preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          avatar_url?: string | null;
          notification_preferences?: Json;
          medication_preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          avatar_url?: string | null;
          notification_preferences?: Json;
          medication_preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      medications: {
        Row: {
          id: string;
          name: string;
          generic_name: string;
          brand: string;
          category: string;
          description: string;
          uses: string[];
          dosage_form: string;
          strength: string;
          side_effects: string[];
          contraindications: string[];
          storage: string;
          image_url: string | null;
          is_prescription: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          generic_name?: string;
          brand?: string;
          category?: string;
          description?: string;
          uses?: string[];
          dosage_form?: string;
          strength?: string;
          side_effects?: string[];
          contraindications?: string[];
          storage?: string;
          image_url?: string | null;
          is_prescription?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          generic_name?: string;
          brand?: string;
          category?: string;
          description?: string;
          uses?: string[];
          dosage_form?: string;
          strength?: string;
          side_effects?: string[];
          contraindications?: string[];
          storage?: string;
          image_url?: string | null;
          is_prescription?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      interactions: {
        Row: {
          id: string;
          medication_a: string;
          medication_b: string;
          severity: Database["public"]["Enums"]["interaction_severity"];
          description: string;
          recommendation: string;
          source: string;
          ddinter_id: string | null;
          original_severity: string | null;
          pair_key: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          medication_a: string;
          medication_b: string;
          severity?: Database["public"]["Enums"]["interaction_severity"];
          description?: string;
          recommendation?: string;
          source?: string;
          ddinter_id?: string | null;
          original_severity?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          medication_a?: string;
          medication_b?: string;
          severity?: Database["public"]["Enums"]["interaction_severity"];
          description?: string;
          recommendation?: string;
          source?: string;
          ddinter_id?: string | null;
          original_severity?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      drug_names: {
        Row: {
          name: string;
          ddinter_id: string | null;
          created_at: string;
        };
        Insert: {
          name: string;
          ddinter_id?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          ddinter_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      pharmacies: {
        Row: {
          id: string;
          name: string;
          address: string;
          city: string;
          phone: string;
          distance: string;
          rating: number;
          is_open: boolean;
          services: string[];
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string;
          city?: string;
          phone?: string;
          distance?: string;
          rating?: number;
          is_open?: boolean;
          services?: string[];
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          city?: string;
          phone?: string;
          distance?: string;
          rating?: number;
          is_open?: boolean;
          services?: string[];
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      guides: {
        Row: {
          id: string;
          title: string;
          category: string;
          summary: string;
          content: string;
          tags: string[];
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          category?: string;
          summary?: string;
          content?: string;
          tags?: string[];
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          category?: string;
          summary?: string;
          content?: string;
          tags?: string[];
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reminders: {
        Row: {
          id: string;
          user_id: string;
          medication_name: string;
          dosage: string;
          frequency: string;
          time: string | null;
          start_date: string;
          end_date: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          medication_name: string;
          dosage?: string;
          frequency?: string;
          time?: string | null;
          start_date?: string;
          end_date?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          medication_name?: string;
          dosage?: string;
          frequency?: string;
          time?: string | null;
          start_date?: string;
          end_date?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reminders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      consumption_history: {
        Row: {
          id: string;
          user_id: string;
          medication_name: string;
          dosage: string;
          taken_at: string;
          status: Database["public"]["Enums"]["consumption_status"];
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          medication_name: string;
          dosage?: string;
          taken_at?: string;
          status?: Database["public"]["Enums"]["consumption_status"];
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          medication_name?: string;
          dosage?: string;
          taken_at?: string;
          status?: Database["public"]["Enums"]["consumption_status"];
          note?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "consumption_history_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      search_drug_names: {
        Args: { q?: string; lim?: number };
        Returns: { name: string }[];
      };
      reset_ddinter_interactions: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
    };
    Enums: {
      app_role: "patient" | "admin";
      interaction_severity: "ringan" | "sedang" | "berat" | "tidak diketahui";
      consumption_status: "ditempuh" | "lewat" | "dilewati";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
