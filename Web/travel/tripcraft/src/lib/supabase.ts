import { createClient } from '@supabase/supabase-js';
import type { Database, User } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper functions for database operations
export const db = {
  // Routes operations
  async getRoutes(userId?: string) {
    let query = supabase.from('routes').select('*');
    if (userId) {
      query = query.eq('user_id', userId);
    }
    return query.order('created_at', { ascending: false });
  },

  async getRoute(id: string) {
    return supabase.from('routes').select('*').eq('id', id).single();
  },

  async createRoute(route: Omit<Route, 'id' | 'created_at' | 'updated_at'>) {
    return supabase.from('routes').insert(route).select().single();
  },

  async updateRoute(id: string, updates: Partial<Route>) {
    return supabase.from('routes').update(updates).eq('id', id).select().single();
  },

  async deleteRoute(id: string) {
    return supabase.from('routes').delete().eq('id', id);
  },

  // Spots operations
  async getSpotsByLocation(location: string) {
    return supabase.from('spots').select('*').ilike('address', `%${location}%`);
  },

  async getSpotsByCategory(category: string) {
    return supabase.from('spots').select('*').eq('category', category);
  },

  // User operations
  async getUser(id: string) {
    return supabase.from('users').select('*').eq('id', id).single();
  },

  async createUser(user: Omit<User, 'created_at' | 'updated_at'>) {
    return supabase.from('users').insert(user).select().single();
  },
};