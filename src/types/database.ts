export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          role: "buyer" | "seller" | "admin";
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          role?: "buyer" | "seller" | "admin";
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          role?: "buyer" | "seller" | "admin";
          created_at?: string;
        };
      };
      shops: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string | null;
          address: string;
          latitude: number;
          longitude: number;
          phone: string | null;
          is_verified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          description?: string | null;
          address: string;
          latitude: number;
          longitude: number;
          phone?: string | null;
          is_verified?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          description?: string | null;
          address?: string;
          latitude?: number;
          longitude?: number;
          phone?: string | null;
          is_verified?: boolean;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          shop_id: string;
          name: string;
          description: string | null;
          price: number;
          stock: number;
          image_url: string | null;
          category: string | null;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          name: string;
          description?: string | null;
          price: number;
          stock?: number;
          image_url?: string | null;
          category?: string | null;
          updated_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          shop_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          stock?: number;
          image_url?: string | null;
          category?: string | null;
          updated_at?: string;
          created_at?: string;
        };
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
  };
}
