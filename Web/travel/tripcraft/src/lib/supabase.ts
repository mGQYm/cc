import { createClient } from '@supabase/supabase-js';
import type { Database, User } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create client for client-side usage
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Create client for server-side usage with service role key
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

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

  async createRoute(route: Omit<Database['public']['Tables']['routes']['Insert'], 'id'>) {
    return supabase.from('routes').insert(route).select().single();
  },

  async updateRoute(id: string, updates: Partial<Database['public']['Tables']['routes']['Update']>) {
    return supabase.from('routes').update(updates).eq('id', id).select().single();
  },

  async deleteRoute(id: string) {
    return supabase.from('routes').delete().eq('id', id);
  },

  // Spots operations
    async getSpotsByLocation(location: string) {
    return supabase.from('spots').select('*').ilike('location', `%${location}%`);
  },

  async getSpotsByCategory(category: string) {
    return supabase.from('spots').select('*').eq('category', category);
  },

  async getAllSpots() {
    return supabase.from('spots').select('*');
  },

  // User operations
  async getUser(id: string) {
    return supabase.from('users').select('*').eq('id', id).single();
  },

  async createUser(user: Omit<User, 'created_at' | 'updated_at'>) {
    return supabase.from('users').insert(user).select().single();
  },

  // Public routes
  async getPublicRoutes(limit = 10) {
    return supabase
      .from('routes')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);
  },

  // Search functionality
  async searchSpots(query: string) {
    return supabase
      .from('spots')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`);
  },
};