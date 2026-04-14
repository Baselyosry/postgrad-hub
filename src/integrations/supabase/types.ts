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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admissions: {
        Row: {
          brochure_pdf_url: string | null
          created_at: string
          degree_type: string
          documents: Json
          id: string
          requirements: Json
          title: string
          updated_at: string
        }
        Insert: {
          brochure_pdf_url?: string | null
          created_at?: string
          degree_type: string
          documents?: Json
          id?: string
          requirements?: Json
          title: string
          updated_at?: string
        }
        Update: {
          brochure_pdf_url?: string | null
          created_at?: string
          degree_type?: string
          documents?: Json
          id?: string
          requirements?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean | null
          message: string
          name: string
          phone_number: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean | null
          message: string
          name: string
          phone_number?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean | null
          message?: string
          name?: string
          phone_number?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      research_archive: {
        Row: {
          abstract: string | null
          author: string
          created_at: string
          department: string | null
          file_url: string | null
          id: string
          title: string
          type: string
          updated_at: string
          year: number
        }
        Insert: {
          abstract?: string | null
          author: string
          created_at?: string
          department?: string | null
          file_url?: string | null
          id?: string
          title: string
          type: string
          updated_at?: string
          year: number
        }
        Update: {
          abstract?: string | null
          author?: string
          created_at?: string
          department?: string | null
          file_url?: string | null
          id?: string
          title?: string
          type?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      schedules: {
        Row: {
          category: string
          created_at: string
          date_info: string | null
          description: string | null
          file_url: string | null
          id: string
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          date_info?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          date_info?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      student_submissions: {
        Row: {
          abstract: string | null
          created_at: string
          degree_type: string
          department: string
          description: string
          file_url: string | null
          id: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          abstract?: string | null
          created_at?: string
          degree_type: string
          department: string
          description: string
          file_url?: string | null
          id?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          abstract?: string | null
          created_at?: string
          degree_type?: string
          department?: string
          description?: string
          file_url?: string | null
          id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          category: string
          created_at: string
          description: string | null
          file_size: string | null
          file_url: string
          id: string
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          file_size?: string | null
          file_url: string
          id?: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          file_size?: string | null
          file_url?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      admission_docs: {
        Row: {
          id: string
          section: string
          title: string
          body: string | null
          sort_order: number
          file_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          section: string
          title: string
          body?: string | null
          sort_order?: number
          file_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          section?: string
          title?: string
          body?: string | null
          sort_order?: number
          file_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          id: string
          title: string
          event_type: string
          description: string | null
          starts_at: string | null
          location: string | null
          image_url: string | null
          time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          event_type?: string
          description?: string | null
          starts_at?: string | null
          location?: string | null
          image_url?: string | null
          time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          event_type?: string
          description?: string | null
          starts_at?: string | null
          location?: string | null
          image_url?: string | null
          time?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_posts: {
        Row: {
          id: string
          title: string
          slug: string | null
          excerpt: string | null
          body: string
          image_url: string | null
          author: string | null
          is_featured: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug?: string | null
          excerpt?: string | null
          body?: string
          image_url?: string | null
          author?: string | null
          is_featured?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string | null
          excerpt?: string | null
          body?: string
          image_url?: string | null
          author?: string | null
          is_featured?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      research_database: {
        Row: {
          id: string
          title: string
          authors: string
          year: number
          keywords: string | null
          abstract: string
          publication_place: string
          url: string | null
          pdf_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          authors: string
          year: number
          keywords?: string | null
          abstract: string
          publication_place: string
          url?: string | null
          pdf_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          authors?: string
          year?: number
          keywords?: string | null
          abstract?: string
          publication_place?: string
          url?: string | null
          pdf_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      research_plans: {
        Row: {
          id: string
          title: string
          summary: string | null
          milestones: string | null
          file_url: string | null
          regulation_track: string
          program_group: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          summary?: string | null
          milestones?: string | null
          file_url?: string | null
          regulation_track?: string
          program_group?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          summary?: string | null
          milestones?: string | null
          file_url?: string | null
          regulation_track?: string
          program_group?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_offerings: {
        Row: {
          id: string
          slug: string
          title: string
          description: string | null
          primary_url: string | null
          info_url: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          description?: string | null
          primary_url?: string | null
          info_url?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          description?: string | null
          primary_url?: string | null
          info_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      staff_cv: {
        Row: {
          id: string
          display_name: string
          department: string | null
          photo_url: string | null
          cv_pdf_url: string | null
          google_scholar_url: string | null
          personal_data: Json
          qualifications: Json
          experience: Json
          skills: Json
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          display_name: string
          department?: string | null
          photo_url?: string | null
          cv_pdf_url?: string | null
          google_scholar_url?: string | null
          personal_data?: Json
          qualifications?: Json
          experience?: Json
          skills?: Json
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          department?: string | null
          photo_url?: string | null
          cv_pdf_url?: string | null
          google_scholar_url?: string | null
          personal_data?: Json
          qualifications?: Json
          experience?: Json
          skills?: Json
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      thesis_upload_submissions: {
        Row: {
          id: string
          user_id: string | null
          submission_type: string
          thesis_name: string
          supervisor_name: string
          student_name: string
          student_id: string
          file_url: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          submission_type: string
          thesis_name: string
          supervisor_name: string
          student_name: string
          student_id: string
          file_url: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          submission_type?: string
          thesis_name?: string
          supervisor_name?: string
          student_name?: string
          student_id?: string
          file_url?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      study_plans: {
        Row: {
          id: string
          title: string
          program: string | null
          description: string | null
          file_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          program?: string | null
          description?: string | null
          file_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          program?: string | null
          description?: string | null
          file_url?: string | null
          created_at?: string
          updated_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "student"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "student"],
    },
  },
} as const
