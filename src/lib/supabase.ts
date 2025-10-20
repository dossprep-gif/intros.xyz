import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          position?: string
          location?: string
          bio?: string
          education?: string
          expertise?: string[]
          hobbies?: string[]
          adjectives?: string[]
          social_links?: Record<string, string>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          position?: string
          location?: string
          bio?: string
          education?: string
          expertise?: string[]
          hobbies?: string[]
          adjectives?: string[]
          social_links?: Record<string, string>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          position?: string
          location?: string
          bio?: string
          education?: string
          expertise?: string[]
          hobbies?: string[]
          adjectives?: string[]
          social_links?: Record<string, string>
          created_at?: string
          updated_at?: string
        }
      }
      introductions: {
        Row: {
          id: string
          user_id: string
          person_a_name: string
          person_a_email?: string
          person_a_phone?: string
          person_b_name: string
          person_b_email?: string
          person_b_phone?: string
          notes?: string
          verified: boolean
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          person_a_name: string
          person_a_email?: string
          person_a_phone?: string
          person_b_name: string
          person_b_email?: string
          person_b_phone?: string
          notes?: string
          verified?: boolean
          date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          person_a_name?: string
          person_a_email?: string
          person_a_phone?: string
          person_b_name?: string
          person_b_email?: string
          person_b_phone?: string
          notes?: string
          verified?: boolean
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
