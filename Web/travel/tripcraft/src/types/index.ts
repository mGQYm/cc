export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface Spot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  description?: string;
  duration: number; // in minutes
  category?: string;
  rating?: number;
  price?: number;
  images?: string[];
}

export interface RouteDay {
  date: string;
  spots: Spot[];
  total_duration: number;
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  category?: string;
}

export interface Checklist {
  id: string;
  name: string;
  items: ChecklistItem[];
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: 'transport' | 'accommodation' | 'food' | 'activities' | 'shopping' | 'other';
  date: string;
  notes?: string;
}

export interface RouteDay {
  date: string;
  spots: Spot[];
  total_duration: number;
  notes?: string;
}

export interface Route {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  location: string;
  days: RouteDay[];
  total_days: number;
  interests: string[];
  budget_level: 1 | 2 | 3; // 1: budget, 2: standard, 3: luxury
  budget: number;
  expenses: Expense[];
  checklist: Checklist;
  notes?: string;
  collaborators?: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
  share_token?: string;
}

export interface RouteGenerationRequest {
  location: string;
  days: number;
  interests: string[];
  budgetLevel: 1 | 2 | 3;
}

export interface RouteGenerationResponse {
  routes: Route[];
}

export interface MapBounds {
  northeast: { lat: number; lng: number };
  southwest: { lat: number; lng: number };
}

// Database schema types for Supabase
export interface Database {
  public: {
    Tables: {
      routes: {
        Row: Route;
        Insert: Omit<Route, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Route>;
      };
      spots: {
        Row: Spot;
        Insert: Omit<Spot, 'id'>;
        Update: Partial<Spot>;
      };
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<User>;
      };
    };
  };
}