export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          country: string | null
          rating: number
          games_played: number
          puzzles_solved: number
          xp: number
          lessons_completed: number
          wins: number
          losses: number
          draws: number
          avatar_url: string | null
          updated_at: string
          completed_lessons: string[]
          minigame_scores: Json
          achievements: Json
          activity_log: Json
          daily_quests: Json
          streak: number
          last_active_date: string | null
        }
        Insert: {
          id: string
          username: string
          country?: string | null
          rating?: number
          games_played?: number
          puzzles_solved?: number
          xp?: number
          lessons_completed?: number
          wins?: number
          losses?: number
          draws?: number
          avatar_url?: string | null
          updated_at?: string
          completed_lessons?: string[]
          minigame_scores?: Json
          achievements?: Json
          activity_log?: Json
          daily_quests?: Json
          streak?: number
          last_active_date?: string | null
        }
        Update: {
          id?: string
          username?: string
          country?: string | null
          rating?: number
          games_played?: number
          puzzles_solved?: number
          xp?: number
          lessons_completed?: number
          wins?: number
          losses?: number
          draws?: number
          avatar_url?: string | null
          updated_at?: string
          completed_lessons?: string[]
          minigame_scores?: Json
          achievements?: Json
          activity_log?: Json
          daily_quests?: Json
          streak?: number
          last_active_date?: string | null
        }
      }
      game_history: {
        Row: {
          id: string
          user_id: string
          pgn: string
          fen: string
          result: string
          player_color: string
          opponent_name: string
          move_count: number
          time_control: string | null
          white_avatar: string | null
          black_avatar: string | null
          platform: string | null
          created_at: string
        }
        Insert: {
          id: string
          user_id: string
          pgn: string
          fen: string
          result: string
          player_color: string
          opponent_name: string
          move_count?: number
          time_control?: string | null
          white_avatar?: string | null
          black_avatar?: string | null
          platform?: string | null
          created_at?: string
        }
        Update: {
          pgn?: string
          fen?: string
          result?: string
          player_color?: string
          opponent_name?: string
          move_count?: number
          time_control?: string | null
          white_avatar?: string | null
          black_avatar?: string | null
          platform?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
