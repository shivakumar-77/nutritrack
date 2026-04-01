import { createBrowserClient } from '@supabase/ssr'
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
export interface Profile {
  id:string;name:string;goal:string;cal_target:number;protein_target:number
  carb_target:number;fat_target:number;fiber_target:number;weight_goal:number
  water_goal:number;reminder_times:string[]
}
export interface FoodLog {
  id:string;user_id:string;logged_at:string;name:string;qty:number;unit:string
  cal:number;protein:number;carb:number;fat:number;fiber:number;meal_type:string
}
export interface WeightLog{id:string;logged_at:string;weight_kg:number}
